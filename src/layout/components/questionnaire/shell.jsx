import { Box, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";

/**
 * Shared chrome for the questionnaire screens so the three pages keep one
 * rhythm instead of each inventing its own header and empty state.
 */

export function PageHeader({ title, description, action }) {
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
                    <Text size="sm" c="dimmed" mt={4} maw={640}>
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
