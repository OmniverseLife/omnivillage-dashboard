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
    styles: {
        header: {
            backgroundColor: "var(--mantine-color-gray-0)",
        },
    },
    defaultColumnProps: {
        titleStyle: {
            fontSize: "var(--mantine-font-size-xs)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--mantine-color-gray-6)",
        },
    },
};
