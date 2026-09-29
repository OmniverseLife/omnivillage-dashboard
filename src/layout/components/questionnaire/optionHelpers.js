export { DEFAULT_LANGUAGE } from "./localise";

/** "Whole grain" -> "whole_grain". The option's immutable identity key. */
export const slugifyLocalised = (label) =>
    String(label || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 60);
