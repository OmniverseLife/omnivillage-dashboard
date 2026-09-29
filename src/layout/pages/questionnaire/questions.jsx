import {
    Box,
    Button,
    Group,
    Paper,
    Select,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    IconArrowDown,
    IconArrowUp,
    IconCornerDownRight,
    IconEye,
    IconEyeOff,
    IconPencil,
    IconPlus,
    IconTrash,
    IconZoomQuestion,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import RowActions from "../../components/questionnaire/RowActions";
import StatusDot from "../../components/questionnaire/StatusDot";
import { dataTableProps } from "../../components/questionnaire/tableStyles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { fetchCountries, fetchVillages } from "../../../functions/others";
import {
    addQuestion,
    deleteQuestion,
    editQuestion,
    fetchCategories,
    fetchQuestions,
    replaceQuestion,
    reorderQuestions,
    toggleQuestion,
} from "../../../functions/questionnaire";
import DeleteModal from "../../components/deleteModal/deleteModal";
import Loading from "../../components/loading";
import MantineShell from "../../components/questionnaire/MantineShell";
import QuestionFormModal from "../../components/questionnaire/QuestionFormModal";
import { EmptyState, PageHeader } from "../../components/questionnaire/shell";
import { typeLabel } from "../../components/questionnaire/constants";
import {
    languageName,
    languagesFor,
    localise,
} from "../../components/questionnaire/localise";
import Wrapper from "../../components/wrapper/wrapper";

/** Flattens the nested question tree into rows, keeping the nesting visible. */
const toRows = (questions, depth = 0, acc = []) => {
    questions.forEach((question) => {
        acc.push({ ...question, depth });
        toRows(question.children || [], depth + 1, acc);
    });
    return acc;
};

export default function Questions() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryId = searchParams.get("categoryId") || "";
    const language = searchParams.get("lang") || "en";

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

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

    const {
        data: questions = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["questionnaire-questions", categoryId],
        queryFn: () => fetchQuestions(categoryId),
        enabled: Boolean(categoryId),
        initialData: [],
    });

    const screens = useMemo(
        () => categories.filter((category) => category.is_screen),
        [categories]
    );
    const rows = useMemo(() => toRows(questions), [questions]);
    const languages = useMemo(() => languagesFor(countries), [countries]);

    const onError = (err) =>
        toast.error(err?.response?.data?.message || "Something went wrong");

    const close = () => {
        setModalOpen(false);
        setEditItem(null);
    };

    /**
     * Saves a parent's children after the parent, sequentially — a failed child
     * must not leave a half-saved group that looks empty in the app.
     */
    const saveChildren = async (parentId, children = []) => {
        for (const child of children) {
            const payload = {
                categoryId,
                parentQuestionId: parentId,
                label: child.label,
                type: child.type,
                options: child.options || [],
                required: Boolean(child.required),
                order: Number(child.order) || 0,
                presentation: child.presentation || "inline",
            };
            if (child._id) {
                await editQuestion({ question_id: child._id, ...payload });
                if (child.children?.length)
                    await saveChildren(child._id, child.children);
            } else {
                const created = await addQuestion(payload);
                if (child.children?.length)
                    await saveChildren(created._id, child.children);
            }
        }
    };

    const addMutation = useMutation({
        mutationFn: async (payload) => {
            const { children, ...question } = payload;
            const created = await addQuestion({ ...question, categoryId });
            if (["repeatable_group", "section"].includes(question.type))
                await saveChildren(created._id, children);
            return created;
        },
        onSuccess: () => {
            toast.success("Question added");
            refetch();
            close();
        },
        onError,
    });

    const editMutation = useMutation({
        mutationFn: async (payload) => {
            const { children, type, ...question } = payload;
            const updated = await editQuestion({
                question_id: editItem._id,
                ...question,
            });
            if (["repeatable_group", "section"].includes(type))
                await saveChildren(editItem._id, children);
            return updated;
        },
        onSuccess: () => {
            toast.success("Question updated");
            refetch();
            close();
        },
        onError,
    });

    const replaceMutation = useMutation({
        // `children` is deliberately not sent: replace-question deep-copies the
        // old group's subtree server-side, so resending would duplicate it.
        mutationFn: async (payload) => {
            const question = { ...payload };
            delete question.children;
            return replaceQuestion({ question_id: editItem._id, ...question });
        },
        onSuccess: () => {
            toast.success("Question replaced — the old one is retired");
            refetch();
            close();
        },
        onError,
    });

    const toggleMutation = useMutation({
        mutationFn: toggleQuestion,
        onSuccess: () => refetch(),
        onError,
    });
    const reorderMutation = useMutation({
        mutationFn: reorderQuestions,
        onSuccess: () => refetch(),
        onError,
    });
    const deleteMutation = useMutation({
        mutationFn: deleteQuestion,
        onSuccess: () => {
            toast.success("Question deleted");
            refetch();
            setDeleteId(null);
        },
        onError: (err) => {
            onError(err);
            setDeleteId(null);
        },
    });

    const swap = (row, direction) => {
        const siblings = rows.filter(
            (candidate) =>
                String(candidate.parentQuestionId || "") ===
                String(row.parentQuestionId || "")
        );
        const index = siblings.findIndex((s) => s._id === row._id);
        const target = siblings[index + direction];
        if (!target) return;
        reorderMutation.mutate([
            { question_id: row._id, order: target.order },
            { question_id: target._id, order: row.order },
        ]);
    };

    const columns = [
        {
            accessor: "label",
            title: "Question",
            render: (row) => {
                const isParent = ["repeatable_group", "section"].includes(row.type);
                return (
                    <Group
                        gap={8}
                        wrap="nowrap"
                        align="flex-start"
                        style={{ paddingLeft: row.depth * 24 }}
                    >
                        {row.depth > 0 && (
                            <IconCornerDownRight
                                size={15}
                                style={{
                                    marginTop: 3,
                                    color: "var(--mantine-color-gray-5)",
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <Box style={{ minWidth: 0 }}>
                            <Group gap={6} wrap="nowrap">
                                <Text size="sm" fw={isParent ? 600 : 500}>
                                    {localise(row.label, language)}
                                </Text>
                                {row.required && (
                                    <Text size="sm" c="red.9" fw={700}>
                                        *
                                    </Text>
                                )}
                            </Group>
                            <Text size="xs" c="dimmed">
                                {typeLabel(row.type)}
                                {row.options?.length > 0 &&
                                    ` · ${row.options.length} option${
                                        row.options.length === 1 ? "" : "s"
                                    }`}
                            </Text>
                        </Box>
                    </Group>
                );
            },
        },
        {
            accessor: "targeting",
            title: "Asked in",
            width: 200,
            render: (row) => {
                if (row.parentQuestionId)
                    return (
                        <Text size="sm" c="dimmed">
                            Same as parent
                        </Text>
                    );
                const c = row.targeting?.excludedCountries?.length || 0;
                const v = row.targeting?.excludedVillages?.length || 0;
                if (!c && !v)
                    return (
                        <Text size="sm" c="dimmed">
                            Everywhere
                        </Text>
                    );
                const parts = [];
                if (c) parts.push(`${c} ${c === 1 ? "country" : "countries"}`);
                if (v) parts.push(`${v} ${v === 1 ? "village" : "villages"}`);
                return (
                    <Tooltip label="Hidden from people in these places" withArrow>
                        <Text size="sm" c="orange.8" fw={500}>
                            Excludes {parts.join(", ")}
                        </Text>
                    </Tooltip>
                );
            },
        },
        {
            accessor: "status",
            title: "Status",
            width: 130,
            render: (row) =>
                row.replacedBy ? (
                    <StatusDot
                        status="retired"
                        label="Retired"
                        tooltip="Replaced by a newer question. Existing answers stay attached to this one."
                    />
                ) : row.active ? (
                    <StatusDot status="live" label="Live" />
                ) : (
                    <StatusDot
                        status="hidden"
                        label="Hidden"
                        tooltip="Not shown in the app. Answers already given are kept."
                    />
                ),
        },
        {
            accessor: "actions",
            title: "",
            width: 60,
            textAlign: "right",
            render: (row) => (
                <RowActions
                    items={[
                        {
                            label: "Edit",
                            icon: <IconPencil size={15} />,
                            onClick: () => {
                                setEditItem(row);
                                setModalOpen(true);
                            },
                        },
                        {
                            label: "Move up",
                            icon: <IconArrowUp size={15} />,
                            onClick: () => swap(row, -1),
                        },
                        {
                            label: "Move down",
                            icon: <IconArrowDown size={15} />,
                            onClick: () => swap(row, 1),
                        },
                        ...(row.replacedBy
                            ? []
                            : [
                                  {
                                      label: row.active
                                          ? "Hide from app"
                                          : "Show in app",
                                      icon: row.active ? (
                                          <IconEyeOff size={15} />
                                      ) : (
                                          <IconEye size={15} />
                                      ),
                                      onClick: () =>
                                          toggleMutation.mutate({
                                              question_id: row._id,
                                              active: !row.active,
                                          }),
                                  },
                              ]),
                        { divider: true },
                        {
                            label: "Delete",
                            icon: <IconTrash size={15} />,
                            color: "red.9",
                            onClick: () => setDeleteId(row._id),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <Wrapper>
            <Loading isLoading={isLoading} />
            <MantineShell>
                <Box p="xl">
                    <PageHeader
                        title="Questions"
                        description="Reword a question freely — past answers keep the wording they were given. Changing its type or an option's key creates a new question instead."
                        action={
                            <>
                                <Select
                                    placeholder="Choose a screen"
                                    w={240}
                                    searchable
                                    data={screens.map((s) => ({
                                        value: s._id,
                                        label: localise(s.title, language),
                                    }))}
                                    value={categoryId || null}
                                    onChange={(v) => {
                                        if (!v) return;
                                        searchParams.set("categoryId", v);
                                        setSearchParams(searchParams);
                                    }}
                                />
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
                                    leftSection={<IconPlus size={16} />}
                                    disabled={!categoryId}
                                    onClick={() => {
                                        setEditItem(null);
                                        setModalOpen(true);
                                    }}
                                >
                                    Add question
                                </Button>
                            </>
                        }
                    />

                    {!categoryId ? (
                        <EmptyState
                            icon={<IconZoomQuestion size={28} />}
                            title="Choose a screen"
                            description="Questions belong to a screen. Pick one above to see and edit them."
                        />
                    ) : rows.length === 0 && !isLoading ? (
                        <EmptyState
                            icon={<IconZoomQuestion size={28} />}
                            title="No questions on this screen yet"
                            description="Add the first one — it appears in the app for everyone this screen targets."
                            action={
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => {
                                        setEditItem(null);
                                        setModalOpen(true);
                                    }}
                                >
                                    Add question
                                </Button>
                            }
                        />
                    ) : (
                        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                            <DataTable
                                records={rows}
                                columns={columns}
                                idAccessor="_id"
                                fetching={isLoading}
                                {...dataTableProps}
                                onRowClick={({ record }) => {
                                    setEditItem(record);
                                    setModalOpen(true);
                                }}
                                rowStyle={(row) => ({
                                    cursor: "pointer",
                                    ...(["repeatable_group", "section"].includes(
                                        row.type
                                    ) && row.depth === 0
                                        ? {
                                              backgroundColor:
                                                  "var(--mantine-color-gray-0)",
                                          }
                                        : {}),
                                    ...(row.active ? {} : { opacity: 0.6 }),
                                })}
                                noRecordsText="No questions"
                            />
                        </Paper>
                    )}
                </Box>

                <QuestionFormModal
                    open={modalOpen}
                    onClose={close}
                    editItem={editItem}
                    categoryId={categoryId}
                    countries={countries}
                    villages={villages}
                    languages={languages}
                    isSaving={
                        addMutation.isPending ||
                        editMutation.isPending ||
                        replaceMutation.isPending
                    }
                    onSubmitAdd={(p) => addMutation.mutate(p)}
                    onSubmitEdit={(p) => editMutation.mutate(p)}
                    onSubmitReplace={(p) => replaceMutation.mutate(p)}
                />
            </MantineShell>

            <DeleteModal
                open={Boolean(deleteId)}
                setOpen={() => setDeleteId(null)}
                onAgree={() => deleteMutation.mutate(deleteId)}
            />
        </Wrapper>
    );
}
