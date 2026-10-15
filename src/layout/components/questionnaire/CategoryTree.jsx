import { Box, Checkbox, Group, Text, UnstyledButton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import BulkBar from "./BulkBar";
import "./CategoryTree.css";
import RowActions from "./RowActions";
import StatusPill from "./StatusPill";
import {
    DROP_MARK,
    QUESTION_DRAG,
    dragBadge,
    plural,
    reordered,
} from "./constants";
import { localise } from "./localise";

// What each tag of a place's tree means (PDF p.18), for whoever holds the
// pointer over it.
const MEANING = {
    hidden: (name) =>
        `Not shown in the app in ${name}. Still shown everywhere else.`,
    added: (name, reach) => `Exists only in ${reach}.`,
};

/**
 * The left pane of the editor: every category, as a tree (PDF p.2 and p.18).
 *
 * `categories` arrives already in tree order, each with its `depth` and its
 * `trail` (itself and everything above it), so nothing here walks parent
 * links. Nothing is saved here either: a choice from a row's menu, a drop or
 * a keyboard move is handed to the editor.
 *
 * In the Master a category is dragged to a new place: dropped on the edge of
 * a row it goes beside that row (into that row's parent, which is also how
 * it leaves a group), and dropped on the middle of a group it goes inside.
 * The keyboard does the same on a focused row: Alt+↑ / Alt+↓ among its
 * siblings, Alt+→ into the group just above it, Alt+← out of its group.
 * Several are moved at once by ticking them: a ticked row drags every ticked
 * one along, and the bar the ticks bring up moves them to the end of a group
 * (the route without a mouse). What is inside a moved group goes with it.
 * Questions dragged from the right pane can be dropped on a question page:
 * they go to the end of it (`onDropQuestions(page, ids)`).
 *
 * The tree is ONE tab stop: ↑ and ↓ move between its rows, Tab goes on to
 * the row's menu and then out of the tree (36 categories were 77 stops).
 *
 * In a place (`placeName` is its name) nothing is dragged, archived or
 * deleted: a category is hidden or shown for that place, and only one the
 * place added can be renamed.
 *
 * `readOnly` is the same tree as a way to choose a page and nothing more
 * (Responses): no menus, nothing to add or drag, no place tags, and no
 * `scope`. A group still says "Group" and an archived category "Archived".
 */
export default function CategoryTree({
    scope,
    placeName,
    reachFor,
    readOnly,
    categories,
    selectedId,
    language,
    onSelect,
    onAdd,
    onRename,
    onRemove,
    onRestore,
    onReorder,
    onMove,
    onDropQuestions,
    onHide,
    onShow,
}) {
    const master = !readOnly && scope.type === "master";
    // The categories on the move, outermost only: what is inside one of
    // them goes along with it.
    const [dragging, setDragging] = useState(null);
    const [ticked, setTicked] = useState(() => new Set());
    const tickedRows = categories.filter((category) =>
        ticked.has(category._id)
    );
    const toggle = (id) =>
        setTicked((old) => {
            const next = new Set(old);
            if (!next.delete(id)) next.add(id);
            return next;
        });
    const [over, setOver] = useState(null);
    // The row Tab lands on: the one last focused, else the chosen page.
    const [focused, setFocused] = useState(null);
    const stop = categories.some((category) => category._id === focused)
        ? focused
        : selectedId || categories[0]?._id;

    // The tree scrolls on its own and is longer than the window (36
    // categories today), so a page opened from a link, a search result or
    // the first load may sit out of sight. Bring the chosen row into view by
    // scrolling the TREE only: scrollIntoView would move the whole page too.
    const nav = useRef(null);
    useEffect(() => {
        const box = nav.current;
        const row = box?.querySelector("[data-selected]");
        if (!row) return;
        const frame = box.getBoundingClientRect();
        const at = row.getBoundingClientRect();
        // The box can run past the bottom of the window before it sticks.
        const bottom = Math.min(frame.bottom, window.innerHeight);
        if (at.top < frame.top) box.scrollTop -= frame.top - at.top;
        else if (at.bottom > bottom) box.scrollTop += at.bottom - bottom + 24;
        // Also when the rows first arrive: the choice is known (from the
        // URL) before the categories are.
    }, [selectedId, categories.length]);

    // A keyboard move re-inserts the row in the page, and a browser drops
    // focus from an element that is moved. It is put back once the new
    // order is drawn, so the shortcut can be pressed again.
    const refocus = useRef(null);
    useEffect(() => {
        if (!refocus.current) return;
        document.getElementById(refocus.current)?.focus();
        refocus.current = null;
    }, [categories]);

    const childrenOf = (parentId) =>
        categories.filter(
            (category) => (category.parentId || null) === parentId
        );

    const nudge = (category, by) => {
        const siblings = childrenOf(category.parentId || null);
        const index =
            siblings.findIndex((entry) => entry._id === category._id) + by;
        if (index < 0 || index >= siblings.length) return;
        refocus.current = `category-${category._id}`;
        onReorder(reordered(siblings, category, index));
    };

    // Into the group just above it, as its last category; or out of its
    // group, to stand right after it.
    const shift = (category, inwards) => {
        const siblings = childrenOf(category.parentId || null);
        const above =
            siblings[siblings.findIndex((entry) => entry._id === category._id) - 1];
        const group = categories.find(
            (entry) => entry._id === category.parentId
        );
        if (inwards ? !above || above.is_screen : !group) return;
        refocus.current = `category-${category._id}`;
        if (inwards) put([category], above._id);
        else put([category], group.parentId || null, group, true);
    };

    // Puts `moving` in the group `parentId` (null: the top level), beside
    // `target` there, before it or `after` it, or at the end without one.
    const put = (moving, parentId, target, after) => {
        const siblings = childrenOf(parentId);
        const others = siblings.filter(
            (entry) => !moving.some((one) => one._id === entry._id)
        );
        const index = target
            ? others.findIndex((entry) => entry._id === target._id) +
              (after ? 1 : 0)
            : others.length;
        const moved = reordered(siblings, moving, index);
        if (!moved.length) return;
        if (moving.every((entry) => (entry.parentId || null) === parentId))
            onReorder(moved);
        else onMove(moving, parentId, moved);
    };

    // A ticked category inside another ticked one goes along with it.
    const outermost = (picked) =>
        picked.filter(
            (entry) =>
                !entry.trail.some(
                    (above) =>
                        above._id !== entry._id &&
                        picked.some((one) => one._id === above._id)
                )
        );
    const onTheMove = (target) =>
        Boolean(dragging) &&
        target.trail.some((entry) =>
            dragging.some((one) => one._id === entry._id)
        );

    // A category cannot go beside or inside itself or anything under it.
    const accepts = (target) => Boolean(dragging) && !onTheMove(target);

    const zoneOf = (event, target) => {
        const box = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientY - box.top) / box.height;
        if (!target.is_screen && ratio > 0.25 && ratio < 0.75) return "inside";
        return ratio < 0.5 ? "before" : "after";
    };

    const drop = (target, zone) => {
        if (zone === "inside") put(dragging, target._id);
        else put(dragging, target.parentId || null, target, zone === "after");
        // The ticks were for this move.
        if (dragging.some((entry) => ticked.has(entry._id)))
            setTicked(new Set());
    };

    // The bar's way: to the end of a group, or of the top level. Not into
    // one of the ticked categories, nor anything inside them.
    const ticks = outermost(tickedRows);
    const into = (target) =>
        !target.trail.some((entry) =>
            ticks.some((one) => one._id === entry._id)
        );
    const destinations = [
        { value: "", label: "The top level" },
        ...categories
            .filter((category) => !category.is_screen && into(category))
            .map((category) => ({
                value: category._id,
                label: category.trail
                    .map((entry) => localise(entry.title, language))
                    .join(" › "),
            })),
    ];
    const moveTicked = (parentId) => {
        put(ticks, parentId || null);
        setTicked(new Set());
    };

    const menu = (category) => {
        // Nothing to keep, as far as the Master can see: no questions, and
        // no category inside it.
        const empty =
            category.questionCount === 0 &&
            childrenOf(category._id).length === 0;
        return [
            { label: "Rename", onClick: () => onRename(category) },
            { label: "Add sub-category", onClick: () => onAdd(category) },
            ...(category.active === false
                ? [{ label: "Restore", onClick: () => onRestore(category) }]
                : [
                      ...(empty
                          ? [
                                {
                                    label: "Delete",
                                    color: "red.9",
                                    onClick: () => onRemove(category, true),
                                },
                            ]
                          : []),
                      // Also on one that looks empty, once it is published:
                      // what places added to it is not listed in the Master,
                      // and the server will not delete a category that holds
                      // any of it.
                      ...(!empty || !category.unpublished
                          ? [
                                {
                                    label: "Archive",
                                    color: "red.9",
                                    onClick: () => onRemove(category, false),
                                },
                            ]
                          : []),
                  ]),
        ];
    };

    const placeMenu = (category) => [
        ...(category.ownerPlaceId === scope.placeId
            ? [{ label: "Rename", onClick: () => onRename(category) }]
            : []),
        category.status.kind === "hidden"
            ? { label: `Show in ${placeName}`, onClick: () => onShow(category) }
            : { label: `Hide in ${placeName}`, onClick: () => onHide(category) },
        // Inside one of the Master's groups only: what a place adds sits
        // at the top level or in such a group, never inside a place's own.
        ...(category.is_screen || category.ownerPlaceId
            ? []
            : [
                  {
                      label: `Add a question page inside, for ${placeName}`,
                      onClick: () => onAdd(category),
                  },
              ]),
    ];

    return (
        <Box
            component="nav"
            ref={nav}
            aria-label="Categories"
            data-ticking={ticks.length > 0 || undefined}
            // Tight, so that a title the length of "Demographic Information"
            // still fits on one line beside its menu button.
            p={8}
            style={{
                // The Master's rows also hold a tick box.
                width: master ? 284 : 260,
                flexShrink: 0,
                // Stays in view beside a long page of questions, and scrolls
                // on its own when it is itself taller than the window.
                alignSelf: "flex-start",
                position: "sticky",
                top: 0,
                maxHeight: "100vh",
                overflowY: "auto",
            }}
        >
            {master && ticks.length > 0 && (
                <Box
                    pb={4}
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "var(--mantine-color-body)",
                    }}
                >
                    <BulkBar
                        compact
                        count={ticks.length}
                        pages={destinations}
                        onMove={moveTicked}
                        onClear={() => setTicked(new Set())}
                    />
                </Box>
            )}
            {categories.map((category) => {
                const title = localise(category.title, language);
                const selected = category._id === selectedId;
                const archived = category.active === false;
                // Hidden or added, here or above. A category nobody
                // touched has none.
                const tag =
                    !master &&
                    !readOnly &&
                    category.status.kind !== "master" &&
                    category.status;
                return (
                    <Group
                        key={category._id}
                        className="qn-category"
                        data-selected={selected || undefined}
                        gap={2}
                        wrap="nowrap"
                        ml={category.depth * 20}
                        draggable={master}
                        onDragStart={(event) => {
                            // A ticked row takes every ticked one along.
                            const moving = ticked.has(category._id)
                                ? outermost(tickedRows)
                                : [category];
                            // Firefox starts a drag only once it carries data.
                            event.dataTransfer.setData(
                                "text/plain",
                                moving
                                    .map((entry) =>
                                        localise(entry.title, language)
                                    )
                                    .join("\n")
                            );
                            event.dataTransfer.effectAllowed = "move";
                            if (moving.length > 1)
                                dragBadge(
                                    event,
                                    plural(
                                        moving.length,
                                        "category",
                                        "categories"
                                    )
                                );
                            setDragging(moving);
                        }}
                        onDragEnd={() => {
                            setDragging(null);
                            setOver(null);
                        }}
                        onDragOver={(event) => {
                            // Questions from the right pane: a page takes
                            // them, whole.
                            if (
                                master &&
                                category.is_screen &&
                                !archived &&
                                event.dataTransfer.types.includes(QUESTION_DRAG)
                            ) {
                                event.preventDefault();
                                if (over?.id !== category._id)
                                    setOver({ id: category._id, zone: "inside" });
                                return;
                            }
                            if (!accepts(category)) return;
                            event.preventDefault();
                            const zone = zoneOf(event, category);
                            if (over?.id !== category._id || over.zone !== zone)
                                setOver({ id: category._id, zone });
                        }}
                        onDragLeave={() => {
                            if (!dragging && over?.id === category._id)
                                setOver(null);
                        }}
                        onDrop={(event) => {
                            const questions =
                                event.dataTransfer.getData(QUESTION_DRAG);
                            if (questions) {
                                event.preventDefault();
                                setOver(null);
                                if (master && category.is_screen && !archived)
                                    onDropQuestions(category, JSON.parse(questions));
                                return;
                            }
                            if (!accepts(category)) return;
                            event.preventDefault();
                            drop(category, zoneOf(event, category));
                            setDragging(null);
                            setOver(null);
                        }}
                        style={{
                            borderRadius: "var(--mantine-radius-md)",
                            opacity: onTheMove(category) ? 0.4 : 1,
                            boxShadow:
                                over?.id === category._id
                                    ? DROP_MARK[over.zone]
                                    : undefined,
                        }}
                    >
                        {master && (
                            <Checkbox
                                className="qn-category-tick"
                                size="xs"
                                ml={6}
                                aria-label={`Select “${title}”`}
                                tabIndex={category._id === stop ? 0 : -1}
                                checked={ticked.has(category._id)}
                                onChange={() => toggle(category._id)}
                            />
                        )}
                        {/* Not a <button>: Firefox will not start a drag
                            from one. */}
                        <UnstyledButton
                            component="div"
                            role="button"
                            tabIndex={category._id === stop ? 0 : -1}
                            id={`category-${category._id}`}
                            aria-current={selected ? "true" : undefined}
                            aria-keyshortcuts={
                                master
                                    ? "Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
                                    : undefined
                            }
                            px={10}
                            py={10}
                            onClick={() => onSelect(category._id)}
                            onFocus={() => setFocused(category._id)}
                            onKeyDown={(event) => {
                                const vertical = ["ArrowUp", "ArrowDown"].includes(
                                    event.key
                                );
                                const sideways = [
                                    "ArrowLeft",
                                    "ArrowRight",
                                ].includes(event.key);
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onSelect(category._id);
                                } else if (vertical && !event.altKey) {
                                    // Between the rows of the tree.
                                    event.preventDefault();
                                    const all = [
                                        ...nav.current.querySelectorAll(
                                            '[id^="category-"]'
                                        ),
                                    ];
                                    all[
                                        all.indexOf(event.currentTarget) +
                                            (event.key === "ArrowUp" ? -1 : 1)
                                    ]?.focus();
                                } else if (master && event.altKey && vertical) {
                                    event.preventDefault();
                                    nudge(
                                        category,
                                        event.key === "ArrowUp" ? -1 : 1
                                    );
                                } else if (master && event.altKey && sideways) {
                                    event.preventDefault();
                                    shift(category, event.key === "ArrowRight");
                                }
                            }}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                borderRadius: "var(--mantine-radius-md)",
                                backgroundColor: selected
                                    ? "var(--mantine-color-gray-2)"
                                    : undefined,
                            }}
                        >
                            <Group
                                justify="space-between"
                                align="flex-start"
                                // A tag that names another place is long:
                                // it goes under a title it does not fit
                                // beside, instead of squeezing it.
                                wrap={tag && !tag.here ? "wrap" : "nowrap"}
                                gap="xs"
                            >
                                <Text
                                    size="sm"
                                    fw={selected ? 700 : undefined}
                                    // In a place: what it hides, and what
                                    // sits inside a group it hides.
                                    c={
                                        archived || category.asked === false
                                            ? "dimmed"
                                            : undefined
                                    }
                                    style={{ overflowWrap: "anywhere" }}
                                >
                                    {title}
                                </Text>
                                {archived ? (
                                    <Text size="xs" c="dimmed" mt={2}>
                                        Archived
                                    </Text>
                                ) : tag ? (
                                    <StatusPill
                                        status={tag}
                                        title={MEANING[tag.kind]?.(
                                            tag.here ? placeName : tag.placeName,
                                            reachFor?.(tag)
                                        )}
                                        // Beside a title the tag keeps its
                                        // width and the title wraps; on a
                                        // line of its own it wraps itself.
                                        style={{ flexShrink: tag.here ? 0 : 1 }}
                                    />
                                ) : (
                                    !category.is_screen && (
                                        <Text
                                            size="xs"
                                            c="dimmed"
                                            mt={2}
                                            title="Holds other categories. Any other category is a question page."
                                        >
                                            Group
                                        </Text>
                                    )
                                )}
                            </Group>
                        </UnstyledButton>
                        {!readOnly && (
                            <Box className="qn-category-menu">
                                <RowActions
                                    label={`Actions for ${title}`}
                                    tabIndex={category._id === stop ? 0 : -1}
                                    items={
                                        master
                                            ? menu(category)
                                            : placeMenu(category)
                                    }
                                    // A place's items carry its name, and
                                    // open over the questions: the tree is
                                    // too narrow for them.
                                    {...(!master && {
                                        width: 340,
                                        position: "bottom-start",
                                    })}
                                />
                            </Box>
                        )}
                    </Group>
                );
            })}
            {!readOnly && (
                <UnstyledButton px={10} py={10} onClick={() => onAdd(null)}>
                    <Text size="sm">+ Add category</Text>
                </UnstyledButton>
            )}
        </Box>
    );
}
