/**
 * Shared DataTable presentation for the questionnaire screens.
 *
 * mantine-datatable's `styles` accepts ONLY root | table | header | footer |
 * pagination — unknown keys (e.g. `th`) are silently ignored. Header CELL
 * typography therefore goes through `defaultColumnProps.titleStyle`.
 */
export const dataTableProps = {
    withTableBorder: false,
    withRowBorders: true,
    highlightOnHover: true,
    verticalSpacing: "sm",
    horizontalSpacing: "md",
    minHeight: 180,
    // Sentence case on white, as the design draws every table: small, muted,
    // semi-bold. (Was an uppercase band; the old pages do not use this file.)
    defaultColumnProps: {
        titleStyle: {
            fontSize: "var(--mantine-font-size-sm)",
            fontWeight: 600,
            color: "var(--mantine-color-gray-6)",
        },
    },
};
