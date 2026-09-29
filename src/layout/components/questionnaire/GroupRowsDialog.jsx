import { Modal, Paper, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { localise } from "./localise";

const display = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return `${value.length} row(s)`;
    return String(value);
};

/**
 * Expands one repeatable_group cell into its rows.
 *
 * Rows render from the answers each row actually carries, keyed by questionId —
 * never by array position — so a row that skipped a field shows a dash rather
 * than shifting every value one column left.
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
                    No rows.
                </Text>
            ) : (
                <ScrollArea>
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={50}>#</Table.Th>
                                {children.map((child) => (
                                    <Table.Th key={child.questionId}>
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
                                                    "repeatable_group" ? (
                                                        <NestedRows
                                                            column={child}
                                                            value={answer?.value}
                                                            language={language}
                                                        />
                                                    ) : (
                                                        display(answer?.value)
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

/** A nested group inside a row (Livestock -> Products), rendered inline. */
function NestedRows({ column, value, language }) {
    const rows = Array.isArray(value) ? value : [];
    if (rows.length === 0) return <>—</>;

    return (
        <Stack gap={4}>
            {rows.map((row, index) => {
                const byId = {};
                (row.answers || []).forEach((answer) => {
                    byId[String(answer.questionId)] = answer;
                });
                return (
                    <Paper key={row.rowId || index} withBorder p={6} radius="sm">
                        {(column.children || []).map((child) => (
                            <Text size="xs" key={child.questionId}>
                                <Text span c="dimmed">
                                    {localise(child.label, language)}:{" "}
                                </Text>
                                {display(byId[String(child.questionId)]?.value)}
                            </Text>
                        ))}
                    </Paper>
                );
            })}
        </Stack>
    );
}
