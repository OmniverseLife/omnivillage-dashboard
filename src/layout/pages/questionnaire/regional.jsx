import { Box, Button, Group, Paper, Text, TextInput } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchPlaces } from "../../../functions/places";
import MantineShell from "../../components/questionnaire/MantineShell";
import {
    levelLabel,
    placeName,
    visiblePlaces,
} from "../../components/questionnaire/constants";
import { csvName, downloadCsv } from "../../components/questionnaire/csv";
import { EmptyState, PageHeader } from "../../components/questionnaire/shell";
import { dataTableProps } from "../../components/questionnaire/tableStyles";
import Wrapper from "../../components/wrapper/wrapper";

const CHIPS = [
    { value: "", label: "All places" },
    { value: "differ", label: "Only places that differ" },
];

/**
 * A place whose questionnaire is of its own making: not the Master's as it
 * stands, and not simply that of a place above it.
 */
const differs = ({ diff }) => Boolean(diff) && !diff.sameAs;

/**
 * How a place compares with the Master, as the four cells the table and the
 * exported file both show: the Master questions it is asked, then what is
 * hidden, changed and added there. A place that set nothing itself names the
 * place it follows, and its counts are left empty.
 */
const compared = ({ diff }) =>
    !diff
        ? ["All", 0, 0, 0]
        : diff.sameAs
        ? [`Same as ${diff.sameAs}`, "", "", ""]
        : [
              diff.notAsked ? `All but ${diff.notAsked}` : "All",
              diff.hidden,
              diff.changed,
              diff.added,
          ];

// A count above zero is bold, as the design draws it.
const count = (accessor, title, index) => ({
    accessor,
    title,
    render: (row) => {
        const value = compared(row)[index];
        return (
            <Text size="sm" fw={value > 0 ? 700 : undefined}>
                {value}
            </Text>
        );
    },
});

const COLUMNS = [
    {
        accessor: "name",
        title: "Place",
        render: (row) => (
            <Text
                size="sm"
                fw={row.level === "country" ? 700 : undefined}
                pl={row.depth * 28}
            >
                {placeName(row)}
            </Text>
        ),
    },
    {
        accessor: "level",
        title: "Level",
        noWrap: true,
        render: (row) => levelLabel(row.level),
    },
    {
        accessor: "asked",
        title: "Master questions asked",
        render: (row) => (
            <Text size="sm" c={row.diff?.sameAs ? "dimmed" : undefined}>
                {compared(row)[0]}
            </Text>
        ),
    },
    count("hidden", "Hidden", 1),
    count("changed", "Changed", 2),
    count("added", "Added by the place", 3),
    {
        accessor: "open",
        title: "",
        textAlign: "right",
        render: (row) => (
            // A link, so that a place also opens in a new tab.
            <Button
                component={Link}
                to={`/questionnaire/place/${row._id}`}
                variant="default"
                aria-label={`Open ${placeName(row)}`}
            >
                Open
            </Button>
        ),
    },
];

/**
 * What each place asks, compared with the Master (PDF p.8): every place in
 * one indented table, each a step away from its own questionnaire.
 *
 * The numbers are the server's, counted from published work by the function
 * that also counts a place's own "compared with" line, so this page and that
 * one cannot disagree. The search and the chip are in the URL (`q`, `only`),
 * so a view is a link and Back works.
 */
export default function RegionalQuestionnaires() {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("q") || "";
    const chip = searchParams.get("only") === "differ" ? "differ" : "";

    // A value sets a parameter, an empty one removes it. Typing in the
    // search box replaces the history entry instead of adding one a letter.
    const setParam = (name, value, replace = false) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(name, value);
        else next.delete(name);
        setSearchParams(next, { replace });
    };

    // ponytail: every place in one unpaged table, as the server sends them.
    // Page or virtualise it if the list ever reaches thousands of villages.
    const {
        data: places = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["places", "stats", "diff"],
        queryFn: () => fetchPlaces({ stats: true, diff: true }),
    });

    // Either filter keeps the places above what it finds, so the tree still
    // reads and the indentation keeps its meaning.
    const rows = useMemo(
        () => visiblePlaces(places, search, "", chip ? differs : undefined),
        [places, search, chip]
    );

    // The table as it stands, filters and all, named by the day it is made.
    const exportRows = () =>
        downloadCsv(
            csvName("regional-questionnaires", moment().format("YYYY-MM-DD")),
            [
                COLUMNS.slice(0, -1).map((column) => column.title),
                ...rows.map((row) => [
                    placeName(row),
                    levelLabel(row.level),
                    ...compared(row),
                ]),
            ]
        );

    return (
        <Wrapper plain title="Regional questionnaires">
            <MantineShell>
                <Box p="xl">
                    <PageHeader
                        title="Regional questionnaires"
                        description="What each place asks, compared with the Master. Open a place to see or change its questionnaire."
                        maw={800}
                        action={
                            <Button
                                variant="default"
                                // The file is the table: nothing to save
                                // while there is none.
                                disabled={rows.length === 0}
                                onClick={exportRows}
                            >
                                Export to Excel
                            </Button>
                        }
                    />

                    {isError ? (
                        <EmptyState
                            title="The places could not be loaded"
                            description="Check the connection and try again."
                            action={
                                <Button onClick={() => refetch()}>Try again</Button>
                            }
                        />
                    ) : (
                        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                            <Group
                                p="lg"
                                gap="sm"
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
                                        setParam("q", event.currentTarget.value, true)
                                    }
                                />
                                {CHIPS.map((entry) => (
                                    <Button
                                        key={entry.value}
                                        variant="default"
                                        radius="xl"
                                        aria-pressed={entry.value === chip}
                                        fw={entry.value === chip ? 700 : 500}
                                        bg={entry.value === chip ? "gray.2" : undefined}
                                        onClick={() => setParam("only", entry.value)}
                                    >
                                        {entry.label}
                                    </Button>
                                ))}
                            </Group>
                            <DataTable
                                records={rows}
                                columns={COLUMNS}
                                idAccessor="_id"
                                fetching={isLoading}
                                {...dataTableProps}
                                noRecordsText={
                                    search.trim()
                                        ? "No places match"
                                        : chip
                                        ? "No place differs from the Master"
                                        : "No places yet"
                                }
                            />
                        </Paper>
                    )}
                </Box>
            </MantineShell>
        </Wrapper>
    );
}
