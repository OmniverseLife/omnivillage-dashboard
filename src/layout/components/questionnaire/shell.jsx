import { Box, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";

/**
 * Shared chrome for the questionnaire screens so the three pages keep one
 * rhythm instead of each inventing its own header and empty state.
 */

// `maw` is how wide the description may run: wider where the design keeps a
// longer sentence on one line.
export function PageHeader({ title, description, action, maw = 640 }) {
    return (
        <Group
            justify="space-between"
            align="flex-start"
            wrap="nowrap"
            gap="xl"
            mb="xl"
        >
            <Box style={{ flex: 1, minWidth: 0 }}>
                <Title order={2} fw={700} style={{ letterSpacing: "-0.02em" }}>
                    {title}
                </Title>
                {description && (
                    <Text size="sm" c="dimmed" mt={4} maw={maw}>
                        {description}
                    </Text>
                )}
            </Box>
            {action && (
                <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                    {action}
                </Group>
            )}
        </Group>
    );
}

/** The small-caps heading the design puts over each part of a panel or list. */
export function SectionHeading({ children, ...rest }) {
    return (
        <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            style={{ letterSpacing: "0.05em" }}
            {...rest}
        >
            {children}
        </Text>
    );
}

export function EmptyState({ icon, title, description, action }) {
    return (
        <Paper
            withBorder
            radius="md"
            p={48}
            style={{ borderStyle: "dashed", textAlign: "center" }}
        >
            <Stack align="center" gap="xs">
                {icon && (
                    <ThemeIcon variant="light" color="gray" size={56} radius="xl">
                        {icon}
                    </ThemeIcon>
                )}
                <Text fw={600} size="lg" mt="xs">
                    {title}
                </Text>
                {description && (
                    <Text size="sm" c="dimmed" maw={420}>
                        {description}
                    </Text>
                )}
                {action && <Box mt="md">{action}</Box>}
            </Stack>
        </Paper>
    );
}
