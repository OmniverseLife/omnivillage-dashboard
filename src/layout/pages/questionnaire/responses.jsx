import {
    Anchor,
    Badge,
    Box,
    Button,
    Group,
    Paper,
    Select,
    Tabs,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    IconChartBar,
    IconDownload,
    IconInbox,
    IconTable,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { fetchCountries, fetchVillages } from "../../../functions/others";
import {
    fetchCategories,
    fetchResponseRows,
    fetchResponses,
    fetchResponseStats,
} from "../../../functions/questionnaire";
import Loading from "../../components/loading";
import GroupRowsDialog from "../../components/questionnaire/GroupRowsDialog";
import MantineShell from "../../components/questionnaire/MantineShell";
import ResponseCharts from "../../components/questionnaire/ResponseCharts";
import ResponseFilterBar from "../../components/questionnaire/ResponseFilterBar";
import { EmptyState, PageHeader } from "../../components/questionnaire/shell";
import {
    languageName,
    languagesFor,
    localise,
} from "../../components/questionnaire/localise";
import Wrapper from "../../components/wrapper/wrapper";

const display = (value) => {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return `${value.length} row(s)`;
    return String(value);
};

/** Every group in the column tree, as a pickable "long view" target. */
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

export default function Responses() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState("table");
    const [view, setView] = useState("respondents");
    const [groupPath, setGroupPath] = useState("");
    const [groupDialog, setGroupDialog] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const categoryId = searchParams.get("categoryId") || "";
    const language = searchParams.get("lang") || "en";

    const { data: categories = [] } = useQuery({
        queryKey: ["questionnaire-categories", "flat"],
        queryFn: () => fetchCategories({ tree: false, includeInactive: true }),
        initialData: [],
    });
    const { data: countries = [] } = useQuery({
        queryKey: ["countries"],
        queryFn: () => fetchCountries(),
        initialData: [],
    });
    const { data: villages = [] } = useQuery({
        queryKey: ["villages"],
        queryFn: fetchVillages,
        initialData: [],
    });

    const screens = useMemo(
        () => categories.filter((category) => category.is_screen),
        [categories]
    );
    const languages = useMemo(() => languagesFor(countries), [countries]);

    // One filter object feeds the table, the long view and the graphs, so the
    // three can never disagree about what "the filtered set" means.
    const filterParams = useMemo(() => {
        const base = { categoryId };
        // URL uses countryId/villageId (the shared Wrapper owns "country" and
        // "village" and fills them with names); the API still calls them
        // country/village.
        const countryId = searchParams.get("countryId");
        if (countryId) base.country = countryId;
        ["from", "to"].forEach((key) => {
            const value = searchParams.get(key);
            if (value) base[key] = value;
        });
        const village = searchParams.getAll("villageId");
        if (village.length) base.village = village;
        const f = searchParams.getAll("f").filter((entry) => {
            const [, , ...rest] = entry.split(":");
            return rest.join(":") !== ""; // drop half-typed filters
        });
        if (f.length) base.f = f;
        return base;
    }, [categoryId, searchParams]);

    // Paging is deliberately NOT part of the filter object: the graphs
    // aggregate the whole filtered set, so turning a page must not refetch them.
    const params = useMemo(
        () => ({ ...filterParams, page: page - 1, limit: pageSize }),
        [filterParams, page, pageSize]
    );

    const { data: table = { total: 0, columns: [], rows: [] }, isLoading } =
        useQuery({
            queryKey: ["responses", params],
            queryFn: () => fetchResponses(params),
            enabled: Boolean(categoryId),
            initialData: { total: 0, columns: [], rows: [] },
        });

    const { data: longRows = { rows: [] }, isLoading: rowsLoading } = useQuery({
        queryKey: ["response-rows", filterParams, groupPath],
        queryFn: () =>
            fetchResponseRows({ ...filterParams, limit: 200, groupPath }),
        enabled: Boolean(categoryId) && view === "rows" && Boolean(groupPath),
        initialData: { rows: [] },
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["response-stats", filterParams],
        queryFn: () => fetchResponseStats(filterParams),
        enabled: Boolean(categoryId) && tab === "graphs",
    });

    const groups = useMemo(
        () => groupTargets(table.columns, language),
        [table.columns, language]
    );

    /** Columns come from the payload, not the rows — so an unanswered or
     *  retired question still gets a column. */
    const columns = useMemo(() => {
        const fixed = [
            { accessor: "userName", title: "User", width: 170 },
            { accessor: "phone", title: "Phone", width: 150 },
            {
                accessor: "villageName",
                title: "Village",
                width: 130,
                render: (row) => (
                    <Text size="sm" tt="capitalize">
                        {row.villageName}
                    </Text>
                ),
            },
            {
                accessor: "submittedAt",
                title: "Submitted",
                width: 140,
                render: (row) =>
                    row.submittedAt
                        ? moment(row.submittedAt).format("DD MMM, YYYY")
                        : "",
            },
        ];

        const dynamic = (table.columns || []).map((column) => ({
            accessor: column.questionId,
            width: 180,
            title: (
                <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={600}>
                        {localise(column.label, language)}
                    </Text>
                    {column.section && (
                        <Tooltip
                            label={`In section: ${localise(column.section, language)}`}
                            withArrow
                        >
                            <Badge tt="none" size="xs" variant="light" color="gray">
                                {localise(column.section, language)}
                            </Badge>
                        </Tooltip>
                    )}
                    {!column.active && (
                        <Tooltip
                            label="Retired question — historical answers are kept"
                            withArrow
                        >
                            <Badge tt="none" size="xs" variant="light" color="gray">
                                retired
                            </Badge>
                        </Tooltip>
                    )}
                </Group>
            ),
            render: (row) => {
                const answer = row.answers?.[column.questionId];
                if (!answer) return "";

                if (column.type === "repeatable_group") {
                    return (
                        <Anchor
                            component="button"
                            type="button"
                            size="sm"
                            onClick={() =>
                                setGroupDialog({ column, value: answer.value })
                            }
                        >
                            {display(answer.value)}
                        </Anchor>
                    );
                }

                // The snapshot is the point: if the wording moved on since this
                // answer was given, show what this person was actually asked.
                const asked = localise(answer.label, language);
                const drifted =
                    asked && asked !== localise(column.label, language);
                return drifted ? (
                    <Tooltip label={`Asked as: “${asked}”`} withArrow>
                        <Text size="sm" style={{ borderBottom: "1px dotted" }}>
                            {display(answer.value)}
                        </Text>
                    </Tooltip>
                ) : (
                    <Text size="sm">{display(answer.value)}</Text>
                );
            },
        }));

        return [...fixed, ...dynamic];
    }, [table.columns, language]);

    const longColumns = useMemo(() => {
        const group = groups.find((entry) => entry.path === groupPath);
        if (!group) return [];
        return [
            { accessor: "rowId", title: "Row", width: 120 },
            { accessor: "villageName", title: "Village", width: 130 },
            ...(group.column.children || [])
                .filter((child) => child.type !== "repeatable_group")
                .map((child) => ({
                    accessor: child.questionId,
                    title: localise(child.label, language),
                    width: 160,
                    render: (row) =>
                        display(row.answers?.[child.questionId]?.value),
                })),
        ];
    }, [groups, groupPath, language]);

    /** Server pagination means a grid export would only ever see one page. */
    const exportAll = async () => {
        try {
            const collected = [];
            let cursor = 0;
            for (;;) {
                const chunk = await fetchResponses({
                    ...filterParams,
                    page: cursor,
                    limit: 200,
                });
                collected.push(...chunk.rows);
                if (collected.length >= chunk.total || chunk.rows.length === 0)
                    break;
                cursor += 1;
                if (cursor > 50) break; // ponytail: hard cap at 10k rows
            }

            const headers = [
                "User",
                "Phone",
                "Village",
                "Submitted",
                ...table.columns.map((c) => localise(c.label, language)),
            ];
            const flatten = (row) => [
                row.userName,
                row.phone,
                row.villageName,
                row.submittedAt
                    ? moment(row.submittedAt).format("DD MMM, YYYY")
                    : "",
                ...table.columns.map((column) => {
                    const answer = row.answers?.[column.questionId];
                    if (!answer) return "";
                    if (column.type === "repeatable_group") {
                        // Lossy on purpose — a spreadsheet wants one flat cell.
                        return (answer.value || [])
                            .map((groupRow) =>
                                (groupRow.answers || [])
                                    .map(
                                        (a) =>
                                            `${localise(a.label, language)}=${display(a.value)}`
                                    )
                                    .join("; ")
                            )
                            .join(" | ");
                    }
                    return display(answer.value);
                }),
            ];

            const csv = [headers, ...collected.map(flatten)]
                .map((cells) =>
                    cells
                        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
                        .join(",")
                )
                .join("\n");

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `responses-${Date.now()}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast.success(`Exported ${collected.length} response(s)`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Export failed");
        }
    };

    return (
        <Wrapper>
            <Loading isLoading={isLoading || statsLoading || rowsLoading} />
            <MantineShell>
                <Box p="xl">
                    <PageHeader
                        title="Responses"
                        description="Filters apply to the table and the graphs together, and live in the URL — so a filtered view is a link you can share."
                        action={
                            <>
                                <Select
                                    w={130}
                                    data={languages.map((c) => ({
                                        value: c,
                                        label: languageName(c),
                                    }))}
                                    value={language}
                                    onChange={(v) => {
                                        if (!v) return;
                                        searchParams.set("lang", v);
                                        setSearchParams(searchParams);
                                    }}
                                />
                                <Button
                                    variant="default"
                                    leftSection={<IconDownload size={16} />}
                                    disabled={!categoryId || table.total === 0}
                                    onClick={exportAll}
                                >
                                    Export all
                                </Button>
                            </>
                        }
                    />

                    <ResponseFilterBar
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                        screens={screens}
                        countries={countries}
                        villages={villages}
                        columns={table.columns}
                        language={language}
                    />

                    {!categoryId ? (
                        <EmptyState
                            icon={<IconTable size={28} />}
                            title="Choose a screen"
                            description="Responses are grouped by the screen they were answered on. Pick one to see them."
                        />
                    ) : (
                        <Tabs value={tab} onChange={setTab}>
                            <Tabs.List mb="md">
                                <Tabs.Tab
                                    value="table"
                                    leftSection={<IconTable size={15} />}
                                >
                                    Table ({table.total})
                                </Tabs.Tab>
                                <Tabs.Tab
                                    value="graphs"
                                    leftSection={<IconChartBar size={15} />}
                                >
                                    Graphs
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="table">
                                <Group gap="md" mb="md">
                                    <Select
                                        label="View"
                                        w={220}
                                        data={[
                                            {
                                                value: "respondents",
                                                label: "One row per respondent",
                                            },
                                            {
                                                value: "rows",
                                                label: "One row per group row",
                                                disabled: groups.length === 0,
                                            },
                                        ]}
                                        value={view}
                                        onChange={(v) => v && setView(v)}
                                    />
                                    {view === "rows" && (
                                        <Select
                                            label="Group"
                                            w={280}
                                            data={groups.map((g) => ({
                                                value: g.path,
                                                label: g.label,
                                            }))}
                                            value={groupPath || null}
                                            onChange={(v) => setGroupPath(v || "")}
                                        />
                                    )}
                                </Group>

                                {view === "respondents" &&
                                table.total === 0 &&
                                !isLoading ? (
                                    <EmptyState
                                        icon={<IconInbox size={28} />}
                                        title="No responses match these filters"
                                        description="Clear a filter, or wait for someone to submit this screen from the app."
                                    />
                                ) : (
                                    <Paper
                                        withBorder
                                        radius="md"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {view === "respondents" ? (
                                            <DataTable
                                                records={table.rows}
                                                columns={columns}
                                                idAccessor="_id"
                                                fetching={isLoading}
                                                totalRecords={table.total}
                                                page={page}
                                                onPageChange={setPage}
                                                recordsPerPage={pageSize}
                                                recordsPerPageOptions={[25, 50, 100]}
                                                onRecordsPerPageChange={setPageSize}
                                                withTableBorder={false}
                                                withRowBorders
                                                highlightOnHover
                                                verticalSpacing="sm"
                                                minHeight={200}
                                                storeColumnsKey="questionnaire-responses"
                                            />
                                        ) : (
                                            <DataTable
                                                records={longRows.rows}
                                                columns={longColumns}
                                                idAccessor={(row) =>
                                                    `${row.responseId}-${row.rowId}`
                                                }
                                                fetching={rowsLoading}
                                                withTableBorder={false}
                                                withRowBorders
                                                highlightOnHover
                                                verticalSpacing="sm"
                                                minHeight={200}
                                                noRecordsText="No rows"
                                            />
                                        )}
                                    </Paper>
                                )}
                            </Tabs.Panel>

                            <Tabs.Panel value="graphs">
                                <ResponseCharts stats={stats} />
                            </Tabs.Panel>
                        </Tabs>
                    )}
                </Box>

                <GroupRowsDialog
                    open={Boolean(groupDialog)}
                    onClose={() => setGroupDialog(null)}
                    column={groupDialog?.column}
                    value={groupDialog?.value}
                    language={language}
                />
            </MantineShell>
        </Wrapper>
    );
}
