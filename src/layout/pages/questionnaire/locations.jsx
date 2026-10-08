import {
    Anchor,
    Box,
    Button,
    Group,
    Modal,
    Paper,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconClipboardList,
    IconPencil,
    IconPlus,
    IconTrash,
    IconUserPlus,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deletePlace, fetchPlaces } from "../../../functions/places";
import AssignTeamDialog from "../../components/questionnaire/AssignTeamDialog";
import MantineShell from "../../components/questionnaire/MantineShell";
import PlaceFormDialog from "../../components/questionnaire/PlaceFormDialog";
import RowActions from "../../components/questionnaire/RowActions";
import {
    PLACE_LEVELS,
    levelLabel,
    placeName,
    plural,
    visiblePlaces,
} from "../../components/questionnaire/constants";
import { languageName } from "../../components/questionnaire/localise";
import { PageHeader } from "../../components/questionnaire/shell";
import { dataTableProps } from "../../components/questionnaire/tableStyles";
import Wrapper from "../../components/wrapper/wrapper";

// Closing keeps what a dialog was showing, so its contents do not change
// under the reader while it fades out.
const closed = (dialog) => ({ ...dialog, opened: false });

/**
 * How a place's published questionnaire differs from the Master, in the
 * words of the column (PDF p.24): what the place set ITSELF, after the place
 * above whose changes it also takes over. A place that set nothing only
 * names the place it follows, and "" is a place with nothing to tell.
 */
const differsFrom = (diff) => {
    if (!diff) return "";
    if (diff.sameAs) return `As ${diff.sameAs}`;
    const { own } = diff;
    const categories = (count) => plural(count, "category", "categories");
    const parts = [
        own.hidden && `${own.hidden} hidden`,
        own.changed && `${own.changed} changed`,
        own.added && `${own.added} added`,
        // Switched back on here, though a place above hides it.
        own.shown && `${own.shown} shown again`,
        own.categoriesHidden && `${categories(own.categoriesHidden)} hidden`,
        own.categoriesAdded && `${categories(own.categoriesAdded)} added`,
    ]
        .filter(Boolean)
        // Held together (the spaces do not break), and so is the dot with
        // what it follows: a long line wraps between two parts, never
        // inside "1 category hidden".
        .map((part) => part.replaceAll(" ", " "))
        .join(" · ");
    return [diff.base && `As ${diff.base}`, parts]
        .filter(Boolean)
        .join(", plus ");
};

