import { Group, Text, Tooltip } from "@mantine/core";

const TONES = {
    live: { color: "var(--mantine-color-green-6)", text: undefined },
    hidden: { color: "var(--mantine-color-gray-5)", text: "dimmed" },
    retired: { color: "var(--mantine-color-gray-4)", text: "dimmed" },
};

/**
 * A quiet status indicator. The normal state ("Live") should be the least
 * visually loud thing in a row — only the exceptions deserve attention — so
 * this is a small dot and a word, not a coloured control.
 */
export default function StatusDot({ status, label, tooltip }) {
    const tone = TONES[status] || TONES.live;
    const body = (
        <Group gap={8} wrap="nowrap">
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: tone.color,
                    flexShrink: 0,
                }}
            />
            <Text size="sm" c={tone.text}>
                {label}
            </Text>
        </Group>
    );
    return tooltip ? (
        <Tooltip label={tooltip} withArrow multiline w={260}>
            {body}
        </Tooltip>
    ) : (
        body
    );
}
