import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchFile } from "../../../functions/questionnaire";
import { localise } from "./localise";

export const QUESTION_TYPES = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "single_select", label: "Single select" },
    { value: "multi_select", label: "Multi select" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes / No" },
    { value: "photo", label: "Photo" },
    { value: "audio", label: "Audio recording", short: "Audio" },
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

// Types answered with files. The list is `localise.js`'s (see there why).
export { FILE_TYPES } from "./localise";

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

/* ---------------- what the server said ---------------- */

/**
 * The server's own "no" to a request as it stands: a place that is someone
 * else's (403), one that does not exist (404), an address it cannot read
 * (400). Asking again gets the same answer, so it is shown and not retried.
 * (A 401 never reaches a screen: the axios interceptor takes it.)
 */
export const isRefusal = (err) => {
    const status = err?.response?.status;
    return status >= 400 && status < 500;
};
export const retry = (failures, err) => !isRefusal(err) && failures < 3;

/**
 * The one 409 that is a conflict: what is on screen is no longer what is
 * saved. Every other 409 of this backend is a rule ("Leave at least one
 * option on…") that the person can still put right in the open form.
 */
export const isStale = (err) =>
    err?.response?.status === 409 &&
    String(err.response.data?.message || "").startsWith(
        "This was changed by someone else"
    );

// Closing keeps what a dialog was showing, so its contents do not change
// under the reader while it fades out.
export const closed = (dialog) => ({ ...dialog, opened: false });

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

/**
 * The places that changed a Master question in any way other than hiding
 * it: its wording, whether it is required, its options. The ONE list of what
 * counts as a change, for the chip, the pills and the sentences.
 */
export const changedIn = (usage) => [
    ...new Set([
        ...(usage?.rewordedIn || []),
        ...(usage?.requiredChangedIn || []),
        ...(usage?.optionsChangedIn || []),
    ]),
];

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
 * A regional account's own place as the server holds it NOW: the places list
 * marks what the account manages, and the highest of those is its own. Null
 * for any other account (their lists carry no such mark).
 */
export const ownPlaceOf = (places) =>
    places
        .filter((place) => place.managed === true)
        .reduce((top, place) => (!top || place.depth < top.depth ? place : top), null);

/**
 * The copy of that place kept from sign-in goes stale when a super admin
 * moves the account ("Change place"): the menu link and the start page are
 * built from it. It is rewritten from the list whenever a screen reads one.
 */
export const rememberOwnPlace = (own) => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "regional" || user.place?._id === own._id) return;
        localStorage.setItem(
            "user",
            JSON.stringify({
                ...user,
                place: { _id: own._id, name: placeName(own), level: own.level },
            })
        );
    } catch (unreadable) {
        // Nothing stored that can be read: the next sign-in writes it.
    }
};

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

/**
 * While `unsaved`, the browser asks before a reload or a closed tab throws
 * away what was typed in an open panel (its own Cancel, X and Esc already
 * ask).
 */
export const useUnsavedWarning = (unsaved) => {
    useEffect(() => {
        if (!unsaved) return undefined;
        const warn = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [unsaved]);
};

/* ---------------- files ---------------- */

/**
 * One photo or recording of an answer, as an address an image or a player
 * can be given. The file is behind the sign-in, and an address straight to
 * the API would carry no token: it is fetched like any other request and
 * handed to the browser from memory. `thumb` asks for a photo's small copy;
 * `enabled` holds the request back (until the file is scrolled to, say).
 * `type` is what the server found the file to be ("image/jpeg", "audio/mp4").
 */
export const useFile = (id, { thumb = false, enabled = true } = {}) => {
    const { data: blob, isError } = useQuery({
        queryKey: ["file", id, thumb],
        queryFn: () => fetchFile(id, { thumb }),
        enabled,
        // A file never changes under its id.
        staleTime: Infinity,
        retry,
    });
    // The cache holds the file; its address is made and given back here. One
    // made with the request and given back on leaving would be dead the
    // second time this runs (in development every effect runs twice), and
    // one never given back keeps the file in memory as long as the tab lives.
    const [url, setUrl] = useState("");
    useEffect(() => {
        if (!blob) return undefined;
        const made = URL.createObjectURL(blob);
        setUrl(made);
        return () => {
            URL.revokeObjectURL(made);
            setUrl("");
        };
    }, [blob]);
    return { url, type: blob?.type || "", failed: isError };
};
