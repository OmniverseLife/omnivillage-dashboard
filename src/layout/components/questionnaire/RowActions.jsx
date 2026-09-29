import { ActionIcon, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

/**
 * One overflow menu per row instead of a strip of always-visible icons.
 * A strip of four icons on every row is most of what made the tables read as
 * noisy; destructive and rarely-used actions belong behind one affordance.
 *
 * `items`: [{ label, icon, onClick, color?, disabled?, divider? }]
 */
export default function RowActions({ items, label = "Row actions" }) {
    return (
        <Menu position="bottom-end" withinPortal shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={label}
                    onClick={(event) => event.stopPropagation()}
                >
                    <IconDots size={18} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
                {items.map((item, index) =>
                    item.divider ? (
                        <Menu.Divider key={`d-${index}`} />
                    ) : (
                        <Menu.Item
                            key={item.label}
                            leftSection={item.icon}
                            color={item.color}
                            disabled={item.disabled}
                            onClick={item.onClick}
                        >
                            {item.label}
                        </Menu.Item>
                    )
                )}
            </Menu.Dropdown>
        </Menu>
    );
}
