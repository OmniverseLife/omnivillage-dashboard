import {
    ActionIcon,
    Box,
    Button,
    Collapse,
    Divider,
    Group,
    Modal,
    NumberInput,
    Paper,
    Select,
    Stack,
    Switch,
    Text,
    ThemeIcon,
} from "@mantine/core";
import {
    IconArrowDown,
    IconArrowUp,
    IconChevronDown,
    IconChevronRight,
    IconFileDescription,
    IconFolder,
    IconListCheck,
    IconPencil,
    IconPlus,
    IconSitemap,
    IconTrash,
} from "@tabler/icons-react";
import RowActions from "../../components/questionnaire/RowActions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchCountries } from "../../../functions/others";
import {
    addCategory,
    deleteCategory,
    editCategory,
    fetchCategories,
    reorderCategories,
} from "../../../functions/questionnaire";
import DeleteModal from "../../components/deleteModal/deleteModal";
import Loading from "../../components/loading";
import LocalisedInput from "../../components/questionnaire/LocalisedInput";
import MantineShell from "../../components/questionnaire/MantineShell";
import { EmptyState, PageHeader } from "../../components/questionnaire/shell";
import { languagesFor, localise } from "../../components/questionnaire/localise";
import Wrapper from "../../components/wrapper/wrapper";

const emptyForm = {
    title: {},
    description: {},
    parentId: "",
    is_screen: false,
    order: 0,
    active: true,
};

/** Flattens the tree for the parent picker, excluding a node's own subtree. */
const flattenForPicker = (nodes, excludeId, depth = 0, acc = []) => {
    nodes.forEach((node) => {
        if (node._id === excludeId) return; // skip self and everything under it
        acc.push({
            value: node._id,
            label: `${" ".repeat(depth * 4)}${localise(node.title)}`,
        });
        flattenForPicker(node.children || [], excludeId, depth + 1, acc);
    });
    return acc;
};

