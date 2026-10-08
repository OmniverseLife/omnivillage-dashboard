import {
    Alert,
    Anchor,
    Box,
    Button,
    Checkbox,
    Divider,
    Group,
    Modal,
    Stack,
    Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { plural } from "./constants";
import { localise } from "./localise";
import { SectionHeading } from "./shell";

// The wording that belongs to one kind of questionnaire (see the panel).
const COPY = {
    master: {
        title: (changes) => `Publish ${changes} to the Master`,
        note: "Every place that has not made its own change gets these.",
        heading: "Master",
        footer: "Field users get the changes the next time the app syncs.",
    },
};

// `reach` is the place with its villages, or a village on its own.
const placeCopy = (name, reach) => ({
    title: (changes) => `Publish ${changes} for ${name}`,
    note: `Only ${reach} ${
        reach === name ? "changes" : "change"
    }. The Master and every other place stay as they are.`,
    heading: name,
    footer: `Field users in ${name} get the changes the next time the app syncs.`,
});

/**
 * The changes waiting to be published (PDF p.22). `pending` is the editor
 * payload's list: one entry per row here, each carrying the `items` the
 * server wants back for it.
 *
 * A change can be ticked off to stay a draft. Some cannot go without another
 * (a question on a page that is itself new), which `dependsOn` says: unticking
 * a row unticks what needs it, and ticking one ticks what it needs, so what
 * is sent is never something the server would have to skip.
 *
 * A place (`placeName` is its name) publishes for itself and for every place
 * inside it, so its rows come under one heading per place. A row's
 * `placeNames` is the path from the place on screen down to its own.
 *
 * `skipped` is what the last publish left behind, with the server's reasons.
 */
export default function PublishDialog({
    scope,
    placeName,
    placeReach,
    opened,
    onClose,
    pending,
    language,
    skipped = [],
    onPublish,
    onDiscard,
    busy,
}) {
    // Keys of the rows ticked OFF, so a row that turns up while the dialog
    // is open starts ticked like the rest.
    const [off, setOff] = useState(new Set());
    const [asking, setAsking] = useState(null);
    const copy =
        scope.type === "master" ? COPY.master : placeCopy(placeName, placeReach);

    // In the order the rows arrive: the place itself, then those inside it.
    // Kept apart by their whole path; headed by its two ends ("Ladakh ›
    // Village 1"), which is as much as a heading holds.
    const groups = new Map();
    pending.forEach((row) => {
        const path = (row.placeNames || []).join(" › ");
        if (!groups.has(path))
            groups.set(path, {
                heading:
                    row.placeNames?.length > 2
                        ? `${row.placeNames[0]} › ${row.placeNames.at(-1)}`
                        : path || copy.heading,
                rows: [],
            });
        groups.get(path).rows.push(row);
    });

    useEffect(() => {
        if (!opened) return;
        setOff(new Set());
        setAsking(null);
    }, [opened]);

    const ticked = pending.filter((row) => !off.has(row.key));

    const toggle = (row) => {
        const next = new Set(off);
        if (next.has(row.key)) {
            const tick = (key) => {
                if (!next.delete(key)) return;
                pending
                    .find((other) => other.key === key)
                    ?.dependsOn?.forEach(tick);
            };
            tick(row.key);
        } else {
            const untick = (key) => {
                if (next.has(key)) return;
                next.add(key);
                pending
                    .filter((other) => other.dependsOn?.includes(key))
                    .forEach((other) => untick(other.key));
            };
            untick(row.key);
        }
        setOff(next);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={720}
            centered
            radius="md"
            title={
                <Box>
                    <Text fw={700}>
                        {copy.title(plural(pending.length, "change"))}
                    </Text>
                    <Text size="xs" c="dimmed">
                        Nothing reaches the app until you publish. Untick a
                        change to keep it as a draft.
                    </Text>
                </Box>
            }
        >
            <Stack gap="md">
                <Alert variant="light">{copy.note}</Alert>

                {skipped.length > 0 && (
                    <Alert variant="light" color="orange" title="Not published">
                        {skipped.map((row) => (
                            <Text size="sm" key={row.key}>
                                <Text span inherit fw={700}>
                                    {row.name}
                                </Text>
                                {row.name && " · "}
                                {row.reason}
                            </Text>
                        ))}
                    </Alert>
                )}

                {pending.length === 0 && (
                    <Box>
                        <SectionHeading mb="xs">{copy.heading}</SectionHeading>
                        <Text size="sm" c="dimmed">
                            Nothing to publish.
                        </Text>
                    </Box>
                )}
                {[...groups].map(([path, { heading, rows }], index) => (
                    <Box key={path}>
                        {index > 0 && <Divider mb="md" />}
                        <SectionHeading mb="xs">{heading}</SectionHeading>
                        {rows.map((row) => {
                            const name = localise(row.label, language);
                            return (
                                <Group
                                    key={row.key}
                                    justify="space-between"
                                    wrap="nowrap"
                                    gap="md"
                                    py={8}
                                >
                                    <Checkbox
                                        checked={!off.has(row.key)}
                                        onChange={() => toggle(row)}
                                        label={
                                            <>
                                                <Text span inherit fw={700}>
                                                    {name}
                                                </Text>
                                                {name && " · "}
                                                {row.summary}
                                            </>
                                        }
                                    />
                                    {asking === row.key ? (
                                        <Group
                                            gap="sm"
                                            wrap="nowrap"
                                            style={{ flexShrink: 0 }}
                                        >
                                            <Text size="sm">
                                                Discard this change?
                                            </Text>
                                            <Anchor
                                                component="button"
                                                type="button"
                                                size="sm"
                                                fw={600}
                                                c="red.9"
                                                onClick={() => {
                                                    setAsking(null);
                                                    onDiscard(row);
                                                }}
                                            >
                                                Discard
                                            </Anchor>
                                            <Anchor
                                                component="button"
                                                type="button"
                                                size="sm"
                                                fw={600}
                                                onClick={() => setAsking(null)}
                                            >
                                                Keep
                                            </Anchor>
                                        </Group>
                                    ) : (
                                        <Anchor
                                            component="button"
                                            type="button"
                                            size="sm"
                                            fw={600}
                                            style={{ flexShrink: 0 }}
                                            onClick={() => setAsking(row.key)}
                                        >
                                            Discard
                                        </Anchor>
                                    )}
                                </Group>
                            );
                        })}
                    </Box>
                ))}

                <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
                <Group justify="space-between" wrap="nowrap" gap="md">
                    <Text size="sm" c="dimmed">
                        {copy.footer}
                    </Text>
                    <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                        <Button variant="default" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            disabled={ticked.length === 0}
                            loading={busy}
                            onClick={() => onPublish(ticked)}
                        >
                            Publish {plural(ticked.length, "change")}
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
}
