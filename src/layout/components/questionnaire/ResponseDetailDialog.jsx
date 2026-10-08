import { Alert, Box, Button, Divider, Group, Modal, Stack, Text } from "@mantine/core";
import moment from "moment";
import { Entries } from "./GroupRowsDialog";
import { Pill } from "./StatusPill";
import { STICKY_FOOTER } from "./constants";
import { csvName, downloadCsv } from "./csv";
import { answerCell, answerText, localise } from "./localise";
import { SectionHeading } from "./shell";

// "Changed in Ladakh". The list names every place its answers and columns
// mention; one deleted since leaves the word on its own.
const within = (word, place) => (place ? `${word} in ${place.name}` : word);

/**
 * What sets an answer apart, as the tags beside its wording: the place whose
 * wording it was answered under, a question the Master has archived since,
 * a question only a place asks. The same words go into the exported file.
 */
const notesOf = (answer, column, places) =>
    [
        answer.changedIn && {
            tone: "blue",
            text: within("Changed", places[answer.changedIn]),
        },
        column.active === false && { tone: "grey", text: "Archived" },
        column.ownerPlaceId && {
            tone: "orange",
            text: within("Added", places[column.ownerPlaceId]),
        },
    ].filter(Boolean);

/** The answers of one response, and the buttons under them. */
function Response({
    row,
    columns,
    places,
    heading,
    village,
    language,
    onPrevious,
    onNext,
}) {
    // Every answer given, in the order of the list's columns.
    const answered = columns.flatMap((column) => {
        const answer = row.answers?.[column.questionId];
        return answer
            ? [{ column, answer, notes: notesOf(answer, column, places) }]
            : [];
    });

    const exportResponse = () =>
        downloadCsv(
            csvName(
                "response",
                heading,
                row.userName,
                moment(row.submittedAt).format("YYYY-MM-DD")
            ),
            [
                ["Question", "Answer", "Note"],
                ...answered.map(({ column, answer, notes }) => [
                    localise(answer.label, language),
                    answerCell(answer, column, language),
                    notes.map((note) => note.text).join(", "),
                ]),
            ]
        );

    return (
        <Stack gap="md">
            <Alert variant="light">
                {/* An older response did not record its version. */}
                {row.questionnaireVersion !== null &&
                    row.questionnaireVersion !== undefined &&
                    `Answered on questionnaire version ${row.questionnaireVersion}. `}
                Wording below is what this user saw in {village}.
            </Alert>

            <SectionHeading>{heading}</SectionHeading>

            {answered.length === 0 && (
                <Text size="sm" c="dimmed">
                    No answers were saved on this page.
                </Text>
            )}
            {answered.map(({ column, answer, notes }, index) => (
                <Box key={column.questionId}>
                    {index > 0 && <Divider mb="md" />}
                    <Group gap="xs" mb={4}>
                        <Text size="sm" c="dimmed">
                            {localise(answer.label, language)}
                        </Text>
                        {notes.map((note) => (
                            <Pill key={note.text} tone={note.tone} filled>
                                {note.text}
                            </Pill>
                        ))}
                    </Group>
                    {answer.type === "repeatable_group" ? (
                        <Entries
                            column={column}
                            value={answer.value}
                            language={language}
                            size="sm"
                        />
                    ) : (
                        <Text
                            size="sm"
                            fw={700}
                            style={{ overflowWrap: "anywhere" }}
                        >
                            {answerText(answer, column, language)}
                        </Text>
                    )}
                </Box>
            ))}

            <Group
                justify="space-between"
                gap="sm"
                wrap="nowrap"
                style={STICKY_FOOTER}
            >
                <Group gap="sm" wrap="nowrap">
                    <Button
                        variant="default"
                        disabled={!onPrevious}
                        onClick={onPrevious}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="default"
                        disabled={!onNext}
                        onClick={onNext}
                    >
                        Next
                    </Button>
                </Group>
                <Button variant="default" onClick={exportResponse}>
                    Export this response
                </Button>
            </Group>
        </Stack>
    );
}

/**
 * One response in full (PDF p.29): every answer the person gave on this
 * page, in the wording they were shown.
 *
 * Nothing is requested here: `row` is a row of the list, which already
 * carries every answer of that response, and `columns` are the list's own.
 * `places` names the places its tags mention. `where` ("Ladakh › Village 1")
 * and `village` are written by the page, which knows the place on screen.
 * `onPrevious` and `onNext` walk the rows of the table's page; each is
 * missing at its end of the page.
 */
export default function ResponseDetailDialog({
    opened,
    onClose,
    row,
    where,
    ...response
}) {
    return (
        // On the page before any response is opened, and so without one: a
        // dialog that is first drawn already open has not seen where focus
        // was, and cannot hand it back to the user's name on closing.
        <Modal
            opened={opened}
            onClose={onClose}
            size={620}
            centered
            radius="md"
            title={
                row && (
                    <Box>
                        <Text fw={700}>{row.userName || "Unknown user"}</Text>
                        <Text size="xs" c="dimmed">
                            {[
                                where,
                                `submitted ${moment(row.submittedAt).format(
                                    "DD MMM, YYYY"
                                )}`,
                            ]
                                .filter(Boolean)
                                .join(" · ")}
                        </Text>
                    </Box>
                )
            }
        >
            {row && <Response row={row} {...response} />}
        </Modal>
    );
}