export default function Categories() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [expanded, setExpanded] = useState({});

    const { data: countries = [] } = useQuery({
        queryKey: ["countries"],
        queryFn: () => fetchCountries(),
        initialData: [],
    });
    const languages = useMemo(() => languagesFor(countries), [countries]);

    const {
        data: tree = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["questionnaire-categories", "tree"],
        queryFn: () => fetchCategories({ tree: true, includeInactive: true }),
        initialData: [],
    });

    const { control, handleSubmit, reset } = useForm({
        defaultValues: emptyForm,
    });

    useEffect(() => {
        reset(
            editItem
                ? {
                      ...emptyForm,
                      ...editItem,
                      title: editItem.title || {},
                      description: editItem.description || {},
                      parentId: editItem.parentId || "",
                  }
                : emptyForm
        );
    }, [editItem, reset]);

    const close = () => {
        setOpen(false);
        setEditItem(null);
        reset(emptyForm);
    };

    const onError = (err) =>
        toast.error(err?.response?.data?.message || "Something went wrong");

    const addMutation = useMutation({
        mutationFn: addCategory,
        onSuccess: () => {
            toast.success("Category added");
            refetch();
            close();
        },
        onError,
    });

    const editMutation = useMutation({
        mutationFn: editCategory,
        onSuccess: () => {
            toast.success("Category updated");
            refetch();
            close();
        },
        onError,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            toast.success("Category deleted");
            refetch();
            setDeleteId(null);
        },
        onError: (err) => {
            onError(err);
            setDeleteId(null);
        },
    });

    const reorderMutation = useMutation({
        mutationFn: reorderCategories,
        onSuccess: () => refetch(),
        onError,
    });

    const pickerOptions = useMemo(
        () => flattenForPicker(tree, editItem?._id),
        [tree, editItem]
    );

    const swap = (siblings, index, direction) => {
        const target = siblings[index + direction];
        if (!target) return;
        reorderMutation.mutate([
            { category_id: siblings[index]._id, order: target.order },
            { category_id: target._id, order: siblings[index].order },
        ]);
    };

    const renderNode = (node, siblings, index, depth = 0) => {
        const hasChildren = node.children?.length > 0;
        const isOpen = expanded[node._id];

        return (
            <Box key={node._id}>
                <Group
                    wrap="nowrap"
                    gap="sm"
                    px="md"
                    py="sm"
                    className="qn-row"
                    onClick={() =>
                        hasChildren &&
                        setExpanded((prev) => ({
                            ...prev,
                            [node._id]: !prev[node._id],
                        }))
                    }
                    style={{
                        cursor: hasChildren ? "pointer" : "default",
                        paddingLeft: `calc(var(--mantine-spacing-md) + ${
                            depth * 28
                        }px)`,
                        opacity: node.active ? 1 : 0.55,
                        borderBottom: "1px solid var(--mantine-color-gray-2)",
                    }}
                >
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((prev) => ({
                                ...prev,
                                [node._id]: !prev[node._id],
                            }));
                        }}
                        style={{
                            visibility: hasChildren ? "visible" : "hidden",
                        }}
                    >
                        {isOpen ? (
                            <IconChevronDown size={16} />
                        ) : (
                            <IconChevronRight size={16} />
                        )}
                    </ActionIcon>

                    <ThemeIcon
                        variant="light"
                        color={node.is_screen ? "brand" : "gray"}
                        size={32}
                        radius="md"
                    >
                        {node.is_screen ? (
                            <IconFileDescription size={18} />
                        ) : (
                            <IconFolder size={18} />
                        )}
                    </ThemeIcon>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap={8} wrap="nowrap">
                            <Text fw={node.is_screen ? 500 : 600} size="sm" truncate>
                                {localise(node.title)}
                            </Text>
                            {!node.active && (
                                <Text size="xs" c="dimmed">
                                    hidden
                                </Text>
                            )}
                        </Group>
                        <Text size="xs" c="dimmed">
                            {node.is_screen
                                ? `Screen · ${node.questionCount} question${
                                      node.questionCount === 1 ? "" : "s"
                                  }`
                                : `Section${
                                      hasChildren
                                          ? ` · ${node.children.length} inside`
                                          : ""
                                  }`}
                            {localise(node.description)
                                ? ` · ${localise(node.description)}`
                                : ""}
                        </Text>
                    </Box>

                    <Group gap="xs" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                        {node.is_screen && (
                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconListCheck size={14} />}
                                onClick={() =>
                                    navigate(
                                        `/questionnaire/questions?categoryId=${node._id}`
                                    )
                                }
                            >
                                Questions
                            </Button>
                        )}
                        <RowActions
                            items={[
                                {
                                    label: "Edit",
                                    icon: <IconPencil size={15} />,
                                    onClick: () => setEditItem(node),
                                },
                                {
                                    label: "Move up",
                                    icon: <IconArrowUp size={15} />,
                                    disabled: index === 0,
                                    onClick: () => swap(siblings, index, -1),
                                },
                                {
                                    label: "Move down",
                                    icon: <IconArrowDown size={15} />,
                                    disabled: index === siblings.length - 1,
                                    onClick: () => swap(siblings, index, 1),
                                },
                                { divider: true },
                                {
                                    label: "Delete",
                                    icon: <IconTrash size={15} />,
                                    color: "red.9",
                                    onClick: () => setDeleteId(node._id),
                                },
                            ]}
                        />
                    </Group>
                </Group>

                <Collapse in={isOpen}>
                    {(node.children || []).map((child, childIndex) =>
                        renderNode(child, node.children, childIndex, depth + 1)
                    )}
                </Collapse>
            </Box>
        );
    };

    return (
        <Wrapper>
            <Loading isLoading={isLoading} />
            <MantineShell>
                <Box p="xl">
                    <PageHeader
                        title="Categories"
                        description="Sections group things together. Only a screen holds questions and collects answers — that is the distinction the app navigates by."
                        action={
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => setOpen(true)}
                            >
                                Add category
                            </Button>
                        }
                    />

                    {tree.length === 0 && !isLoading ? (
                        <EmptyState
                            icon={<IconSitemap size={28} />}
                            title="Nothing here yet"
                            description="Start with a section like “Household census”, then add screens inside it."
                            action={
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => setOpen(true)}
                                >
                                    Add category
                                </Button>
                            }
                        />
                    ) : (
                        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                            {tree.map((node, index) => renderNode(node, tree, index))}
                        </Paper>
                    )}
                </Box>

                <Modal
                    opened={open || Boolean(editItem)}
                    onClose={close}
                    size="lg"
                    centered
                    radius="md"
                    title={
                        <Box>
                            <Text fw={700}>
                                {editItem ? "Edit category" : "Add category"}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {editItem
                                    ? "Wording changes are safe — nothing is bound to a category's title."
                                    : "A section groups things; a screen holds questions."}
                            </Text>
                        </Box>
                    }
                >
                    <form
                        onSubmit={handleSubmit((form) => {
                            const payload = {
                                title: form.title,
                                description: form.description || {},
                                is_screen: Boolean(form.is_screen),
                                order: Number(form.order) || 0,
                                active: Boolean(form.active),
                            };
                            if (editItem) {
                                editMutation.mutate({
                                    category_id: editItem._id,
                                    ...payload,
                                });
                            } else {
                                addMutation.mutate({
                                    ...payload,
                                    parentId: form.parentId || null,
                                });
                            }
                        })}
                    >
                        <Stack gap="lg">
                            <Controller
                                control={control}
                                name="title"
                                render={({ field }) => (
                                    <LocalisedInput
                                        label="Title"
                                        required
                                        languages={languages}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="description"
                                render={({ field }) => (
                                    <LocalisedInput
                                        label="Description"
                                        languages={languages}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Optional — shown under the title"
                                    />
                                )}
                            />

                            {!editItem && (
                                <Controller
                                    control={control}
                                    name="parentId"
                                    render={({ field }) => (
                                        <Select
                                            label="Sits inside"
                                            placeholder="Top level (no parent)"
                                            clearable
                                            data={pickerOptions}
                                            value={field.value || null}
                                            onChange={(v) => field.onChange(v || "")}
                                        />
                                    )}
                                />
                            )}

                            <Controller
                                control={control}
                                name="order"
                                render={({ field }) => (
                                    <NumberInput
                                        label="Display order"
                                        placeholder="Lower numbers appear first"
                                        value={field.value}
                                        onChange={field.onChange}
                                        min={0}
                                        w={220}
                                    />
                                )}
                            />

                            <Divider />

                            <Controller
                                control={control}
                                name="is_screen"
                                render={({ field }) => (
                                    <Switch
                                        checked={Boolean(field.value)}
                                        onChange={(e) =>
                                            field.onChange(e.currentTarget.checked)
                                        }
                                        label="This is a screen"
                                        description="Screens hold questions and produce one response per user. Sections only group things."
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="active"
                                render={({ field }) => (
                                    <Switch
                                        checked={Boolean(field.value)}
                                        onChange={(e) =>
                                            field.onChange(e.currentTarget.checked)
                                        }
                                        label="Active"
                                        description="Hidden categories stay in the dashboard but disappear from the app."
                                    />
                                )}
                            />

                            <Group justify="flex-end" gap="sm" mt="xs">
                                <Button variant="default" onClick={close}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editItem ? "Save changes" : "Add category"}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Modal>
            </MantineShell>

            <DeleteModal
                open={Boolean(deleteId)}
                setOpen={() => setDeleteId(null)}
                onAgree={() => deleteMutation.mutate(deleteId)}
            />
        </Wrapper>
    );
}
