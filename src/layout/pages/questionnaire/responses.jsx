import {
    Anchor,
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    Group,
    Paper,
    Popover,
    SegmentedControl,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import moment from "moment";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { fetchPlaces } from "../../../functions/places";
import {
    fetchCategories,
    fetchResponseRows,
    fetchResponses,
    fetchResponseStats,
} from "../../../functions/questionnaire";
import Loading from "../../components/loading";
import CategoryTree from "../../components/questionnaire/CategoryTree";
import GroupRowsDialog from "../../components/questionnaire/GroupRowsDialog";
import MantineShell from "../../components/questionnaire/MantineShell";
import PlacePicker from "../../components/questionnaire/PlacePicker";
import ResponseCharts from "../../components/questionnaire/ResponseCharts";
import ResponseDetailDialog from "../../components/questionnaire/ResponseDetailDialog";
import ResponseFilterBar from "../../components/questionnaire/ResponseFilterBar";
import { Pill } from "../../components/questionnaire/StatusPill";
import { placeName, plural } from "../../components/questionnaire/constants";
import { csvName, downloadCsv } from "../../components/questionnaire/csv";
import {
    DEFAULT_LANGUAGE,
    answerCell,
    answerText,
    languageName,
    languagesFor,
    localise,
} from "../../components/questionnaire/localise";
import { EmptyState } from "../../components/questionnaire/shell";
import { dataTableProps } from "../../components/questionnaire/tableStyles";
import Wrapper from "../../components/wrapper/wrapper";

// The date select. A range reaches `back` from today; "Custom range" shows
// two dates to set instead.
const RANGES = [
    { value: "", label: "Any date" },
    { value: "7d", label: "Last 7 days", back: [7, "days"] },
    { value: "30d", label: "Last 30 days", back: [30, "days"] },
    { value: "12m", label: "Last 12 months", back: [12, "months"] },
    { value: "custom", label: "Custom range" },
];

const PAGE_SIZES = [25, 50, 100];

const NOTE =
    "One table per question page, one row per user. Click a user to see the whole response. Answers to archived questions stay visible. The export follows the place, date and category chosen here.";

// A table here is as tall as its rows: its own default, the whole height of
// what it sits in, is the height of the tree beside it; and the room the
// shared look keeps for "no records" would stand empty under a short list.
// It is also wider than its pane (a column a question), so the bar that
// scrolls it sideways stays in view instead of waiting for the pointer, under
// the last row and not over it, with the line the design closes the table
// with under that.
const fitted = (records) => ({
    height: "auto",
    minHeight: records?.length ? 0 : dataTableProps.minHeight,
    scrollAreaProps: { type: "auto", offsetScrollbars: "x" },
    styles: { root: { borderBottom: "1px solid var(--mantine-color-gray-3)" } },
});

// These selects sit in the Filters popover: see ResponseFilterBar.
const INSIDE = { withinPortal: false };

// Closing keeps what a dialog was showing, so its contents do not change
// under the reader while it fades out.
const closed = (dialog) => ({ ...dialog, opened: false });

// The server's "no" to a place: it is someone else's (403), or there is no
// such place (404).
const isRefusal = (err) => [403, 404].includes(err?.response?.status);
// A refusal is an answer: asking again would only get it again.
const retry = (failures, err) => !isRefusal(err) && failures < 3;

/**
 * The flat category list as the rows of the tree: each category followed by
 * what is inside it, in `order`. One whose parent is not in the list is shown
 * at the top rather than not at all.
 */
const treeRows = (categories) => {
    const ids = new Set(categories.map((category) => category._id));
    const under = (parentId, depth) =>
        categories
            .filter(
                (category) =>
                    (ids.has(category.parentId) ? category.parentId : null) ===
                    parentId
            )
            .sort((a, b) => a.order - b.order)
            .flatMap((category) => [
                { ...category, depth },
                ...under(category._id, depth + 1),
            ]);
    return under(null, 0);
};

/** Every group in the column tree, as a pickable "one row per entry" target. */
const groupTargets = (columns, language, prefix = [], trail = [], acc = []) => {
    (columns || []).forEach((column) => {
        const path = [...prefix, column.questionId];
        const names = [...trail, localise(column.label, language)];
        if (column.type === "repeatable_group") {
            acc.push({ path: path.join("."), label: names.join(" / "), column });
            groupTargets(column.children, language, path, names, acc);
        }
    });
    return acc;
};

// A village's name is stored in lower case.
const villageOf = (row) =>
    placeName({ level: "village", name: row.villageName || "" });

const submittedOf = (row) =>
    row.submittedAt ? moment(row.submittedAt).format("DD MMM, YYYY") : "";

/**
 * "Not asked" is this screen's reading of a row: nothing was saved for the
 * question, and it was not among those on offer at that save. On offer and
 * left blank is an empty cell. A response older than the record of what was
 * on offer (`asked` is null) cannot tell the two apart, and stays empty.
 */
const notAsked = (row, column) =>
    Array.isArray(row.asked) && !row.asked.includes(column.questionId);

/**
 * Responses, read by place (PDF p.28): one table per question page, one row
 * per user; a user opens that response in full (p.29).
 *
 * The place, the page, the date range, the search, the filters, the language
 * and the view are all in the URL, so a view is a link and Back works. One
 * filter object made from them feeds the table, the "one row per entry"
 * view, the graphs and the export, so the four cannot disagree about which
 * responses are meant.
 */
export default function Responses() {
    const [searchParams, setSearchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const language = searchParams.get("lang") || DEFAULT_LANGUAGE;
    const urlPlace = searchParams.get("place") || "";
    // A regional team that names no place is held to its own by the server.
    // The request leaves it out, so the server's word stands; the picker
    // shows it chosen.
    const placeId =
        urlPlace || (user.role === "regional" && user.place?._id) || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const range =
        RANGES.find((entry) => entry.value === searchParams.get("range")) ||
        // Dates with no range named are a custom range: a link kept from
        // before this select, when the two dates stood on their own.
        RANGES.at(from || to ? -1 : 0);
    const userSearch = searchParams.get("user") || "";
    const graphs = searchParams.get("view") === "graphs";
    const filters = searchParams.getAll("f");

    // A value sets a parameter, an empty one removes it, a list repeats it.
    // Typing in the search box replaces the history entry instead of adding
    // one a letter.
    const setParams = (changes, replace = false) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([name, value]) => {
            next.delete(name);
            []
                .concat(value)
                .filter(Boolean)
                .forEach((entry) => next.append(name, entry));
        });
        setSearchParams(next, { replace });
    };

    const [exporting, setExporting] = useState(false);
    const [entries, setEntries] = useState({ opened: false });
    const [detail, setDetail] = useState({ opened: false });
    const [paging, setPaging] = useState({
        key: "",
        page: 1,
        size: PAGE_SIZES[0],
    });

    // Every place: the picker lists them, and each brings the languages it
    // asks for.
    const { data: places = [] } = useQuery({
        queryKey: ["places"],
        queryFn: () => fetchPlaces(),
    });
    const languages = useMemo(() => languagesFor(places), [places]);
    const chosen = places.find((entry) => entry._id === placeId);

    // The pages of the place on screen, archived ones included: their
    // responses must stay reachable.
    const categories = useQuery({
        queryKey: ["questionnaire-categories", urlPlace],
        queryFn: () => fetchCategories({ place: urlPlace }),
        retry,
        // The tree of the place being left stays while the next one loads:
        // the screen, and the picker that was just used, do not blink away.
        placeholderData: keepPreviousData,
    });
    const tree = useMemo(() => treeRows(categories.data || []), [categories.data]);
    // The first question page when the URL names none, or one that is not
    // in this place's tree.
    const selected =
        tree.find((entry) => entry._id === searchParams.get("categoryId")) ||
        tree.find((entry) => entry.is_screen);
    const categoryId = selected?.is_screen ? selected._id : "";
    const title = localise(selected?.title, language);

    // The request waits until the typing stops.
    const [searched] = useDebouncedValue(userSearch.trim(), 300);
    const sent = filters.filter(
        // A row still being filled in has no value yet.
        (entry) => entry.split(":").slice(2).join(":") !== ""
    );
    const filterParams = {
        categoryId,
        place: urlPlace || undefined,
        // Whole days, on the viewer's own clock: from the first moment of
        // the first day to the last moment of the last.
        from: range.back
            ? moment()
                  .subtract(...range.back)
                  .startOf("day")
                  .toISOString()
            : from
            ? moment(from).startOf("day").toISOString()
            : undefined,
        to: !range.back && to ? moment(to).endOf("day").toISOString() : undefined,
        user: searched || undefined,
        f: sent.length ? sent : undefined,
    };
    const narrowed = Boolean(
        filterParams.from || filterParams.to || searched || sent.length
    );

    // A filter changes what page 3 means: each one starts again at page 1.
    // Paging is deliberately NOT part of the filter object: the graphs draw
    // the whole filtered set, so turning a page must not refetch them.
    const filterKey = JSON.stringify(filterParams);
    const page = paging.key === filterKey ? paging.page : 1;
    const params = { ...filterParams, page: page - 1, limit: paging.size };

    const list = useQuery({
        queryKey: ["responses", params],
        queryFn: () => fetchResponses(params),
        enabled: Boolean(categoryId),
        retry,
        // The rows on screen stay put while another page or filter of the
        // same list loads. Another page or place is another table.
        placeholderData: (previous, query) =>
            query?.queryKey[1].categoryId === categoryId &&
            query.queryKey[1].place === filterParams.place
                ? previous
                : undefined,
    });
    const table = list.data;
    const rows = table?.rows || [];

    const groups = useMemo(
        () => groupTargets(table?.columns, language),
        [table?.columns, language]
    );
    // The group whose entries are listed one per row, when one is chosen.
    const group = groups.find(
        (entry) => entry.path === searchParams.get("group")
    );

    const entryRows = useQuery({
        queryKey: ["response-rows", filterParams, group?.path],
        queryFn: () =>
            // ponytail: the first 200 entries, unpaged. Page it when a list
            // page gathers more than that.
            fetchResponseRows({
                ...filterParams,
                limit: 200,
                groupPath: group.path,
            }),
        enabled: Boolean(categoryId) && !graphs && Boolean(group),
    });

    const stats = useQuery({
        queryKey: ["response-stats", filterParams],
        queryFn: () => fetchResponseStats(filterParams),
        enabled: Boolean(categoryId) && graphs,
    });

    /** Columns come from the payload, not the rows — so an unanswered or
     *  archived question still gets a column. */
    const columns = useMemo(
        () => [
            {
                accessor: "userName",
                title: "User",
                noWrap: true,
                render: (row) => (
                    <Anchor
                        component="button"
                        type="button"
                        size="sm"
                        fw={600}
                        onClick={() => setDetail({ opened: true, id: row._id })}
                    >
                        {row.userName || "Unknown user"}
                    </Anchor>
                ),
            },
            {
                accessor: "villageName",
                title: "Village",
                noWrap: true,
                render: villageOf,
            },
            {
                accessor: "submittedAt",
                title: "Submitted",
                noWrap: true,
                render: submittedOf,
            },
            ...(table?.columns || []).map((column) => {
                const label = localise(column.label, language);
                const archived = column.active === false;
                // On one line up to a width, so that a short heading is
                // not broken to fit a narrow answer under it.
                const heading = (
                    <Text
                        span
                        inherit
                        style={{
                            display: "block",
                            width: "max-content",
                            maxWidth: 280,
                        }}
                    >
                        {label}
                    </Text>
                );
                return {
                    accessor: column.questionId,
                    title: (
                        <Group gap={6} wrap="nowrap">
                            {column.section ? (
                                <Tooltip
                                    label={`In section: ${localise(
                                        column.section,
                                        language
                                    )}`}
                                    withArrow
                                >
                                    {heading}
                                </Tooltip>
                            ) : (
                                heading
                            )}
                            {archived && (
                                <Pill filled style={{ flexShrink: 0 }}>
                                    Archived
                                </Pill>
                            )}
                        </Group>
                    ),
                    render: (row) => {
                        const answer = row.answers?.[column.questionId];
                        if (!answer)
                            return notAsked(row, column) ? (
                                <Text size="sm" c="dimmed">
                                    Not asked
                                </Text>
                            ) : null;

                        const text = answerText(answer, column, language);
                        if (column.type === "repeatable_group")
                            return (
                                <Anchor
                                    component="button"
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                        setEntries({
                                            opened: true,
                                            column,
                                            value: answer.value,
                                        })
                                    }
                                >
                                    {text}
                                </Anchor>
                            );

                        // The snapshot is the point: if the wording differs
                        // from the one in force here, show what this person
                        // was actually asked.
                        const asked = localise(answer.label, language);
                        const drifted = asked && asked !== label;
                        const cell = (
                            <Text
                                size="sm"
                                c={archived ? "dimmed" : undefined}
                                // A long answer is cut short here and whole
                                // in the response a click on its user opens.
                                lineClamp={3}
                                miw={140}
                                style={{
                                    overflowWrap: "anywhere",
                                    ...(drifted && {
                                        textDecoration: "underline dotted",
                                    }),
                                }}
                            >
                                {text}
                            </Text>
                        );
                        return drifted ? (
                            <Tooltip label={`Asked as: “${asked}”`} withArrow>
                                {cell}
                            </Tooltip>
                        ) : (
                            cell
                        );
                    },
                };
            }),
        ],
        [table?.columns, language]
    );

    const entryColumns = group
        ? [
              // Whose entry it is. (The entry's own id means nothing to a
              // reader; it only keys the row.)
              {
                  accessor: "userName",
                  title: "User",
                  noWrap: true,
                  render: (row) => row.userName || "Unknown user",
              },
              {
                  accessor: "villageName",
                  title: "Village",
                  noWrap: true,
                  render: villageOf,
              },
              ...(group.column.children || [])
                  .filter((child) => child.type !== "repeatable_group")
                  .map((child) => ({
                      accessor: child.questionId,
                      title: localise(child.label, language),
                      render: (row) =>
                          answerText(
                              row.answers?.[child.questionId],
                              child,
                              language
                          ),
                  })),
          ]
        : [];

    /**
     * The table holds one page of the list; the file is built from every
     * page of it, with the place, dates, search and filters in force.
     */
    const exportAll = async () => {
        setExporting(true);
        try {
            // ponytail: every page is held in memory before the file is
            // written. Fine for the thousands a page gathers; move the
            // export to the server if one ever gathers hundreds of thousands.
            const collected = [];
            let chunk;
            do {
                chunk = await fetchResponses({
                    ...filterParams,
                    // The server may give fewer rows a page than asked
                    // for; it counts pages in its own size either way.
                    page: chunk ? chunk.page + 1 : 0,
                    limit: 200,
                });
                collected.push(...chunk.rows);
            } while (chunk.rows.length > 0 && collected.length < chunk.total);

            downloadCsv(
                csvName(
                    "responses",
                    localise(selected.title),
                    chunk.place?.name || "all places",
                    moment().format("YYYY-MM-DD")
                ),
                [
                    [
                        "User",
                        "Village",
                        "Submitted",
                        ...chunk.columns.map((column) =>
                            localise(column.label, language)
                        ),
                    ],
                    ...collected.map((row) => [
                        row.userName,
                        villageOf(row),
                        submittedOf(row),
                        ...chunk.columns.map((column) => {
                            const answer = row.answers?.[column.questionId];
                            return answer
                                ? answerCell(answer, column, language)
                                : notAsked(row, column)
                                ? "Not asked"
                                : "";
                        }),
                    ]),
                ]
            );
            toast.success(`Exported ${plural(collected.length, "response")}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "The export failed");
        } finally {
            setExporting(false);
        }
    };

    // The response that is open, among the rows of the table's page.
    const at = rows.findIndex((row) => row._id === detail.id);
    const open = (row) => () => setDetail({ opened: true, id: row._id });
    // "Ladakh › Village 1": the two ends of a response's chain, from the
    // place on screen down. The chain is its village's, root first, so that
    // place sits as deep in it as it has places above; with no place chosen
    // it starts at the country.
    const whereOf = (row) => {
        const names = row.placeNames.slice(chosen ? chosen.path.length : 0);
        const ends = names.length ? names : row.placeNames;
        return ends.length > 1 ? `${ends[0]} › ${ends.at(-1)}` : ends[0] || "";
    };

    const refusal = [categories.error, list.error].find(isRefusal)?.response
        .data?.message;

    // What narrows the list beyond its place, page and dates, behind one
    // button: the filters on its questions, and which of a group's entries
    // to list one per row.
    const filtersButton = (
        <Popover position="bottom-end" width={730} shadow="md" trapFocus>
            <Popover.Target>
                <Button
                    variant="default"
                    rightSection={
                        sent.length > 0 && (
                            <Badge size="sm" circle>
                                {sent.length}
                            </Badge>
                        )
                    }
                >
                    Filters
                </Button>
            </Popover.Target>
            <Popover.Dropdown p="md">
                <Stack gap="md">
                    <ResponseFilterBar
                        filters={filters}
                        onChange={(next) => setParams({ f: next })}
                        columns={table?.columns}
                        language={language}
                    />
                    <Divider />
                    <Group gap="sm" align="flex-end">
                        <Select
                            label="View"
                            w={260}
                            allowDeselect={false}
                            comboboxProps={INSIDE}
                            data={[
                                { value: "", label: "One row per user" },
                                {
                                    value: "entries",
                                    label: "One row per entry of a group",
                                    disabled: groups.length === 0,
                                },
                            ]}
                            value={group ? "entries" : ""}
                            onChange={(value) =>
                                setParams({
                                    group: value ? groups[0].path : "",
                                })
                            }
                        />
                        {group && (
                            <Select
                                label="Group"
                                w={280}
                                allowDeselect={false}
                                comboboxProps={INSIDE}
                                data={groups.map((entry) => ({
                                    value: entry.path,
                                    label: entry.label,
                                }))}
                                value={group.path}
                                onChange={(value) => setParams({ group: value })}
                            />
                        )}
                    </Group>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );

    // Over the table: the page's name and how many responses the place has
    // on it, then what changes how they are read.
    const heading = (
        <Group
            justify="space-between"
            align="center"
            wrap="nowrap"
            gap="md"
            mb="md"
        >
            <Group gap="sm" align="baseline">
                <Title order={2} fz={20}>
                    {title}
                </Title>
                {table && (
                    <Text size="sm" c="dimmed">
                        {plural(table.total, "response")} in{" "}
                        {table.place?.name || "all places"}
                    </Text>
                )}
            </Group>
            <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                <Select
                    aria-label="Language"
                    w={130}
                    allowDeselect={false}
                    data={languages.map((code) => ({
                        value: code,
                        label: languageName(code),
                    }))}
                    value={language}
                    onChange={(value) =>
                        setParams({
                            lang: value === DEFAULT_LANGUAGE ? "" : value,
                        })
                    }
                />
                {filtersButton}
                <SegmentedControl
                    aria-label="Shown as"
                    data={["Table", "Graphs"]}
                    value={graphs ? "Graphs" : "Table"}
                    onChange={(value) =>
                        setParams({ view: value === "Graphs" ? "graphs" : "" })
                    }
                />
            </Group>
        </Group>
    );

    // Under the heading of a question page: its responses as a table, as one
    // row per entry of a group, or as graphs. Each is a request of its own,
    // and the list is behind all three: it brings the count and the columns.
    const failed = [list, graphs ? stats : entryRows].find(
        (query) => query.isError
    );
    // "in Ladakh ", or nothing when every place is listed.
    const inPlace = table?.place ? `in ${table.place.name} ` : "";
    const body = failed ? (
        <EmptyState
            title="The responses could not be loaded"
            description="Check the connection and try again."
            action={<Button onClick={() => failed.refetch()}>Try again</Button>}
        />
    ) : graphs ? (
        <ResponseCharts stats={stats.data} />
    ) : group ? (
        <DataTable
            {...dataTableProps}
            {...fitted(entryRows.data?.rows)}
            records={entryRows.data?.rows}
            columns={entryColumns}
            idAccessor={(row) => `${row.responseId}-${row.rowId}`}
            fetching={entryRows.isFetching}
            noRecordsText="No entries"
        />
    ) : table?.total === 0 && !list.isFetching ? (
        <EmptyState
            title={narrowed ? "No responses match" : "No responses yet"}
            description={
                narrowed
                    ? "Change the date, the search or the filters to see more."
                    : // An archived page is in nobody's app any more.
                    selected.active === false
                    ? `Nobody ${inPlace}answered this page before it was archived.`
                    : `They appear here once someone ${inPlace}saves this page in the app.`
            }
        />
    ) : (
        <>
            <DataTable
                {...dataTableProps}
                {...fitted(rows)}
                records={rows}
                columns={columns}
                idAccessor="_id"
                fetching={list.isFetching}
                // One page of them needs no pager under it.
                {...(table?.total > PAGE_SIZES[0] && {
                    totalRecords: table.total,
                    page,
                    onPageChange: (next) =>
                        setPaging({ ...paging, key: filterKey, page: next }),
                    recordsPerPage: paging.size,
                    recordsPerPageOptions: PAGE_SIZES,
                    onRecordsPerPageChange: (size) =>
                        setPaging({ key: filterKey, page: 1, size }),
                })}
            />
            <Text size="sm" c="dimmed" mt="lg">
                {NOTE}
            </Text>
        </>
    );

    return (
        <Wrapper plain title="Responses">
            <Loading
                isLoading={categories.isLoading || (graphs && stats.isLoading)}
            />
            <MantineShell>
                {refusal ? (
                    // Said plainly, in the server's words, and with nothing
                    // to try again.
                    <EmptyState title={refusal} />
                ) : (
                    categories.isError && (
                        <EmptyState
                            title="The responses could not be loaded"
                            description="Check the connection and try again."
                            action={
                                <Button onClick={() => categories.refetch()}>
                                    Try again
                                </Button>
                            }
                        />
                    )
                )}
                {!refusal && categories.data && (
                    <Paper withBorder radius="md">
                        <Group p="lg" gap="sm" wrap="nowrap">
                            <PlacePicker
                                allowAll
                                places={places}
                                current={
                                    placeId
                                        ? {
                                              placeId,
                                              name: chosen
                                                  ? placeName(chosen)
                                                  : table?.place?.name ||
                                                    user.place?.name ||
                                                    "",
                                          }
                                        : null
                                }
                                onChoose={(id) => setParams({ place: id })}
                            />
                            <Select
                                aria-label="Date"
                                w={170}
                                allowDeselect={false}
                                data={RANGES.map(({ value, label }) => ({
                                    value,
                                    label,
                                }))}
                                value={range.value}
                                // The two dates belong to a custom range.
                                onChange={(value) =>
                                    setParams({ range: value, from: "", to: "" })
                                }
                            />
                            {range.value === "custom" && (
                                <>
                                    <TextInput
                                        type="date"
                                        aria-label="From"
                                        title="From"
                                        w={150}
                                        max={to || undefined}
                                        value={from}
                                        onChange={(event) =>
                                            setParams({
                                                from: event.currentTarget.value,
                                            })
                                        }
                                    />
                                    <TextInput
                                        type="date"
                                        aria-label="To"
                                        title="To"
                                        w={150}
                                        min={from || undefined}
                                        value={to}
                                        onChange={(event) =>
                                            setParams({
                                                to: event.currentTarget.value,
                                            })
                                        }
                                    />
                                </>
                            )}
                            <TextInput
                                aria-label="Search by user"
                                placeholder="Search by user"
                                style={{ flex: 1 }}
                                value={userSearch}
                                onChange={(event) =>
                                    setParams(
                                        { user: event.currentTarget.value },
                                        true
                                    )
                                }
                            />
                            <Button
                                style={{ flexShrink: 0 }}
                                disabled={!table?.total}
                                loading={exporting}
                                onClick={exportAll}
                            >
                                Export to Excel
                            </Button>
                        </Group>
                        <Divider />

                        <Flex align="stretch" mih={480}>
                            <CategoryTree
                                readOnly
                                categories={tree}
                                selectedId={selected?._id}
                                language={language}
                                // The filters and the group listed by entry
                                // are about one page's questions.
                                onSelect={(id) =>
                                    setParams({ categoryId: id, f: "", group: "" })
                                }
                            />

                            <Box
                                p="lg"
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    // On this pane, not on the tree: the tree
                                    // is only as tall as its own rows.
                                    borderLeft:
                                        "1px solid var(--mantine-color-gray-3)",
                                }}
                            >
                                {!selected ? (
                                    <EmptyState
                                        title="No question pages yet"
                                        description="Responses are listed one question page at a time."
                                    />
                                ) : !selected.is_screen ? (
                                    <Text size="sm" c="dimmed">
                                        This group holds other categories. Pick a
                                        question page.
                                    </Text>
                                ) : (
                                    <>
                                        {heading}
                                        {body}
                                    </>
                                )}
                            </Box>
                        </Flex>
                    </Paper>
                )}

                <GroupRowsDialog
                    open={entries.opened}
                    onClose={() => setEntries(closed)}
                    column={entries.column}
                    value={entries.value}
                    language={language}
                />
                <ResponseDetailDialog
                    opened={detail.opened && at >= 0}
                    onClose={() => setDetail(closed)}
                    row={rows[at]}
                    columns={table?.columns || []}
                    places={table?.places || {}}
                    heading={title}
                    where={rows[at] && whereOf(rows[at])}
                    village={rows[at] && villageOf(rows[at])}
                    language={language}
                    onPrevious={at > 0 ? open(rows[at - 1]) : undefined}
                    onNext={
                        at >= 0 && at < rows.length - 1
                            ? open(rows[at + 1])
                            : undefined
                    }
                />
            </MantineShell>
        </Wrapper>
    );
}
