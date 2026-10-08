import { Anchor, Button, Group, Menu, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

/**
 * What can be done to several questions of a place at once (PDF p.13). It
 * takes the place of the pane's heading while any row is ticked, and saves
 * nothing itself.
 *
 * `pages` are the question pages a ticked question may move to, as
 * `{ value, label }`. Only a question the place added can be moved, so the
 * editor passes none when anything else is ticked and the button is off.
 */
export default function BulkBar({
    count,
    placeName,
    pages,
    busy,
    onHide,
    onShow,
    onMove,
    onClear,
}) {
    return (
        <Group
            justify="space-between"
            gap="md"
            px="md"
            py="sm"
            mb="md"
            bg="brand.0"
            style={{
                border: "1px solid var(--mantine-color-brand-3)",
                borderRadius: "var(--mantine-radius-md)",
            }}
        >
            <Text size="sm" fw={700} c="brand.8">
                {count} selected
            </Text>
            <Group gap="sm">
                <Button variant="default" disabled={busy} onClick={onHide}>
                    Hide in {placeName}
                </Button>
                <Button variant="default" disabled={busy} onClick={onShow}>
                    Show in {placeName}
                </Button>
                <Menu position="bottom-end" withinPortal shadow="md" width={280}>
                    <Menu.Target>
                        <Button
                            variant="default"
                            disabled={busy || pages.length === 0}
                            rightSection={<IconChevronDown size={16} />}
                        >
                            Move to category
                        </Button>
                    </Menu.Target>
                    {/* Every page of a questionnaire: taller than a window. */}
                    <Menu.Dropdown mah={320} style={{ overflowY: "auto" }}>
                        {pages.map((page) => (
                            <Menu.Item
                                key={page.value}
                                onClick={() => onMove(page.value)}
                            >
                                {page.label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
                <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    fw={600}
                    onClick={onClear}
                >
                    Clear
                </Anchor>
            </Group>
        </Group>
    );
}
