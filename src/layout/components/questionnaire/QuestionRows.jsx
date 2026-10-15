import {
    ActionIcon,
    Anchor,
    Box,
    Button,
    Checkbox,
    Group,
    Stack,
    Switch,
    Table,
    Text,
    Tooltip,
    UnstyledButton,
} from "@mantine/core";
import { IconCornerDownRight, IconEqual, IconPlus } from "@tabler/icons-react";
import { Fragment, useEffect, useRef, useState } from "react";
import "./QuestionRows.css";
import StatusPill, { Pill } from "./StatusPill";
import {
    DROP_MARK,
    PARENT_TYPES,
    QUESTION_DRAG,
    dragBadge,
    nameList,
    plural,
    reordered,
    shortTypeLabel,
    usedIn,
} from "./constants";
import { localise } from "./localise";
import { EmptyState, SectionHeading } from "./shell";
import { dataTableProps } from "./tableStyles";

// The column headings every questionnaire table has.
const heading = dataTableProps.defaultColumnProps.titleStyle;

// Why the switch of one field of a list page does not move.
// The server's own sentences for the switch it will refuse (a list is headed
// by its first field; hiding the section that holds it would hide it too).
const lockedWhy = (row) =>
    row.type === "section"
        ? "This section holds the field that names each entry, so it cannot be hidden."
        : "This field names each entry, so it cannot be hidden.";

/**
 * Everything set about a question, each with the place that set it — the
 * pill names only the first. `row.from` holds a place id per part (null:
 * the Master's); a question a place added names that place first.
 */
const setBy = (row, places) => {
    const name = (id) => places?.[id]?.name;
    const { from = {} } = row;
    const lines = [
        row.ownerPlaceId && name(row.ownerPlaceId) && `Added in ${name(row.ownerPlaceId)}`,
        name(from.asked) &&
            `${row.asked ? "Switched back on" : "Hidden"} in ${name(from.asked)}`,
        name(from.label) && `Question reworded in ${name(from.label)}`,
        name(from.helper_text) && `Helper text set in ${name(from.helper_text)}`,
        name(from.required) &&
            `Made ${row.required ? "required" : "optional"} in ${name(from.required)}`,
        name(from.options) && `Options changed in ${name(from.options)}`,
    ].filter(Boolean);
    return lines.length > 0 ? lines.join("\n") : "Nothing is set for it: as in the Master.";
};

const sameParent = (a, b) =>
    (a.parentQuestionId || null) === (b.parentQuestionId || null);

/**
 * The questions of the editor's right pane (PDF p.2 and p.9), or search
 * results across every category (p.14) when `grouped`.
 *
 * A plain Table, not mantine-datatable: rows are dragged or ticked, and
 * results are broken up by headings. `rows` arrives flat and in order: a
 * field of a group or section is a row of its own with a `depth`; a result
 * carries the `group` heading it belongs under. Nothing is saved here.
 *
 * In the Master a row is dragged by its handle: in front of or after
 * another row, beside it; onto a group or a section, inside it; or onto a
 * page of the category tree (which reads QUESTION_DRAG). A ticked row takes
 * every ticked one along, and a group what is in it. From the keyboard,
 * Alt+↑ / Alt+↓ move it among its neighbours, Alt+→ / Alt+← into the group
 * above it and out of its own. `onArrange(rows, { parentQuestionId, before
 * })` is told where they go; `onReorder` only of a new order. Results are in
 * no order of their own, so they have no handle. The officers'
 * questionnaire is listed the same way, without the column on where a
 * question is used.
 *
 * In a place (`placeName` is its name) nothing is reordered. A row says what
 * the place did to the question and carries the switch that decides whether
 * the place asks it (`onAsk`); `ticked` is the Set of ids chosen for the bar
 * that acts on several at once (`onTick(ids, on)`).
 */
