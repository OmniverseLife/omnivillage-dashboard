import { Modal, Paper, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { answerText, localise } from "./localise";
import { dataTableProps } from "./tableStyles";

// The column headings every questionnaire table has. Each stays on one
// line: a list has more fields than the dialog is wide, and the table then
// scrolls sideways rather than breaking every heading into a column of words.
const heading = {
    ...dataTableProps.defaultColumnProps.titleStyle,
    whiteSpace: "nowrap",
};

/**
 * The entries of one group answer where there is no room for a table (a
 * group inside an entry, the dialog that shows one whole response): each
 * entry in a bordered block of "label: answer" lines, in the wording the
 * person was shown. `column` is the group as the list has it; its `children`
 * name the choices an answer does not carry itself.
 */
export function Entries({ column, value, language, size = "xs" }) {
    return (
        <Stack gap={4}>
            {(Array.isArray(value) ? value : []).map((entry, index) => (
                <Paper key={entry.rowId || index} withBorder p={6} radius="sm">
                    {(entry.answers || []).map((answer) => {
                        const child = (column?.children || []).find(
                            (question) =>
                                String(question.questionId) ===
                                String(answer.questionId)
                        );
                        return (
                            // A div, not a paragraph: a group inside this
                            // entry is a block of its own.
                            <Text
                                component="div"
                                size={size}
                                key={answer.questionId}
                            >
                                <Text span inherit c="dimmed">
                                    {localise(answer.label, language)}:{" "}
                                </Text>
                                {answer.type === "repeatable_group" ? (
                                    <Entries
                                        column={child}
                                        value={answer.value}
                                        language={language}
                                        size={size}
                                    />
                                ) : (
                                    answerText(answer, child, language)
                                )}
                            </Text>
                        );
                    })}
                </Paper>
            ))}
        </Stack>
    );
}

/**
 * Expands one group cell of the responses table into its entries, one row
 * each.
 *
 * Rows render from the answers each entry actually carries, keyed by
 * questionId — never by array position — so an entry that skipped a field
 * shows a dash rather than shifting every value one column left.
 */
export default function GroupRowsDialog({ open, onClose, column, value, language }) {
    const children = column?.children || [];
    const rows = Array.isArray(value) ? value : [];

    return (
        <Modal
            opened={open}
            onClose={onClose}
            size="xl"
            centered
            radius="md"
            title={<Text fw={700}>{localise(column?.label, language)}</Text>}
        >
            {rows.length === 0 ? (
                <Text c="dimmed" size="sm">
                    No entries.
                </Text>
            ) : (
                // The bar stays in view: it is the only sign of more fields.
                <ScrollArea type="auto" offsetScrollbars="x">
                    <Table verticalSpacing="sm" horizontalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={50} style={heading}>
                                    #
                                </Table.Th>
                                {children.map((child) => (
                                    <Table.Th
                                        key={child.questionId}
                                        style={heading}
                                    >
                                        {localise(child.label, language)}
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.map((row, index) => {
                                const byId = {};
                                (row.answers || []).forEach((answer) => {
                                    byId[String(answer.questionId)] = answer;
                                });
                                return (
                                    <Table.Tr key={row.rowId || index}>
                                        <Table.Td>{index + 1}</Table.Td>
                                        {children.map((child) => {
                                            const answer =
                                                byId[String(child.questionId)];
                                            return (
                                                <Table.Td key={child.questionId}>
                                                    {child.type ===
                                                        "repeatable_group" &&
                                                    answer?.value?.length ? (
                                                        <Entries
                                                            column={child}
                                                            value={answer.value}
                                                            language={language}
                                                        />
                                                    ) : (
                                                        answerText(
                                                            answer,
                                                            child,
                                                            language
                                                        ) || "—"
                                                    )}
                                                </Table.Td>
                                            );
                                        })}
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            )}
        </Modal>
    );
}
