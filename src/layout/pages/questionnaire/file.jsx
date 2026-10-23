import { Box, Button, Image, Paper, Skeleton, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import MantineShell from "../../components/questionnaire/MantineShell";
import { useFile } from "../../components/questionnaire/constants";
import { PageHeader } from "../../components/questionnaire/shell";
import Wrapper from "../../components/wrapper/wrapper";

// The ending of a downloaded file's name, by what the server found the file
// to be. A photo is always stored as a JPEG; a recording is kept as it came.
const ENDINGS = {
    "image/jpeg": "jpg",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/webm": "webm",
    "audio/aac": "aac",
};

/**
 * One photo or recording of an answer, on a page of its own: where its link
 * in the Responses tables, and in the files exported from them, leads.
 *
 * The address holds the file's id and nothing else, and the file is all the
 * server sends for it. Whose answer it is, and to which question, is read
 * where the link was. A file this account may not see is answered like one
 * that does not exist.
 */
export default function FilePage() {
    const { fileId } = useParams();
    const { url, type, failed } = useFile(fileId);
    const photo = type.startsWith("image/");
    // Anything else is nothing this page can show.
    const known = photo || type.startsWith("audio/");

    return (
        <Wrapper plain title="File">
            <MantineShell>
                <Box p="xl">
                    <PageHeader
                        title="File"
                        action={
                            url &&
                            known && (
                                // The file is already here: the browser
                                // saves it from memory, under this name.
                                <Button
                                    component="a"
                                    href={url}
                                    download={`${
                                        photo ? "photo" : "recording"
                                    }-${fileId}.${
                                        ENDINGS[type] || type.split("/")[1]
                                    }`}
                                >
                                    Download
                                </Button>
                            )
                        }
                    />
                    <Paper withBorder radius="md" p="lg">
                        {failed || (url && !known) ? (
                            <Text size="sm" c="red.9">
                                This file could not be loaded
                            </Text>
                        ) : !url ? (
                            <Skeleton h={240} radius="sm" />
                        ) : photo ? (
                            <Image
                                src={url}
                                alt="Photo"
                                // Whole, at its own size, on one screen.
                                w="auto"
                                maw="100%"
                                mah="75vh"
                                radius="sm"
                            />
                        ) : (
                            <audio
                                controls
                                src={url}
                                aria-label="Audio recording"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    maxWidth: 480,
                                    // As in AnswerFiles: the page is light
                                    // whatever the computer is set to.
                                    colorScheme: "light",
                                }}
                            />
                        )}
                    </Paper>
                </Box>
            </MantineShell>
        </Wrapper>
    );
}
