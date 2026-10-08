import { Text } from "@mantine/core";

// The three families the design draws: blue for wording and options, orange
// for what a place added, grey for the rest. `text` is dark enough to read
// both on its `fill` and on white.
const TONES = {
    grey: {
        text: "var(--mantine-color-gray-7)",
        line: "var(--mantine-color-gray-5)",
        fill: "var(--mantine-color-gray-1)",
    },
    blue: {
        text: "var(--mantine-color-brand-8)",
        line: "var(--mantine-color-brand-6)",
        fill: "var(--mantine-color-brand-0)",
    },
    orange: {
        text: "#7a3a0c",
        line: "#b9651b",
        fill: "var(--mantine-color-orange-1)",
    },
};

/**
 * A rounded tag. Filled means "set at this level" and outlined "set at a
 * level above"; dashed is for what is hidden. When its column is narrow it
 * wraps between words, never inside one, and it is never cut short.
 */
export function Pill({ tone = "grey", filled, dashed, style, children, ...rest }) {
    const { text, line, fill } = TONES[tone];
    return (
        <Text
            component="span"
            fz={13}
            lh={1.3}
            px={10}
            py={3}
            {...rest}
            style={{
                display: "inline-block",
                border: `1px ${dashed ? "dashed" : "solid"} ${line}`,
                borderRadius: 14,
                color: text,
                backgroundColor: filled ? fill : "var(--mantine-color-white)",
                // A cell that lets a long question break anywhere must not
                // hand that on to the tag inside it.
                overflowWrap: "normal",
                ...style,
            }}
        >
            {children}
        </Text>
    );
}

const KINDS = {
    master: { tone: "grey" },
    hidden: { tone: "grey", word: "Hidden", dashed: true },
    added: { tone: "orange", word: "Added" },
    changed: { tone: "blue", word: "Changed" },
    options: { tone: "blue", word: "Options changed" },
};

/**
 * What a place did to a question, a category or an option, as one tag (PDF
 * p.9 and p.12). `status` is `{ kind, here, placeName }`: "Changed here",
 * filled, when the place on screen set it; "Changed in Ladakh", outlined,
 * when a place above it did. Nothing set anywhere reads "As in Master".
 */
export default function StatusPill({ status, ...rest }) {
    const { tone, word, dashed } = KINDS[status.kind] || KINDS.master;
    return (
        <Pill
            tone={tone}
            dashed={dashed}
            filled={Boolean(status.here) && !dashed}
            {...rest}
        >
            {word
                ? `${word} ${status.here ? "here" : `in ${status.placeName}`}`
                : "As in Master"}
        </Pill>
    );
}
