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
    nameList,
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
 * In the Master a row is dragged among the rows that share its parent, or
 * moved with Alt+↑ / Alt+↓ on its handle. Results are in no order of their
 * own, so they have no handle.
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
    onTick,
    onAsk,
}) {
    const master = scope.type === "master";
    const sortable = master && !grouped;
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

    const nudge = (row, by) => {
        const siblings = siblingsOf(row);
        const index = siblings.findIndex((entry) => entry._id === row._id) + by;
        if (index < 0 || index >= siblings.length) return;
        refocus.current = `handle-${row._id}`;
        onReorder(reordered(siblings, row, index));
    };

    const accepts = (target) =>
        dragging && dragging._id !== target._id && sameParent(dragging, target);

    const zoneOf = (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        return event.clientY - box.top < box.height / 2 ? "before" : "after";
    };

    const drop = (target, zone) => {
        const siblings = siblingsOf(target);
        const index =
            siblings
                .filter((entry) => entry._id !== dragging._id)
                .findIndex((entry) => entry._id === target._id) +
            (zone === "after" ? 1 : 0);
        const moved = reordered(siblings, dragging, index);
        if (moved.length) onReorder(moved);
    };

    // A place's row starts with a tick box where the Master's has a handle,
    // and ends with two columns where the Master's has one.
    const columns = (sortable || !master ? 1 : 0) + 2 + (master ? 1 : 2);
    const isTicked = (row) => !master && ticked.has(row._id);
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
                {(sortable || !master) && <col style={{ width: 44 }} />}
                <col />
                <col style={{ width: 150 }} />
                {master ? (
                    <col style={{ width: 230 }} />
                ) : (
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
                        {!master && (
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
                        {master ? (
                            <Table.Th style={heading}>Where it is used</Table.Th>
                        ) : (
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
                                    // Firefox starts a drag only once it
                                    // carries data.
                                    event.dataTransfer.setData(
                                        "text/plain",
                                        label
                                    );
                                    event.dataTransfer.effectAllowed = "move";
                                    setDragging(row);
                                }}
                                onDragEnd={() => {
                                    setDragging(null);
                                    setOver(null);
                                }}
                                onDragOver={(event) => {
                                    if (!accepts(row)) return;
                                    event.preventDefault();
                                    const zone = zoneOf(event);
                                    if (over?.id !== row._id || over.zone !== zone)
                                        setOver({ id: row._id, zone });
                                }}
                                onDrop={(event) => {
                                    if (!accepts(row)) return;
                                    event.preventDefault();
                                    drop(row, zoneOf(event));
                                    setDragging(null);
                                    setOver(null);
                                }}
                                style={{
                                    cursor: "pointer",
                                    opacity: dragging?._id === row._id ? 0.4 : 1,
                                    boxShadow:
                                        over?.id === row._id
                                            ? DROP_MARK[over.zone]
                                            : undefined,
                                    backgroundColor: isTicked(row)
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
                                            aria-label={`Move “${label}”. Alt and the up or down arrow change its place.`}
                                            title="Drag to reorder, or press Alt+↑ / Alt+↓"
                                            style={{ cursor: "grab" }}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    !event.altKey ||
                                                    !["ArrowUp", "ArrowDown"].includes(
                                                        event.key
                                                    )
                                                )
                                                    return;
                                                event.preventDefault();
                                                nudge(
                                                    row,
                                                    event.key === "ArrowUp" ? -1 : 1
                                                );
                                            }}
                                        >
                                            <IconEqual size={18} />
                                        </ActionIcon>
                                    </Table.Td>
                                )}
                                {!master && (
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
                                                    if (event.key !== "Enter")
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
                                {master ? (
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
                                        </Stack>
                                    </Table.Td>
                                ) : (
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
            </Table.Tbody>
        </Table>
    );
}
