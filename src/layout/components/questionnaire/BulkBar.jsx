import { Anchor, Button, Group, Menu, Text } from "@mantine/core";
import { Fragment } from "react";
import { IconChevronDown } from "@tabler/icons-react";

/**
 * What can be done to several questions of a place at once (PDF p.13). It
 * takes the place of the pane's heading while any row is ticked, and saves
 * nothing itself.
 *
 * `pages` are the question pages a ticked question may move to, as
 * `{ value, label }`. Only a question the place added can be moved, so the
 * editor passes none when anything else is ticked and the button is off.
 *
 * In the Master (no `placeName`) there is nothing to hide or show: the bar
 * moves what is ticked, to the places in `pages`, each with the `group` it
 * is listed under.
 *
 * `compact` is the bar over the category tree, a narrow pane, which moves
 * ticked categories the same way.
 */
export default function BulkBar({
    count,
    placeName,
    pages,
    busy,
    compact,
    onHide,
    onShow,
    onMove,
    onClear,
}) {
    return (
        <Group
            justify="space-between"
            gap={compact ? 4 : "md"}
            wrap={compact ? "nowrap" : undefined}
            px={compact ? 8 : "md"}
            py={compact ? 6 : "sm"}
            mb={compact ? 0 : "md"}
            bg="brand.0"
            style={{
                border: "1px solid var(--mantine-color-brand-3)",
                borderRadius: "var(--mantine-radius-md)",
            }}
        >
            <Text size={compact ? "xs" : "sm"} fw={700} c="brand.8">
                {count} selected
            </Text>
            <Group gap={compact ? 8 : "sm"} wrap="nowrap">
                {placeName && (
                    <>
                        <Button variant="default" disabled={busy} onClick={onHide}>
                            Hide in {placeName}
                        </Button>
                        <Button variant="default" disabled={busy} onClick={onShow}>
                            Show in {placeName}
                        </Button>
                    </>
                )}
                <Menu
                    position={compact ? "bottom-start" : "bottom-end"}
                    withinPortal
                    shadow="md"
                    width={280}
                >
                    <Menu.Target>
                        <Button
                            variant="default"
                            size={compact ? "compact-sm" : undefined}
                            disabled={busy || pages.length === 0}
                            rightSection={<IconChevronDown size={16} />}
                        >
                            {placeName ? "Move to category" : "Move to"}
                        </Button>
                    </Menu.Target>
                    {/* Every page of a questionnaire: taller than a window. */}
                    <Menu.Dropdown mah={320} style={{ overflowY: "auto" }}>
                        {pages.map((page, index) => (
                            <Fragment key={page.value}>
                                {page.group &&
                                    page.group !== pages[index - 1]?.group && (
                                        <Menu.Label>{page.group}</Menu.Label>
                                    )}
                                <Menu.Item onClick={() => onMove(page.value)}>
                                    {page.label}
                                </Menu.Item>
                            </Fragment>
                        ))}
                    </Menu.Dropdown>
                </Menu>
                <Anchor
                    component="button"
                    type="button"
                    size={compact ? "xs" : "sm"}
                    fw={600}
                    onClick={onClear}
                >
                    Clear
                </Anchor>
            </Group>
        </Group>
    );
}
