import {
    Alert,
    Box,
    Button,
    Checkbox,
    Divider,
    Group,
    Modal,
    Select,
    Stack,
    Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchUsage } from "../../../functions/questionnaire";
import {
    PARENT_TYPES,
    QUESTION_TYPES,
    nameList,
    plural,
    shortTypeLabel,
} from "./constants";

/**
 * The small centred dialogs the editor asks its questions in. None of them
 * saves anything: each hands the answer back and the editor does the work,
 * so one place owns what is sent and what happens when it is refused.
 */

function Dialog({ title, subtitle, actions, children, ...modal }) {
    return (
        <Modal
            size={460}
            centered
            radius="md"
            title={
                <Box>
                    <Text fw={700}>{title}</Text>
                    {subtitle && (
                        <Text size="xs" c="dimmed">
                            {subtitle}
                        </Text>
                    )}
                </Box>
            }
            {...modal}
        >
            <Stack gap="md">
                {children}
                <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
                <Group justify="flex-end" gap="sm">
                    {actions}
                </Group>
            </Stack>
        </Modal>
    );
}

const ARCHIVE = {
    question: {
        lead: "This question has saved answers, so it cannot be deleted. Archiving removes it from the app in every place.",
        restore: "You can restore the question later from “Show archived”.",
        note: "A question or option with no saved answers shows Delete here instead.",
    },
    category: {
        lead: "This category is not empty, so it cannot be deleted. Archiving removes it, and everything inside it, from the app in every place.",
        restore: "You can restore the category later from its menu.",
        note: "A category with no questions and nothing inside it shows Delete here instead.",
    },
};

const DELETE = {
    question:
        "This question has no saved answers, so it can be deleted. Deleting removes it from the app in every place.",
    category:
        "This category has no questions and nothing inside it, so it can be deleted.",
};

/** Nothing to say about answers when there are none; no number while it loads. */
const answersKept = (count) =>
    count === 0
        ? ""
        : count === 1
        ? "The 1 answer already collected stays in Responses, marked as archived. "
        : `The ${
              count === undefined ? "" : `${count} `
          }answers already collected stay in Responses, marked as archived. `;

/**
 * Archive (PDF p.6), for a question or a category. With `remove` it is the
 * Delete form the page's footnote promises for something no answer depends
 * on. `target` is `{ _id, name, unpublished }`. `lead` replaces the opening
 * sentence where the Master's does not hold: a question only one place has.
 */
export function ArchiveQuestionDialog({
    opened,
    onClose,
    kind = "question",
    target,
    subtitle,
    remove,
    lead,
    onConfirm,
    loading,
}) {
    const { data: usage } = useQuery({
        queryKey: ["questionnaire-usage", kind, target?._id],
        queryFn: () =>
            fetchUsage(
                kind === "question"
                    ? { questionId: target._id }
                    : { categoryId: target._id }
            ),
        enabled: opened && !remove,
    });
    const verb = remove ? "Delete" : "Archive";

    return (
        <Dialog
            opened={opened}
            onClose={onClose}
            title={`${verb} “${target?.name}”?`}
            subtitle={subtitle}
            actions={
                <>
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button color="red.9" loading={loading} onClick={onConfirm}>
                        {verb} {kind}
                    </Button>
                </>
            }
        >
            <Text size="sm">
                {lead || (remove ? DELETE[kind] : ARCHIVE[kind].lead)}
            </Text>
            {!remove && (
                <Alert variant="light">
                    {answersKept(usage?.answerCount)}
                    {ARCHIVE[kind].restore}
                </Alert>
            )}
            <Text size="sm" c="dimmed">
                {!remove
                    ? ARCHIVE[kind].note
                    : target?.unpublished
                    ? "It was never published, so it is deleted straight away."
                    : "The deletion is saved as a draft. It reaches the app only when you publish."}
            </Text>
        </Dialog>
    );
}

/**
 * Every type but the one it has. A field inside a group or section is not
 * offered a type that holds fields: nesting has its own limits.
 */
const replacementTypes = (question) =>
    QUESTION_TYPES.map((entry) => entry.value).filter(
        (value) =>
            value !== question.type &&
            !(question.parentQuestionId && PARENT_TYPES.includes(value))
    );

/**
 * A new answer type for a question whose type is locked (PDF p.5). It only
 * collects the choice: `onCreate({ type, copy })` opens the new question for
 * the admin to finish, and the old one is archived when that one is published.
 */