export default function QuestionRows({
    scope,
    placeName,
    placeNames,
    rows,
    language,
    grouped = false,
    emptyNote,
    ticked,
    onOpen,
    onAdd,
    onRestore,
    onReorder,
    onArrange,
    onTick,
    onAsk,
}) {
    const master = scope.type === "master";
    // The Master's last column says what places did to a question. No place
    // changes the officers' questionnaire, so there it has nothing to say.
    const showsUse = master && scope.audience !== "officer";
    const sortable = master && !grouped;
    // A place ticks questions for its bar; the Master ticks them to move
    // several at once.
    const tickable = !master || sortable;
    // What is being dragged: one row, or every ticked one.
    const [dragging, setDragging] = useState(null);
    const [over, setOver] = useState(null);

    // A keyboard move re-inserts the row in the page, and a browser drops
    // focus from an element that is moved. It is put back once the new
    // order is drawn, so the shortcut can be pressed again.
    const refocus = useRef(null);
    useEffect(() => {
        if (!refocus.current) return;
        document.getElementById(refocus.current)?.focus();
        refocus.current = null;
    }, [rows]);

    if (rows.length === 0)
        return grouped ? null : (
            <EmptyState
                title="No questions yet"
                description={emptyNote}
                action={
                    <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
                        Add question
                    </Button>
                }
            />
        );

    const siblingsOf = (row) => rows.filter((other) => sameParent(other, row));
    const byId = new Map(rows.map((row) => [row._id, row]));
    const ancestorsOf = (row) => {
        const found = [];
        let current = byId.get(row.parentQuestionId);
        while (current && !found.includes(current)) {
            found.push(current);
            current = byId.get(current.parentQuestionId);
        }
        return found;
    };
    // The repeating groups a question holds along its deepest branch, itself
    // included, and those around a parent, itself included: two deep at
    // most, as the server holds them.
    const groupsIn = (row) =>
        (row.type === "repeatable_group" ? 1 : 0) +
        Math.max(0, ...(row.children || []).map(groupsIn));
    const groupsAround = (parent) =>
        [parent, ...ancestorsOf(parent)].filter(
            (row) => row.type === "repeatable_group"
        ).length;
    /** Whether `moving` may go inside `parent` (null: the top of the page). */
    const canGoInto = (moving, parent) => {
        if (!parent) return true;
        if (!PARENT_TYPES.includes(parent.type)) return false;
        const ids = new Set(moving.map((row) => row._id));
        if ([parent, ...ancestorsOf(parent)].some((row) => ids.has(row._id)))
            return false;
        if (
            parent.type === "section" &&
            moving.some((row) => row.type === "section")
        )
            return false;
        return moving.every(
            (row) => groupsAround(parent) + groupsIn(row) <= 2
        );
    };

    const nudge = (row, by) => {
        const siblings = siblingsOf(row);
        const index = siblings.findIndex((entry) => entry._id === row._id) + by;
        if (index < 0 || index >= siblings.length) return;
        refocus.current = `handle-${row._id}`;
        onReorder(reordered(siblings, row, index));
    };

    // Alt+→ puts a question inside the group or section just above it, at
    // its end; Alt+← takes it out, to just after the one it was in.
    const shift = (row, inward) => {
        if (inward) {
            const siblings = siblingsOf(row);
            const above =
                siblings[siblings.findIndex((entry) => entry._id === row._id) - 1];
            if (!above || !canGoInto([row], above)) return;
            refocus.current = `handle-${row._id}`;
            onArrange([row], { parentQuestionId: above._id, before: null });
            return;
        }
        const parent = byId.get(row.parentQuestionId);
        if (!parent) return;
        const outside = byId.get(parent.parentQuestionId) || null;
        if (!canGoInto([row], outside)) return;
        const around = siblingsOf(parent);
        const next = around[around.findIndex((entry) => entry._id === parent._id) + 1];
        refocus.current = `handle-${row._id}`;
        onArrange([row], {
            parentQuestionId: outside?._id || null,
            before: next?._id || null,
        });
    };

    // Where a drop lands. On a group or a section, all but its top edge
    // puts the questions inside it, at the top; on any other row they go in
    // front of it or after it, beside it.
    const zoneOf = (event, row) => {
        const box = event.currentTarget.getBoundingClientRect();
        const share = (event.clientY - box.top) / box.height;
        if (PARENT_TYPES.includes(row.type))
            return share < 0.35 ? "before" : "inside";
        return share < 0.5 ? "before" : "after";
    };
    const placeFor = (target, zone) => {
        const moving = new Set(dragging.map((row) => row._id));
        if (zone === "inside")
            return {
                parent: target,
                before:
                    rows.find(
                        (row) =>
                            row.parentQuestionId === target._id &&
                            !moving.has(row._id)
                    )?._id || null,
            };
        const parent = byId.get(target.parentQuestionId) || null;
        if (zone === "before") return { parent, before: target._id };
        const siblings = siblingsOf(target).filter((row) => !moving.has(row._id));
        const index = siblings.findIndex((row) => row._id === target._id);
        return { parent, before: siblings[index + 1]?._id || null };
    };
    const accepts = (target, zone) => {
        if (!dragging) return false;
        const moving = new Set(dragging.map((row) => row._id));
        // Not onto itself, nor anywhere inside what is moving.
        if ([target, ...ancestorsOf(target)].some((row) => moving.has(row._id)))
            return false;
        return canGoInto(dragging, placeFor(target, zone).parent);
    };
    const arrangeTo = (place) => {
        onArrange(dragging, {
            parentQuestionId: place.parent?._id || null,
            before: place.before,
        });
        setDragging(null);
        setOver(null);
    };
    // A drag of several shows how many, not the one row it began on.
    const isMoving = (row) =>
        Boolean(dragging) &&
        [row, ...ancestorsOf(row)].some((entry) =>
            dragging.some((moving) => moving._id === entry._id)
        );

    // A place's row starts with a tick box where the Master's has a handle,
    // and ends with two columns where the Master's has one.
    const columns =
        (sortable ? 1 : 0) +
        (tickable ? 1 : 0) +
        2 +
        (showsUse ? 1 : master ? 0 : 2);
    const isTicked = (row) => tickable && ticked.has(row._id);
    const allTicked = rows.every(isTicked);
    const anyTicked = rows.some(isTicked);

    return (
        // Fixed layout: the widths below hold, and a long question wraps
        // inside its cell instead of pushing the table wider than the pane.
        <Table
            layout="fixed"
            verticalSpacing="md"
            highlightOnHover
            data-ticking={anyTicked || undefined}
        >
            <colgroup>
                {sortable && <col style={{ width: 44 }} />}
                {tickable && <col style={{ width: sortable ? 36 : 44 }} />}
                <col />
                <col style={{ width: 150 }} />
                {showsUse ? (
                    <col style={{ width: 230 }} />
                ) : master ? null : (
                    <>
                        {/* Room for "Options changed in" and a name. */}
                        <col style={{ width: 240 }} />
                        <col style={{ width: 76 }} />
                    </>
                )}
            </colgroup>
            {!grouped && (
                <Table.Thead>
                    <Table.Tr>
                        {sortable && <Table.Th />}
                        {tickable && (
                            <Table.Th>
                                <Checkbox
                                    className="qn-tick"
                                    aria-label="Select every question on this page"
                                    checked={allTicked}
                                    indeterminate={anyTicked && !allTicked}
                                    onChange={() =>
                                        onTick(
                                            rows.map((row) => row._id),
                                            !allTicked
                                        )
                                    }
                                />
                            </Table.Th>
                        )}
                        <Table.Th style={heading}>Question</Table.Th>
                        <Table.Th style={heading}>Answer type</Table.Th>
                        {showsUse ? (
                            <Table.Th style={heading}>Where it is used</Table.Th>
                        ) : master ? null : (
                            <>
                                <Table.Th style={heading}>Status</Table.Th>
                                <Table.Th
                                    style={{ ...heading, textAlign: "right" }}
                                >
                                    Asked
                                </Table.Th>
                            </>
                        )}
                    </Table.Tr>
                </Table.Thead>
            )}
            <Table.Tbody>
                {rows.map((row, index) => {
                    const label = localise(row.label, language);
                    const open = () => onOpen(row);
                    const {
                        hiddenIn = [],
                        rewordedIn = [],
                        optionsChangedIn = [],
                        requiredChangedIn = [],
                    } = row.usage || {};
                    return (
                        <Fragment key={row._id}>
                            {grouped && row.group !== rows[index - 1]?.group && (
                                <Table.Tr
                                    style={{ backgroundColor: "transparent" }}
                                >
                                    <Table.Td
                                        colSpan={columns}
                                        pt="lg"
                                        pb={6}
                                        pl={0}
                                    >
                                        <SectionHeading>{row.group}</SectionHeading>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                            <Table.Tr
                                onClick={open}
                                draggable={sortable}
                                onDragStart={(event) => {
                                    // A ticked row takes every ticked one
                                    // along; a group takes what is in it.
                                    const picked = isTicked(row)
                                        ? rows.filter(isTicked)
                                        : [row];
                                    const moving = picked.filter(
                                        (entry) =>
                                            !ancestorsOf(entry).some((above) =>
                                                picked.includes(above)
                                            )
                                    );
                                    // Firefox starts a drag only once it
                                    // carries data.
                                    event.dataTransfer.setData(
                                        "text/plain",
                                        moving
                                            .map((entry) =>
                                                localise(entry.label, language)
                                            )
                                            .join("\n")
                                    );
                                    event.dataTransfer.setData(
                                        QUESTION_DRAG,
                                        JSON.stringify(
                                            moving.map((entry) => entry._id)
                                        )
                                    );
                                    event.dataTransfer.effectAllowed = "move";
                                    if (moving.length > 1)
                                        dragBadge(event, plural(moving.length, "question"));
                                    setDragging(moving);
                                }}
                                onDragEnd={() => {
                                    setDragging(null);
                                    setOver(null);
                                }}
                                onDragOver={(event) => {
                                    if (!dragging) return;
                                    const zone = zoneOf(event, row);
                                    if (!accepts(row, zone)) {
                                        if (over?.id === row._id) setOver(null);
                                        return;
                                    }
                                    event.preventDefault();
                                    if (over?.id !== row._id || over.zone !== zone)
                                        setOver({ id: row._id, zone });
                                }}
                                onDrop={(event) => {
                                    if (!dragging) return;
                                    const zone = zoneOf(event, row);
                                    if (!accepts(row, zone)) return;
                                    event.preventDefault();
                                    arrangeTo(placeFor(row, zone));
                                }}
                                data-drop={
                                    over?.id === row._id ? over.zone : undefined
                                }
                                style={{
                                    cursor: "pointer",
                                    opacity: isMoving(row) ? 0.4 : 1,
                                    boxShadow:
                                        over?.id === row._id
                                            ? DROP_MARK[over.zone]
                                            : undefined,
                                    backgroundColor:
                                        isTicked(row) ||
                                        (over?.id === row._id &&
                                            over.zone === "inside")
                                            ? "var(--mantine-color-brand-0)"
                                            : undefined,
                                }}
                            >
                                {sortable && (
                                    <Table.Td>
                                        {/* A <div>, like the question beside
                                            it: Firefox will not start a drag
                                            from a <button>. */}
                                        <ActionIcon
                                            component="div"
                                            role="button"
                                            tabIndex={0}
                                            id={`handle-${row._id}`}
                                            variant="subtle"
                                            color="gray"
                                            aria-label={`Move “${label}”. Alt and the up or down arrow change its place; Alt and the right arrow put it in the group above it, Alt and the left arrow take it out of its group.`}
                                            title="Drag to move it: onto a group or section to put it inside, onto a page on the left to move it there. Alt+↑ / Alt+↓ move it, Alt+→ / Alt+← in and out of a group."
                                            style={{ cursor: "grab" }}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            onKeyDown={(event) => {
                                                // A bare Space would scroll
                                                // the page from here.
                                                if (event.key === " ")
                                                    event.preventDefault();
                                                if (
                                                    !event.altKey ||
                                                    ![
                                                        "ArrowUp",
                                                        "ArrowDown",
                                                        "ArrowLeft",
                                                        "ArrowRight",
                                                    ].includes(event.key)
                                                )
                                                    return;
                                                event.preventDefault();
                                                if (
                                                    event.key === "ArrowUp" ||
                                                    event.key === "ArrowDown"
                                                )
                                                    nudge(
                                                        row,
                                                        event.key === "ArrowUp"
                                                            ? -1
                                                            : 1
                                                    );
                                                else
                                                    shift(
                                                        row,
                                                        event.key === "ArrowRight"
                                                    );
                                            }}
                                        >
                                            <IconEqual size={18} />
                                        </ActionIcon>
                                    </Table.Td>
                                )}
                                {tickable && (
                                    // A click beside the box must not open
                                    // the question it was aimed away from.
                                    <Table.Td
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <Checkbox
                                            className="qn-tick"
                                            aria-label={`Select “${label}”`}
                                            checked={isTicked(row)}
                                            onChange={() =>
                                                onTick([row._id], !isTicked(row))
                                            }
                                        />
                                    </Table.Td>
                                )}
                                <Table.Td>
                                    <Group
                                        gap={8}
                                        wrap="nowrap"
                                        align="flex-start"
                                        pl={row.depth * 24}
                                    >
                                        {row.depth > 0 && (
                                            <IconCornerDownRight
                                                size={15}
                                                style={{
                                                    marginTop: 3,
                                                    color: "var(--mantine-color-gray-5)",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        )}
                                        <Group gap="xs" style={{ minWidth: 0 }}>
                                            {/* What Tab stops on. A click on
                                                it reaches the row like a
                                                click anywhere else. */}
                                            <UnstyledButton
                                                component="div"
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(event) => {
                                                    // Space as well: left to
                                                    // the browser it scrolls
                                                    // the page.
                                                    if (
                                                        event.key !== "Enter" &&
                                                        event.key !== " "
                                                    )
                                                        return;
                                                    event.preventDefault();
                                                    open();
                                                }}
                                            >
                                                <Text
                                                    size="sm"
                                                    fw={
                                                        PARENT_TYPES.includes(
                                                            row.type
                                                        )
                                                            ? 700
                                                            : undefined
                                                    }
                                                    c={
                                                        row.dimmed
                                                            ? "dimmed"
                                                            : undefined
                                                    }
                                                    style={{
                                                        overflowWrap: "anywhere",
                                                    }}
                                                >
                                                    {label}
                                                </Text>
                                            </UnstyledButton>
                                            {row.archived && (
                                                <Text size="xs" c="dimmed">
                                                    Archived
                                                </Text>
                                            )}
                                            {/* Archived by a replacement
                                                that waits to be published,
                                                it comes back when that is
                                                discarded, not from here. */}
                                            {row.active === false && (
                                                <Anchor
                                                    component="button"
                                                    type="button"
                                                    size="xs"
                                                    fw={600}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onRestore(row);
                                                    }}
                                                >
                                                    Restore
                                                </Anchor>
                                            )}
                                        </Group>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {shortTypeLabel(row.type)}
                                    </Text>
                                </Table.Td>
                                {showsUse ? (
                                    <Table.Td>
                                        <Stack gap={4} align="flex-start">
                                            {/* Two places are named in the
                                                line; more are counted, and
                                                named for the pointer. */}
                                            <Tooltip
                                                label={nameList(hiddenIn)}
                                                disabled={hiddenIn.length < 3}
                                                multiline
                                                maw={320}
                                                withArrow
                                            >
                                                <Text
                                                    size="sm"
                                                    c={
                                                        row.dimmed
                                                            ? "dimmed"
                                                            : undefined
                                                    }
                                                >
                                                    {usedIn(row.usage)}
                                                </Text>
                                            </Tooltip>
                                            {rewordedIn.map((name) => (
                                                <Pill
                                                    key={`reworded-${name}`}
                                                    tone="blue"
                                                >
                                                    Reworded in {name}
                                                </Pill>
                                            ))}
                                            {optionsChangedIn.map((name) => (
                                                <Pill
                                                    key={`options-${name}`}
                                                    tone="blue"
                                                >
                                                    Options changed in {name}
                                                </Pill>
                                            ))}
                                            {requiredChangedIn.map((name) => (
                                                <Pill
                                                    key={`required-${name}`}
                                                    tone="blue"
                                                >
                                                    Required changed in {name}
                                                </Pill>
                                            ))}
                                        </Stack>
                                    </Table.Td>
                                ) : master ? null : (
                                    <>
                                        <Table.Td>
                                            <StatusPill
                                                status={row.status}
                                                title={setBy(row, placeNames)}
                                            />
                                        </Table.Td>
                                        <Table.Td
                                            ta="right"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            {/* On a box of its own: a
                                                disabled switch tells the
                                                pointer nothing. */}
                                            <Tooltip
                                                label={lockedWhy(row)}
                                                disabled={!row.lockedSwitch}
                                                withArrow
                                            >
                                                <Box display="inline-block">
                                                    <Switch
                                                        size="md"
                                                        aria-label={`Ask “${label}” in ${placeName}${
                                                            row.lockedSwitch
                                                                ? `. ${lockedWhy(row)}`
                                                                : ""
                                                        }`}
                                                        checked={row.asked}
                                                        disabled={Boolean(
                                                            row.lockedSwitch
                                                        )}
                                                        onChange={(event) =>
                                                            onAsk(
                                                                row,
                                                                event.currentTarget
                                                                    .checked
                                                            )
                                                        }
                                                    />
                                                </Box>
                                            </Tooltip>
                                        </Table.Td>
                                    </>
                                )}
                            </Table.Tr>
                        </Fragment>
                    );
                })}
                {sortable && dragging && (
                    <Table.Tr
                        onDragOver={(event) => {
                            event.preventDefault();
                            if (over?.id !== "end")
                                setOver({ id: "end", zone: "inside" });
                        }}
                        onDragLeave={() => {
                            if (over?.id === "end") setOver(null);
                        }}
                        onDrop={(event) => {
                            event.preventDefault();
                            arrangeTo({ parent: null, before: null });
                        }}
                    >
                        <Table.Td colSpan={columns}>
                            <Text
                                size="sm"
                                c="dimmed"
                                ta="center"
                                py={6}
                                data-drop={over?.id === "end" ? "end" : undefined}
                                style={{
                                    border: "1px dashed var(--mantine-color-gray-4)",
                                    borderRadius: "var(--mantine-radius-md)",
                                    backgroundColor:
                                        over?.id === "end"
                                            ? "var(--mantine-color-brand-0)"
                                            : undefined,
                                }}
                            >
                                Drop here to move to the end of this page
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
        </Table>
    );
}
