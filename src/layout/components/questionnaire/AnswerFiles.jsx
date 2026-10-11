import { Anchor, Box, Group, Image, Skeleton, Text } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { Link } from "react-router-dom";
import { useFile } from "./constants";
import { answerText, filePath } from "./localise";

// How tall a photo is drawn among the answers of a response.
const THUMB = 96;

// What a browser's own player measures: the room kept for one that is on
// its way, so the answers under it do not jump when it arrives.
const PLAYER = { h: 54, w: 300 };

/**
 * A link to the page of one file, in a tab of its own: the table or the
 * response it is opened from stays as it was.
 */
function FileLink({ id, children, ...rest }) {
    return (
        <Anchor
            component={Link}
            to={filePath(id)}
            target="_blank"
            size="sm"
            {...rest}
        >
            {children}
        </Anchor>
    );
}

/**
 * One file, drawn: the small copy of a photo, which is also the link to the
 * whole one, or the player of a recording.
 *
 * It is asked for when it comes into view, not when the dialog opens: a
 * list of forty entries does not fetch forty recordings to show the first
 * three.
 */
function Shown({ id, photo, name }) {
    const { ref, inViewport } = useInViewport();
    const { url, failed } = useFile(id, { thumb: photo, enabled: inViewport });
    return (
        <Box ref={ref}>
            {failed ? (
                <Text size="sm" c="red.9">
                    This file could not be loaded
                </Text>
            ) : !url ? (
                photo ? (
                    <Skeleton h={THUMB} w={THUMB} radius="sm" />
                ) : (
                    <Skeleton {...PLAYER} maw="100%" radius="xl" />
                )
            ) : photo ? (
                <FileLink id={id} display="block">
                    <Image src={url} alt={name} h={THUMB} w="auto" radius="sm" />
                </FileLink>
            ) : (
                <audio
                    controls
                    src={url}
                    aria-label={name}
                    style={{
                        display: "block",
                        maxWidth: "100%",
                        // These screens are light whatever the computer is
                        // set to; left alone, the player follows the computer.
                        colorScheme: "light",
                    }}
                />
            )}
        </Box>
    );
}

/**
 * The files of one photo or audio answer. `answer` is the snapshot a
 * response carries: its `value` lists the ids of the files.
 *
 * `compact` is for a table: how many there are, each a link to the page of
 * that file, and nothing is fetched (a page of the list can hold a hundred
 * rows). Without it the files themselves are drawn.
 */
export default function AnswerFiles({ answer, compact }) {
    const ids = [].concat(answer.value ?? []);
    const photo = answer.type === "photo";
    const name = (index) => `${photo ? "Photo" : "Recording"} ${index + 1}`;

    if (!ids.length) return null;
    if (!compact)
        return (
            <Group gap="xs">
                {ids.map((id, index) => (
                    <Shown key={id} id={id} photo={photo} name={name(index)} />
                ))}
            </Group>
        );

    const count = answerText(answer);
    return (
        // Short by its nature (ten files at most), so kept on one line: a
        // narrow column would break it after every word.
        <Group gap={6} wrap="nowrap" style={{ whiteSpace: "nowrap" }}>
            {ids.length === 1 ? (
                // One file: its count is the link to it.
                <FileLink id={ids[0]}>{count}</FileLink>
            ) : (
                <>
                    <Text size="sm" span>
                        {count}
                    </Text>
                    {ids.map((id, index) => (
                        <FileLink key={id} id={id} aria-label={name(index)}>
                            {index + 1}
                        </FileLink>
                    ))}
                </>
            )}
        </Group>
    );
}
