import {
    Box,
    Button,
    Group,
    Modal,
    Pagination,
    ScrollArea,
    Select,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { fetchHistory, undoChange } from "../../../functions/questionnaire";
import { UndoDialog } from "./ConfirmDialogs";
import { placeName } from "./constants";
import { localise } from "./localise";
import { dataTableProps } from "./tableStyles";

const PAGE_SIZE = 20;

// The value is how many days back the range starts; today starts 0 back.
const RANGES = [
    { value: "", label: "Any date" },
    { value: "0", label: "Today" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
];

const startOfDay = (date) => new Date(date).setHours(0, 0, 0, 0);

const since = (days) => {
    const date = new Date(startOfDay(new Date()));
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

/** "Today, 14:20", "Yesterday, 17:40", then the date. */
const when = (at) => {
    const date = new Date(at);
    // Rounded: a day is not always 24 hours where the clocks change.
    const daysAgo = Math.round(
        (startOfDay(new Date()) - startOfDay(date)) / 86400000
    );
    const day =
        daysAgo === 0
            ? "Today"
            : daysAgo === 1
            ? "Yesterday"
            : date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
              });
    const time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `${day}, ${time}`;
};

// The column headings every questionnaire table has.
const heading = dataTableProps.defaultColumnProps.titleStyle;

// Closing keeps what a dialog was showing, so its contents do not change
// under the reader while it fades out.
const closed = (dialog) => ({ ...dialog, opened: false });

/**
 * Every published change, newest first (PDF p.23).
 *
 * Opened from a place it is that place's history: its own changes and those
 * of the places inside it (`places` is the list of every place), which is
 * also all a regional team is given.
 *
 * The newest change the account can see is the one that can be taken back:
 * the server names it (`latest`, whatever the filters show; null when that
 * change is of a kind that cannot be undone) and "Undo" is offered on that
 * row alone. The server also has the last word on whether it goes through.
 */
export default function HistoryDialog({
    opened,
    onClose,
    language,
    scope,
    places = [],
}) {
    const master = scope.type === "master";
    // Where the place filter starts: everything, or the place on screen.
    const home = master ? "" : scope.placeId;
    const [place, setPlace] = useState(home);
    const [actor, setActor] = useState("");
    const [range, setRange] = useState("");
    const [page, setPage] = useState(1);

    const filtered = Boolean(place !== home || actor || range);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["questionnaire-history", place, actor, range, page],
        queryFn: () =>
            fetchHistory({
                place: place || undefined,
                actor: actor || undefined,
                from: range ? since(Number(range)) : undefined,
                // Pages count from 0 on the server, as they do for responses.
                page: page - 1,
                limit: PAGE_SIZE,
            }),
        enabled: opened,
        // The rows on screen stay put while another filter or page loads.
        placeholderData: keepPreviousData,
    });
    const rows = data?.rows || [];

    // A filter changes what page 3 means, so each one starts again at 1.
    const filter = (set) => (value) => {
        set(value || "");
        setPage(1);
    };

    // The change "Undo" was clicked on, while its confirmation is open.
    const [undo, setUndo] = useState({ opened: false });
    const queryClient = useQueryClient();
    const undoing = useMutation({
        mutationFn: undoChange,
        onSuccess: () => {
            toast.success("Undone");
            // The questionnaire behind this dialog is the earlier one again.
            queryClient.invalidateQueries({ queryKey: ["questionnaire-editor"] });
        },
        // A refusal comes with its reason, in the server's own words.
        onError: (err) =>
            toast.error(err?.response?.data?.message || "Something went wrong"),
        // Read again either way: an undo adds a row, and after a refusal the
        // latest change is often no longer the one that was on screen.
        onSettled: () => {
            setUndo(closed);
            queryClient.invalidateQueries({ queryKey: ["questionnaire-history"] });
        },
    });
    // A change as its row reads: what it was made to, then what was done.
    const undoLabel = localise(undo.row?.label, language);

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                // Esc reaches every open dialog: it must close only the one
                // on top.
                closeOnEscape={!undo.opened}
                size={900}
                centered
                radius="md"
                title={
                    <Box>
                        <Text fw={700}>Change history</Text>
                        <Text size="xs" c="dimmed">
                            Every published change: who made it, when, and for
                            which place
                        </Text>
                    </Box>
                }
            >
                <Stack gap="md">
                    <Group gap="sm">
                        <Select
                            aria-label="Place"
                            w={160}
                            allowDeselect={false}
                            data={
                                master
                                    ? [
                                          { value: "", label: "All places" },
                                          { value: "master", label: "Master" },
                                      ]
                                    : places
                                          .filter(
                                              (entry) =>
                                                  entry._id === home ||
                                                  entry.path.includes(home)
                                          )
                                          .map((entry) => ({
                                              value: entry._id,
                                              label: placeName(entry),
                                          }))
                            }
                            value={place}
                            onChange={filter(setPlace)}
                        />
                        <Select
                            aria-label="Who"
                            w={200}
                            allowDeselect={false}
                            data={[
                                { value: "", label: "Everyone" },
                                ...(data?.actors || []).map((person) => ({
                                    value: person._id,
                                    label: person.name,
                                })),
                            ]}
                            value={actor}
                            onChange={filter(setActor)}
                        />
                        <Select
                            aria-label="Date"
                            w={160}
                            allowDeselect={false}
                            data={RANGES}
                            value={range}
                            onChange={filter(setRange)}
                        />
                    </Group>

                    {/* Only the rows scroll: a full page of them is taller
                        than most windows, and the filters and the pager must
                        stay where they are. The height is the dialog's own
                        limit (90% of the window) less everything around the
                        table. */}
                    <ScrollArea.Autosize mah="calc(90dvh - 260px)" type="auto">
                        <Table
                            verticalSpacing="sm"
                            horizontalSpacing="md"
                            stickyHeader
                        >
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={170} style={heading}>
                                        When
                                    </Table.Th>
                                    <Table.Th w={190} style={heading}>
                                        Who
                                    </Table.Th>
                                    <Table.Th w={170} style={heading}>
                                        Place
                                    </Table.Th>
                                    <Table.Th style={heading}>Change</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.map((row) => {
                                    const label = localise(row.label, language);
                                    return (
                                        <Table.Tr key={row._id}>
                                            <Table.Td>{when(row.at)}</Table.Td>
                                            <Table.Td>{row.actorName}</Table.Td>
                                            <Table.Td>
                                                {row.placeId
                                                    ? (row.placeNames || []).join(
                                                          " › "
                                                      )
                                                    : "Master"}
                                            </Table.Td>
                                            <Table.Td>
                                                {/* Undo stands at the end of
                                                    the one row that has it,
                                                    and takes no width from
                                                    the others. */}
                                                <Group
                                                    justify="space-between"
                                                    wrap="nowrap"
                                                    gap="md"
                                                >
                                                    <Box>
                                                        <Text span inherit fw={700}>
                                                            {label}
                                                        </Text>
                                                        {label && " · "}
                                                        {row.summary}
                                                    </Box>
                                                    {row._id === data.latest && (
                                                        <Button
                                                            variant="default"
                                                            style={{ flexShrink: 0 }}
                                                            onClick={() =>
                                                                setUndo({
                                                                    opened: true,
                                                                    row,
                                                                })
                                                            }
                                                        >
                                                            Undo
                                                        </Button>
                                                    )}
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea.Autosize>

                    {rows.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" py="lg">
                            {isLoading
                                ? "Loading…"
                                : isError
                                ? "The history could not be loaded."
                                : filtered
                                ? "No change matches these filters."
                                : "Nothing has been published yet."}
                        </Text>
                    )}

                    {rows.length > 0 && (
                        <Group justify="space-between" wrap="nowrap" gap="md">
                            <Text size="xs" c="dimmed">
                                Undo is offered on the latest change only.
                                Older changes are reversed by editing the
                                question again.
                            </Text>
                            {data.total > PAGE_SIZE && (
                                <Pagination
                                    size="sm"
                                    total={Math.ceil(data.total / PAGE_SIZE)}
                                    value={page}
                                    onChange={setPage}
                                    style={{ flexShrink: 0 }}
                                />
                            )}
                        </Group>
                    )}
                </Stack>
            </Modal>

            <UndoDialog
                opened={opened && undo.opened}
                onClose={() => setUndo(closed)}
                change={[undoLabel && `“${undoLabel}”`, undo.row?.summary]
                    .filter(Boolean)
                    .join(" · ")}
                added={/^new /.test(undo.row?.summary || "")}
                onConfirm={() => undoing.mutate(undo.row._id)}
                loading={undoing.isPending}
            />
        </>
    );
}
