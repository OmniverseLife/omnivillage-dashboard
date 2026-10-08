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
    return (
        value[language] ||
        value[DEFAULT_LANGUAGE] ||
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

/** Which languages a value is actually missing, for the completeness chip. */
export const missingLanguages = (value, languages) =>
    languages.filter((code) => !(value && value[code] && String(value[code]).trim()));

/* ---------------- answers ---------------- */

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
                            : answerText(inner, child, language)
                    }`;
                })
                .join("; ")
        )
        .join(" | ");

/**
 * The same answer as one cell of an exported file. A spreadsheet has no
 * dialog to open, so a group is written out entry by entry; and a number is
 * left a number, for the spreadsheet to add up.
 */
export const answerCell = (answer, column, language) =>
    answer?.type === "repeatable_group"
        ? entriesText(answer, column, language)
        : typeof answer?.value === "number"
        ? answer.value
        : answerText(answer, column, language);