export function ReplacementDialog({ opened, onClose, question, name, onCreate }) {
    // What the places that changed this question get (not on the design's
    // page 5, which shows a question no place has touched): where it was
    // hidden the new one stays hidden; wording and options written for the
    // old question are not carried over to a question of another type.
    const { hiddenIn = [], rewordedIn = [], optionsChangedIn = [] } =
        question?.usage || {};
    const reworded = [...new Set([...rewordedIn, ...optionsChangedIn])];
    const forPlaces = [
        hiddenIn.length > 0 &&
            `The new question stays hidden in ${nameList(hiddenIn)}.`,
        reworded.length > 0 &&
            `The wording and option changes of ${nameList(
                reworded
            )} are not carried over to it.`,
    ].filter(Boolean);
    const types = question ? replacementTypes(question) : [];
    const [type, setType] = useState("");
    const [copy, setCopy] = useState(true);

    useEffect(() => {
        if (!opened || !question) return;
        // One kind of choice usually becomes the other kind.
        setType(
            { single_select: "multi_select", multi_select: "single_select" }[
                question.type
            ] || replacementTypes(question)[0]
        );
        setCopy(true);
    }, [opened, question]);

    return (
        <Dialog
            opened={opened}
            onClose={onClose}
            title="Create a replacement question"
            subtitle={`For “${name}”, whose answer type is locked`}
            actions={
                <>
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={() => onCreate({ type, copy })}>
                        Create replacement
                    </Button>
                </>
            }
        >
            <Text size="sm">
                The answer type cannot change because answers are already
                saved. A replacement gives you a new type without touching
                past answers.
            </Text>
            <Select
                label="New answer type"
                allowDeselect={false}
                data={types.map((value) => ({
                    value,
                    label: shortTypeLabel(value),
                }))}
                value={type}
                onChange={setType}
            />
            <Checkbox
                label="Copy the wording and options into the new question"
                checked={copy}
                onChange={(event) => setCopy(event.currentTarget.checked)}
            />
            <Alert variant="light" title="What happens when you continue">
                <Text size="sm">
                    1. “{name}” is archived. Its answers stay in Responses.
                </Text>
                <Text size="sm">
                    2. A new question takes its position in the list.
                </Text>
                <Text size="sm">
                    3. The new question opens for you to finish and save.
                </Text>
                {forPlaces.map((sentence) => (
                    <Text key={sentence} size="sm" mt={6}>
                        {sentence}
                    </Text>
                ))}
            </Alert>
        </Dialog>
    );
}

/**
 * Shown before an edit to wording or options is saved (PDF p.7): how far a
 * change to the Master reaches. `wording` is false when only the options
 * changed, and the sentence then says so.
 *
 * `kept` is the question's `usage.wording`, given when its own wording is
 * what changed: a place that reworded the question keeps its wording, so the
 * new one reaches fewer places than `reach`, and those places are named.
 */
export function MasterImpactDialog({
    opened,
    onClose,
    name,
    summary,
    wording,
    reach,
    kept,
    onConfirm,
}) {
    const reached = kept || reach;
    const keepers = kept?.keptBy || [];
    return (
        <Dialog
            opened={opened}
            onClose={onClose}
            title="This changes the Master"
            subtitle={`“${name}” · ${summary}`}
            actions={
                <>
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm}>Save to draft</Button>
                </>
            }
        >
            <Alert variant="light" color="orange">
                {wording ? "The new wording reaches " : "The new options reach "}
                <Text span inherit fw={700}>
                    {plural(reached?.countries ?? 0, "country", "countries")}{" "}
                    and {plural(reached?.villages ?? 0, "village")}
                </Text>
                .
            </Alert>
            {keepers.length > 0 && (
                <Text size="sm">
                    {keepers.length === 1
                        ? "1 place has its own wording for this question and keeps it: "
                        : `${keepers.length} places have their own wording for this question and keep it: `}
                    {nameList(keepers)}.
                </Text>
            )}
            <Text size="sm" c="dimmed">
                The change is saved as a draft. It reaches the app only when
                you publish.
            </Text>
        </Dialog>
    );
}

/**
 * Asked before a place hides a category (PDF p.20): every question in it
 * goes out of that place's app with it. Showing it again asks nothing.
 */
export function HideCategoryDialog({
    opened,
    onClose,
    name,
    placeName,
    placeReach,
    onConfirm,
    loading,
}) {
    return (
        <Dialog
            opened={opened}
            onClose={onClose}
            title={`Hide ${name} in ${placeName}?`}
            actions={
                <>
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button loading={loading} onClick={onConfirm}>
                        Hide in {placeName}
                    </Button>
                </>
            }
        >
            <Text size="sm">
                Field users in {placeReach || placeName} will no longer see{" "}
                {name} or any of its questions. Every other place still sees
                it.
            </Text>
            <Text size="sm" c="dimmed">
                Answers already collected stay in Responses. You can show the
                category again at any time.
            </Text>
        </Dialog>
    );
}

/**
 * Asked before a place gives up what it changed about a question (PDF p.17):
 * its wording and its option changes. Whether the place asks the question is
 * a switch of its own and stays as it is.
 */
export function ResetDialog({
    opened,
    onClose,
    name,
    placeName,
    placeReach,
    onConfirm,
    loading,
}) {
    return (
        <Dialog
            opened={opened}
            onClose={onClose}
            title="Reset to the Master version?"
            subtitle={`“${name}” in ${placeName}`}
            actions={
                <>
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button loading={loading} onClick={onConfirm}>
                        Reset to the Master version
                    </Button>
                </>
            }
        >
            <Text size="sm">
                {placeName}&apos;s own wording and option changes for this
                question are removed.{" "}
                {placeReach && placeReach !== placeName
                    ? `${placeReach} go`
                    : `${placeName} goes`}{" "}
                back to the Master version.
            </Text>
            <Text size="sm" c="dimmed">
                Answers already collected are not changed.
            </Text>
        </Dialog>
    );
}

/**
 * Asked before the latest published change is taken back (PDF p.23).
 * `change` is that change as its row in the history reads.
 */
export function UndoDialog({
    opened,
    onClose,
    change,
    added,
    onConfirm,
    loading,
}) {
    return (
        <Dialog
            opened={opened}
            onClose={onClose}
            title="Undo this change?"
            subtitle={change}
            actions={
                <>
                    <Button variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button loading={loading} onClick={onConfirm}>
                        Undo
                    </Button>
                </>
            }
        >
            {/* Something that was added has no earlier version to go back
                to: undoing it takes it out again. */}
            <Text size="sm">
                {added
                    ? "It is taken out again at once. This is refused if answers have been saved for it."
                    : "The earlier version is published again at once."}
            </Text>
        </Dialog>
    );
}
