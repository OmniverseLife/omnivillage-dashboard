import moment from "moment";

export const DEFAULT_LANGUAGE = "en";

/** Human names for the language codes actually in use in this project. */
export const LANGUAGE_NAMES = {
    en: "English",
    ms: "Malay",
    dz: "Dzongkha",
    hi: "Hindi",
    ta: "Tamil",
    ne: "Nepali",
};

export const languageName = (code) => LANGUAGE_NAMES[code] || code.toUpperCase();

/**
 * Resolves a localised value to one language, falling back to English and then
 * to any language present — a question with only a Malay translation should
 * still render something rather than an empty cell.
 */
export const localise = (value, language = DEFAULT_LANGUAGE) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value !== "object") return String(value);
    // Own keys only: `language` can come from an address, and "__proto__"
    // or "constructor" would otherwise answer with something that is no text.
    const own = (code) =>
        Object.hasOwn(value, code) && typeof value[code] === "string"
            ? value[code]
            : "";
    return (
        own(language) ||
        own(DEFAULT_LANGUAGE) ||
        Object.values(value).find((entry) => typeof entry === "string" && entry) ||
        ""
    );
};

/**
 * The languages the dashboard should offer, derived from the countries master
 * list so adding a country adds its language without a code change. English is
 * always present because it is the stored fallback.
 */
export const languagesFor = (countries = []) => {
    const codes = new Set([DEFAULT_LANGUAGE]);
    countries.forEach((country) => {
        (country.languages || []).forEach((code) => code && codes.add(code));
    });
    return [...codes];
};

/**
 * A localised value without the languages left blank. A field that was typed
 * in and emptied again holds "", which the server drops on save; dropping it
 * here too keeps "was this changed?" from answering yes to nothing.
 */
export const withoutBlanks = (value) =>
    Object.fromEntries(
        Object.entries(value || {}).filter(([, text]) => String(text ?? "").trim())
    );

/* ---------------- answers ---------------- */

/**
 * The answer types whose value is a list of stored files (their ids), not
 * something to read. Kept here and not in `constants.js`, which imports this
 * file: the other way round would be a circle.
 */
export const FILE_TYPES = ["photo", "audio"];

/** Where the dashboard shows one such file: the address a link to it holds. */
export const filePath = (id) => `/questionnaire/responses/file/${id}`;

/**
 * A saved answer in words. This is the ONE place a stored value is turned
 * into text: the responses table, its two dialogs and both exports all read
 * it, so they cannot say different things about the same answer.
 *
 * `answer` is the snapshot a response carries (`{ type, options, value }`, its
 * `options` holding only what was chosen) and `column` the question as it is
 * asked today. A choice is named by the answer's own snapshot first (what the
 * person was shown), then by the question, and by its key only when neither
 * knows it.
 */
export const answerText = (answer, column, language) => {
    const value = answer?.value;
    if (value === null || value === undefined || value === "") return "";
    const type = answer.type || column?.type;
    if (type === "repeatable_group") {
        const count = Array.isArray(value) ? value.length : 0;
        return `${count} ${count === 1 ? "entry" : "entries"}`;
    }
    if (FILE_TYPES.includes(type)) {
        // A file is not words: how many there are is all that can be said.
        const count = [].concat(value).length;
        const word = type === "photo" ? "photo" : "recording";
        return count ? `${count} ${count === 1 ? word : `${word}s`}` : "";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (type === "date") {
        // A date answer is a day, saved as that day's midnight in UTC. Read
        // on the viewer's own clock it can come out as the day before.
        const day = moment.utc(value);
        return day.isValid() ? day.format("DD MMM, YYYY") : String(value);
    }
    const options = [...(answer.options || []), ...(column?.options || [])];
    return []
        .concat(value)
        .map((key) => {
            const option = options.find(
                (entry) => String(entry.value) === String(key)
            );
            return localise(option?.label, language) || String(key);
        })
        .join(", ");
};

/**
 * A file answer in an exported file: a link per file to the dashboard's own
 * page for it, which asks whoever opens it to sign in. A spreadsheet cannot
 * hold the photo, and a count alone would lead nowhere.
 */
const fileLinks = (answer, between) =>
    []
        .concat(answer.value ?? [])
        .map((id) => window.location.origin + filePath(id))
        .join(between);

/**
 * The entries of a group answer on one line: each entry as "label: answer;
 * label: answer", entries joined by " | ". The labels are the ones the person
 * was shown. A group inside an entry is written the same way, in square
 * brackets.
 */
const entriesText = (answer, column, language) =>
    (Array.isArray(answer?.value) ? answer.value : [])
        .map((entry) =>
            (entry.answers || [])
                .map((inner) => {
                    const child = (column?.children || []).find(
                        (question) =>
                            String(question.questionId) ===
                            String(inner.questionId)
                    );
                    return `${localise(inner.label, language)}: ${
                        inner.type === "repeatable_group"
                            ? `[${entriesText(inner, child, language)}]`
                            : FILE_TYPES.includes(inner.type)
                            ? // On the one line an entry has.
                              fileLinks(inner, " ")
                            : answerText(inner, child, language)
                    }`;
                })
                .join("; ")
        )
        .join(" | ");

/**
 * The same answer as one cell of an exported file. A spreadsheet has no
 * dialog to open, so a group is written out entry by entry; a number is left
 * a number, for the spreadsheet to add up; and each file is a link on a line
 * of its own.
 */
export const answerCell = (answer, column, language) =>
    answer?.type === "repeatable_group"
        ? entriesText(answer, column, language)
        : FILE_TYPES.includes(answer?.type)
        ? fileLinks(answer, "\n")
        : typeof answer?.value === "number"
        ? answer.value
        : answerText(answer, column, language);
