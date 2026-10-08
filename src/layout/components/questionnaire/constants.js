import { localise } from "./localise";

export const QUESTION_TYPES = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "single_select", label: "Single select" },
    { value: "multi_select", label: "Multi select" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes / No" },
    {
        value: "repeatable_group",
        label: "Repeatable group (+ Add row)",
        short: "Repeating group",
    },
    { value: "section", label: "Section (groups questions)", short: "Section" },
];

/** Types that own child questions rather than holding a value of their own. */
export const PARENT_TYPES = ["repeatable_group", "section"];

export const SELECT_TYPES = ["single_select", "multi_select"];

/**
 * The name the editor's list and panel use. `label` explains a type where a
 * field is being authored; in a narrow column only its name is wanted.
 */
export const shortTypeLabel = (value) => {
    const type = QUESTION_TYPES.find((entry) => entry.value === value);
    return type?.short || type?.label || value;
};

/** Filter operators offered per question type. */
export const operatorsFor = (type) => {
    switch (type) {
        case "number":
        case "date":
            return [
                { value: "gte", label: "is at least" },
                { value: "lte", label: "is at most" },
                { value: "eq", label: "is exactly" },
            ];
        case "single_select":
            return [
                { value: "eq", label: "is" },
                { value: "in", label: "is any of" },
            ];
        case "multi_select":
            return [{ value: "any", label: "includes" }];
        case "boolean":
            return [{ value: "eq", label: "is" }];
        default:
            return [
                { value: "contains", label: "contains" },
                { value: "eq", label: "is exactly" },
            ];
    }
};

/**
 * Flattens the column tree into pickable filter targets, carrying the dotted
 * questionId path the backend expects ("group.innerGroup.leaf").
 */
export const flattenFilterTargets = (
    columns,
    prefix = [],
    trail = [],
    language
) => {
    const out = [];
    (columns || []).forEach((column) => {
        const path = [...prefix, column.questionId];
        const names = [...trail, localise(column.label, language)];
        if (column.type !== "repeatable_group") {
            out.push({
                path: path.join("."),
                label: names.join(" / "),
                depth: names.length - 1,
                type: column.type,
                options: (column.options || []).map((option) => ({
                    value: option.value,
                    label: localise(option.label, language),
                })),
            });
        }
        out.push(
            ...flattenFilterTargets(column.children, path, names, language)
        );
    });
    return out;
};

/* ---------------- editor ---------------- */

/** "1 change", "3 changes"; give the plural when it is not an added "s". */
export const plural = (count, one, many = `${one}s`) =>
    `${count} ${count === 1 ? one : many}`;

/**
 * Where a moved row lands among `siblings` (in their current order), as the
 * `[{ _id, order }]` to save. `index` counts the places between the OTHER
 * rows: 0 is before the first of them.
 *
 * One new `order` is enough when it fits between the two rows it lands
 * between (their midpoint). Rows saved before ordering existed share a value,
 * and nothing fits between two equal numbers, so the list is renumbered then.
 */
export const reordered = (siblings, moved, index) => {
    const rest = siblings.filter((entry) => entry._id !== moved._id);
    // Dropped back where it was: nothing to save.
    if (rest.length < siblings.length && siblings[index]?._id === moved._id)
        return [];
    const before = rest[index - 1];
    const after = rest[index];
    if (before && after && before.order >= after.order)
        return [...rest.slice(0, index), moved, ...rest.slice(index)].map(
            (entry, position) => ({ _id: entry._id, order: position })
        );
    const order =
        before && after
            ? (before.order + after.order) / 2
            : before
            ? before.order + 1
            : after
            ? after.order - 1
            : 0;
    return [{ _id: moved._id, order }];
};

// Where a dragged row will land, drawn on the row it is held over: a line
// on the edge it goes beside, or a frame around the group it goes into.
const ACCENT = "var(--mantine-primary-color-filled)";
export const DROP_MARK = {
    before: `inset 0 2px 0 ${ACCENT}`,
    after: `inset 0 -2px 0 ${ACCENT}`,
    inside: `inset 0 0 0 2px ${ACCENT}`,
};


/**
 * Whom a place's change reaches, as the design's sentences name it: "Ladakh
 * and its villages" — or the village alone, when the place is one.
 */
export const reachOf = (name, level) =>
    level === "village" ? name : `${name} and its villages`;

// The buttons of a question panel stay in view under a form that scrolls.
export const STICKY_FOOTER = {
    position: "sticky",
    bottom: 0,
    zIndex: 2,
    background: "var(--mantine-color-body)",
    borderTop: "1px solid var(--mantine-color-gray-3)",
    // Out to the edges of the dialog, through the padding of its body.
    margin: "0 calc(var(--mantine-spacing-md) * -1) calc(var(--mantine-spacing-md) * -1)",
    padding: "var(--mantine-spacing-md)",
};

const NAMES = new Intl.ListFormat("en-GB", { type: "conjunction" });

/** "Ladakh", "Ladakh and Sabah", "Ladakh, Sabah and Kedah". */
export const nameList = (names) => NAMES.format(names);

/**
 * The same where there is room for two names at most: from three on it says
 * only how many, and the names are shown on request.
 */
export const placeList = (names) =>
    names.length > 2 ? `${names.length} places` : nameList(names);

/** Where the Master's question is asked, from the places that hide it. */
export const usedIn = (usage) =>
    usage?.hiddenIn?.length
        ? `Every place except ${placeList(usage.hiddenIn)}`
        : "Every place";

/* ---------------- places ---------------- */

/** Highest level first: a place can only sit inside one that comes earlier. */
export const PLACE_LEVELS = [
    { value: "country", label: "Country" },
    { value: "state", label: "State" },
    { value: "district", label: "District" },
    { value: "sub_district", label: "Sub-district" },
    { value: "village", label: "Village" },
];

export const levelLabel = (value) =>
    PLACE_LEVELS.find((level) => level.value === value)?.label || value;

/** Village names are stored lowercase; every other name is kept as typed. */
export const placeName = (place) =>
    place.level === "village"
        ? place.name.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
        : place.name;

/**
 * "India › Ladakh › Leh". A place's `path` already lists its ancestors root
 * first, so nothing walks parent links; `byId` is a Map of every place.
 */
export const breadcrumb = (place, byId) =>
    [...place.path.map((id) => byId.get(id)).filter(Boolean), place]
        .map(placeName)
        .join(" › ");

/**
 * A search keeps the ancestors of every match, so a matching village still
 * sits under its country and the indentation keeps its meaning. So does
 * `test`, one more thing a place must pass to be a match. A level filter
 * gives a flat list of that level: there is no tree left to keep.
 */
export const visiblePlaces = (places, search, level, test) => {
    const query = search.trim().toLowerCase();
    const matches = places.filter(
        (place) =>
            (!level || place.level === level) &&
            place.name.toLowerCase().includes(query) &&
            (!test || test(place))
    );
    if (level || (!query && !test)) return matches;
    const keep = new Set(matches.flatMap((place) => [...place.path, place._id]));
    return places.filter((place) => keep.has(place._id));
};