export default function Locations() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [level, setLevel] = useState("");
    const [form, setForm] = useState({ opened: false });
    const [assign, setAssign] = useState({ opened: false });
    const [removal, setRemoval] = useState({ opened: false });

    // ponytail: every place in one unpaged table, as the server sends them.
    // Page or virtualise it if the list ever reaches thousands of villages.
    const {
        data: places = [],
        isLoading,
        refetch,
    } = useQuery({
        // Its own entry beside the plain list: the dialogs read that one,
        // and must not find this one's `diff` missing from it.
        queryKey: ["places", "stats", "diff"],
        queryFn: () => fetchPlaces({ stats: true, diff: true }),
    });

    const rows = useMemo(
        () => visiblePlaces(places, search, level),
        [places, search, level]
    );

    const deleteMutation = useMutation({
        mutationFn: deletePlace,
        onSuccess: () => {
            toast.success("Place deleted");
            refetch();
            setRemoval(closed);
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Something went wrong");
            setRemoval(closed);
        },
    });

    const columns = [
        {
            accessor: "name",
            title: "Place",
            render: (row) => (
                <Text
                    size="sm"
                    fw={row.level === "country" ? 700 : undefined}
                    tt={row.level === "village" ? "capitalize" : undefined}
                    // Flat under a level filter: the parents are not listed.
                    pl={level ? 0 : row.depth * 28}
                >
                    {row.name}
                </Text>
            ),
        },
        {
            accessor: "level",
            title: "Level",
            noWrap: true,
            render: (row) => levelLabel(row.level),
        },
        { accessor: "villageCount", title: "Villages" },
        {
            accessor: "languages",
            title: "Languages",
            // A place's own languages ADD to what it inherits, so a place
            // that added one reads "As India + Ladakhi", never just its own.
            render: (row) => {
                const own = (row.languages || []).map(languageName).join(", ");
                if (!row.languagesFrom) return own;
                return (
                    <Text size="sm" c={own ? undefined : "dimmed"}>
                        As {row.languagesFrom.name}
                        {own && ` + ${own}`}
                    </Text>
                );
            },
        },
        {
            accessor: "team",
            title: "Regional team",
            render: (row) =>
                row.team?.length ? (
                    row.team.map((member) => (
                        <Text key={member._id} size="sm">
                            {member.email}
                        </Text>
                    ))
                ) : row.teamFrom ? (
                    <Text size="sm" c="dimmed">
                        {row.teamFrom.name} team
                    </Text>
                ) : (
                    // The design leaves a village with no team blank; one can
                    // still be assigned to it from the row menu.
                    row.level !== "village" && (
                        <Anchor
                            component="button"
                            type="button"
                            size="sm"
                            fw={600}
                            onClick={() =>
                                setAssign({ opened: true, placeId: row._id })
                            }
                        >
                            Assign
                        </Anchor>
                    )
                ),
        },
        {
            accessor: "diff",
            title: "Differs from the Master",
            render: (row) => {
                const text = differsFrom(row.diff);
                if (!text)
                    return (
                        <Text size="sm" c="dimmed">
                            No
                        </Text>
                    );
                // A place that only follows another is drawn as quietly as
                // "No"; what a place set itself stands out. Both lead to
                // the questionnaire they speak of.
                const follows = Boolean(row.diff.sameAs);
                return (
                    <Anchor
                        component={Link}
                        to={`/questionnaire/place/${row._id}`}
                        size="sm"
                        fw={follows ? undefined : 600}
                        c={follows ? "dimmed" : undefined}
                        // Room for the design's own line ("1 hidden ·
                        // 2 changed · 1 added") and little more: a longer
                        // one wraps here, instead of taking the width the
                        // place names need to stay on one line.
                        display="inline-block"
                        maw={228}
                    >
                        {text}
                    </Anchor>
                );
            },
        },
        {
            accessor: "actions",
            title: "",
            width: 60,
            textAlign: "right",
            render: (row) => (
                <RowActions
                    // Room for "Open questionnaire" on one line.
                    width={230}
                    items={[
                        {
                            label: "Open questionnaire",
                            icon: <IconClipboardList size={15} />,
                            onClick: () =>
                                navigate(`/questionnaire/place/${row._id}`),
                        },
                        {
                            label: "Rename",
                            icon: <IconPencil size={15} />,
                            onClick: () => setForm({ opened: true, place: row }),
                        },
                        {
                            label: "Assign a team",
                            icon: <IconUserPlus size={15} />,
                            onClick: () =>
                                setAssign({ opened: true, placeId: row._id }),
                        },
                        { divider: true },
                        {
                            label: "Delete",
                            icon: <IconTrash size={15} />,
                            color: "red.9",
                            onClick: () =>
                                setRemoval({ opened: true, place: row }),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <Wrapper plain title="Locations">
            <MantineShell>
                <Box p="xl">
                    <PageHeader
                        title="Locations"
                        description="Country › State › District › Sub-district › Village. The three middle levels are optional. A new place starts with the full Master questionnaire."
                        action={
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => setForm({ opened: true })}
                            >
                                Add place
                            </Button>
                        }
                    />

                    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                        <Group
                            justify="space-between"
                            p="lg"
                            style={{
                                borderBottom:
                                    "1px solid var(--mantine-color-gray-3)",
                            }}
                        >
                            <TextInput
                                aria-label="Search by name at any level"
                                placeholder="Search by name at any level"
                                w={360}
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.currentTarget.value)
                                }
                            />
                            <Select
                                aria-label="Level"
                                w={150}
                                allowDeselect={false}
                                data={[
                                    { value: "", label: "All levels" },
                                    ...PLACE_LEVELS,
                                ]}
                                value={level}
                                onChange={(value) => setLevel(value || "")}
                            />
                        </Group>
                        <DataTable
                            records={rows}
                            columns={columns}
                            idAccessor="_id"
                            fetching={isLoading}
                            {...dataTableProps}
                            noRecordsText={
                                search || level
                                    ? "No places match"
                                    : "No places yet"
                            }
                        />
                    </Paper>
                </Box>

                <PlaceFormDialog
                    {...form}
                    places={places}
                    onClose={() => setForm(closed)}
                />
                <AssignTeamDialog {...assign} onClose={() => setAssign(closed)} />

                <Modal
                    opened={removal.opened}
                    onClose={() => setRemoval(closed)}
                    title={
                        <Text fw={700}>
                            Delete “{removal.place && placeName(removal.place)}”?
                        </Text>
                    }
                    centered
                    radius="md"
                >
                    <Stack gap="md">
                        <Text size="sm" c="dimmed">
                            This cannot be undone. A place is only deleted when
                            nothing is inside it and it has no team, responses or
                            registered villagers.
                        </Text>
                        <Group justify="flex-end" gap="sm">
                            <Button
                                variant="default"
                                onClick={() => setRemoval(closed)}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="red.9"
                                loading={deleteMutation.isPending}
                                onClick={() =>
                                    deleteMutation.mutate(removal.place._id)
                                }
                            >
                                Delete place
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </MantineShell>
        </Wrapper>
    );
}
