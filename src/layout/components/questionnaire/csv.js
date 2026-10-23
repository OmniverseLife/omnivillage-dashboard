/**
 * "Export to Excel": a CSV file built in the browser from rows already on
 * hand. `lines` is an array of rows, each an array of cells.
 */

// One cell. Villagers type these answers and an admin opens the file in
// Excel, which runs a cell that begins like a formula. A TEXT cell that
// starts with one of these characters therefore gets a leading apostrophe,
// which makes it plain text there. A number stays a number: -5 is not text.
const cell = (value) => {
    const text = String(value ?? "");
    const safe =
        typeof value === "string" && /^[=+\-@\t\r]/.test(text)
            ? `'${text}`
            : text;
    return `"${safe.replace(/"/g, '""')}"`;
};

/** The text of the file. */
export const csvText = (lines) =>
    // The mark that tells Excel the file is UTF-8. Without it every name
    // outside Latin script is misread.
    "﻿" + lines.map((cells) => cells.map(cell).join(",")).join("\r\n");

/**
 * A file name from its parts: ("responses", "Water usage", "Ladakh",
 * "2026-10-08") gives "responses-water-usage-ladakh-2026-10-08.csv". Letters
 * and digits of any script are kept, with the marks that belong to them (the
 * vowel signs of Dzongkha, say); everything else becomes a hyphen.
 */
export const csvName = (...parts) =>
    `${parts
        .map((part) =>
            String(part || "")
                .toLowerCase()
                .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
                .replace(/^-|-$/g, "")
        )
        .filter(Boolean)
        .join("-")}.csv`;

/** Hands the browser `lines` to save as the file `name`. */
export const downloadCsv = (name, lines) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
        new Blob([csvText(lines)], { type: "text/csv;charset=utf-8" })
    );
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
};
