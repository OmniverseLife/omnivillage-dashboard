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

/** Which languages a value is actually missing, for the completeness chip. */
export const missingLanguages = (value, languages) =>
    languages.filter((code) => !(value && value[code] && String(value[code]).trim()));
