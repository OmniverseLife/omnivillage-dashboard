import { localise } from "./localise";

export const QUESTION_TYPES = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "single_select", label: "Single select" },
    { value: "multi_select", label: "Multi select" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes / No" },
    { value: "repeatable_group", label: "Repeatable group (+ Add row)" },
    { value: "section", label: "Section (groups questions)" },
];

/** Types that own child questions rather than holding a value of their own. */
export const PARENT_TYPES = ["repeatable_group", "section"];

export const SELECT_TYPES = ["single_select", "multi_select"];

export const typeLabel = (value) =>
    QUESTION_TYPES.find((t) => t.value === value)?.label || value;

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
