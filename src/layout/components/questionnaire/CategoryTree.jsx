import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import "./CategoryTree.css";
import RowActions from "./RowActions";
import StatusPill from "./StatusPill";
import { DROP_MARK, reordered } from "./constants";
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
 * Alt+↑ / Alt+↓ on a focused row moves it among its siblings.
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
    onHide,
    onShow,
}) {
    const master = !readOnly && scope.type === "master";
    const [dragging, setDragging] = useState(null);
    const [over, setOver] = useState(null);

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

    // A category cannot go beside or inside itself or anything under it.
    const accepts = (target) =>
        dragging &&
        !target.trail.some((entry) => entry._id === dragging._id);

    const zoneOf = (event, target) => {
        const box = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientY - box.top) / box.height;
        if (!target.is_screen && ratio > 0.25 && ratio < 0.75) return "inside";
        return ratio < 0.5 ? "before" : "after";
    };

    const drop = (target, zone) => {
        const parentId =
            zone === "inside" ? target._id : target.parentId || null;
        const siblings = childrenOf(parentId);
        const others = siblings.filter((entry) => entry._id !== dragging._id);
        const index =
            zone === "inside"
                ? others.length
                : others.findIndex((entry) => entry._id === target._id) +
                  (zone === "after" ? 1 : 0);
        const moved = reordered(siblings, dragging, index);
        if (!moved.length) return;
        if ((dragging.parentId || null) === parentId) onReorder(moved);
        else onMove(dragging, parentId, moved);
    };

    const menu = (category) => [
        { label: "Rename", onClick: () => onRename(category) },
        { label: "Add sub-category", onClick: () => onAdd(category) },
        category.active === false
            ? { label: "Restore", onClick: () => onRestore(category) }
            : // Nothing to keep: no questions, and no category inside it.
            category.questionCount === 0 &&
              childrenOf(category._id).length === 0
            ? {
                  label: "Delete",
                  color: "red.9",
                  onClick: () => onRemove(category, true),
              }
            : {
                  label: "Archive",
                  color: "red.9",
                  onClick: () => onRemove(category, false),
              },
    ];

    const placeMenu = (category) => [
        ...(category.ownerPlaceId === scope.placeId
            ? [{ label: "Rename", onClick: () => onRename(category) }]
            : []),
        category.status.kind === "hidden"
            ? { label: `Show in ${placeName}`, onClick: () => onShow(category) }
            : { label: `Hide in ${placeName}`, onClick: () => onHide(category) },
        ...(category.is_screen
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
            // Tight, so that a title the length of "Demographic Information"
            // still fits on one line beside its menu button.
            p={8}
            style={{
                width: 260,
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
                            // Firefox starts a drag only once it carries data.
                            event.dataTransfer.setData("text/plain", title);
                            event.dataTransfer.effectAllowed = "move";
                            setDragging(category);
                        }}
                        onDragEnd={() => {
                            setDragging(null);
                            setOver(null);
                        }}
                        onDragOver={(event) => {
                            if (!accepts(category)) return;
                            event.preventDefault();
                            const zone = zoneOf(event, category);
                            if (over?.id !== category._id || over.zone !== zone)
                                setOver({ id: category._id, zone });
                        }}
                        onDrop={(event) => {
                            if (!accepts(category)) return;
                            event.preventDefault();
                            drop(category, zoneOf(event, category));
                            setDragging(null);
                            setOver(null);
                        }}
                        style={{
                            borderRadius: "var(--mantine-radius-md)",
                            opacity: dragging?._id === category._id ? 0.4 : 1,
                            boxShadow:
                                over?.id === category._id
                                    ? DROP_MARK[over.zone]
                                    : undefined,
                        }}
                    >
                        {/* Not a <button>: Firefox will not start a drag
                            from one. */}
                        <UnstyledButton
                            component="div"
                            role="button"
                            tabIndex={0}
                            id={`category-${category._id}`}
                            aria-current={selected ? "true" : undefined}
                            px={10}
                            py={10}
                            onClick={() => onSelect(category._id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onSelect(category._id);
                                } else if (
                                    master &&
                                    event.altKey &&
                                    ["ArrowUp", "ArrowDown"].includes(event.key)
                                ) {
                                    event.preventDefault();
                                    nudge(
                                        category,
                                        event.key === "ArrowUp" ? -1 : 1
                                    );
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
