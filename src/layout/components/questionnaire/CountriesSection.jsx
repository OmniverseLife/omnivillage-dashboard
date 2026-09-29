import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    Modal,
    MultiSelect,
    Paper,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    Tooltip,
} from "@mantine/core";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { dataTableProps } from "./tableStyles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    addCountry,
    deleteCountry,
    editCountry,
    fetchCountries,
} from "../../../functions/others";
import DeleteModal from "../deleteModal/deleteModal";
import MantineShell from "./MantineShell";
import { LANGUAGE_NAMES, languageName } from "./localise";

const emptyForm = {
    name: "",
    display_name: "",
    iso2: "",
    phone_code: "",
    currency: "",
    languages: ["en"],
    active: true,
    order: 0,
};

/**
 * Master list of countries.
 *
 * `name` is stored lowercase because it is the join key back to the existing
 * free-text `villages.country` / `user.country` strings — that is what keeps
 * this additive. `phone_code` is what maps a villager's phone to their country
 * when the backend resolves question targeting.
 */
export default function CountriesSection() {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const {
        data: countries = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["countries"],
        queryFn: () => fetchCountries(),
        initialData: [],
    });

    const { control, register, handleSubmit, reset } = useForm({
        defaultValues: emptyForm,
    });

    useEffect(() => {
        reset(editItem ? { ...emptyForm, ...editItem } : emptyForm);
    }, [editItem, reset]);

    const close = () => {
        setOpen(false);
        setEditItem(null);
        reset(emptyForm);
    };

    const onError = (err) =>
        toast.error(err?.response?.data?.message || "Something went wrong");

    const addMutation = useMutation({
        mutationFn: addCountry,
        onSuccess: () => {
            toast.success("Country added");
            refetch();
            close();
        },
        onError,
    });
    const editMutation = useMutation({
        mutationFn: editCountry,
        onSuccess: () => {
            toast.success("Country updated");
            refetch();
            close();
        },
        onError,
    });
    const deleteMutation = useMutation({
        mutationFn: deleteCountry,
        onSuccess: () => {
            toast.success("Country deleted");
            refetch();
            setDeleteId(null);
        },
        onError: (err) => {
            onError(err);
            setDeleteId(null);
        },
    });

    const columns = [
        {
            accessor: "display_name",
            title: "Country",
            render: (row) => (
                <Text size="sm" fw={500} tt="capitalize">
                    {row.display_name || row.name}
                </Text>
            ),
        },
        {
            accessor: "name",
            title: "Key",
            render: (row) => (
                <Text size="sm" c="dimmed" ff="monospace">
                    {row.name}
                </Text>
            ),
        },
        { accessor: "iso2", title: "ISO", width: 80 },
        {
            accessor: "phone_code",
            title: "Phone code",
            width: 130,
            render: (row) =>
                row.phone_code ? (
                    <Text size="sm">+{row.phone_code}</Text>
                ) : (
                    <Tooltip
                        label="Without a phone code, targeting falls back to the user's country field"
                        withArrow
                    >
                        <Badge tt="none" color="orange" variant="light">
                            not set
                        </Badge>
                    </Tooltip>
                ),
        },
        { accessor: "currency", title: "Currency", width: 100 },
        {
            accessor: "languages",
            title: "Languages",
            width: 200,
            render: (row) => (
                <Group gap={4}>
                    {(row.languages || []).map((code) => (
                        <Badge tt="none" key={code} size="sm" variant="default">
                            {languageName(code)}
                        </Badge>
                    ))}
                </Group>
            ),
        },
        {
            accessor: "active",
            title: "Active",
            width: 100,
            render: (row) => (
                <Switch
                    size="sm"
                    checked={row.active}
                    onChange={(e) =>
                        editMutation.mutate({
                            country_id: row._id,
                            active: e.currentTarget.checked,
                        })
                    }
                />
            ),
        },
        {
            accessor: "actions",
            title: "",
            width: 90,
            textAlign: "right",
            render: (row) => (
                <Group gap={2} justify="flex-end" wrap="nowrap">
                    <Tooltip label="Edit" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => setEditItem(row)}
                        >
                            <IconPencil size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="danger"
                            onClick={() => setDeleteId(row._id)}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            ),
        },
    ];

    return (
        <MantineShell>
            <Box px="md">
                <Group justify="space-between" align="flex-start" mb="md">
                    <Box>
                        <Title order={3} fw={700}>
                            Countries
                        </Title>
                        <Text size="sm" c="dimmed">
                            Used for questionnaire targeting and to group villages.
                        </Text>
                    </Box>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setOpen(true)}
                    >
                        Add country
                    </Button>
                </Group>

                <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                    <DataTable
                        records={countries}
                        columns={columns}
                        idAccessor="_id"
                        fetching={isLoading}
                        {...dataTableProps}
                        noRecordsText="No countries yet"
                    />
                </Paper>
            </Box>

            <Modal
                opened={open || Boolean(editItem)}
                onClose={close}
                centered
                radius="md"
                title={
                    <Text fw={700}>
                        {editItem ? "Edit country" : "Add country"}
                    </Text>
                }
            >
                <form
                    onSubmit={handleSubmit((form) => {
                        const payload = {
                            name: form.name,
                            display_name: form.display_name || form.name,
                            iso2: form.iso2 || "",
                            phone_code: form.phone_code || "",
                            currency: form.currency || "",
                            languages: form.languages || ["en"],
                            active: Boolean(form.active),
                            order: Number(form.order) || 0,
                        };
                        if (editItem) {
                            editMutation.mutate({
                                country_id: editItem._id,
                                ...payload,
                            });
                        } else {
                            addMutation.mutate(payload);
                        }
                    })}
                >
                    <Stack gap="md">
                        <TextInput
                            label="Name"
                            required
                            description="Stored lowercase — it must match how villages already spell this country"
                            {...register("name")}
                        />
                        <TextInput
                            label="Display name"
                            {...register("display_name")}
                        />
                        <Group grow>
                            <TextInput label="ISO2" {...register("iso2")} />
                            <TextInput
                                label="Phone code"
                                description="Digits only, e.g. 91"
                                {...register("phone_code")}
                            />
                        </Group>
                        <TextInput label="Currency" {...register("currency")} />

                        <Controller
                            control={control}
                            name="languages"
                            render={({ field }) => (
                                <MultiSelect
                                    label="Languages"
                                    description="Questions can be authored in these for this country"
                                    data={Object.keys(LANGUAGE_NAMES).map(
                                        (code) => ({
                                            value: code,
                                            label: languageName(code),
                                            // English is the stored fallback for
                                            // every label, so it cannot be removed.
                                            disabled: code === "en",
                                        })
                                    )}
                                    value={field.value || ["en"]}
                                    onChange={(next) =>
                                        field.onChange(
                                            next.includes("en")
                                                ? next
                                                : ["en", ...next]
                                        )
                                    }
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
                                    description="Inactive countries stay listed but are not offered when targeting questions."
                                />
                            )}
                        />

                        <Group justify="flex-end" gap="sm" mt="xs">
                            <Button variant="default" onClick={close}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editItem ? "Save changes" : "Add country"}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <DeleteModal
                open={Boolean(deleteId)}
                setOpen={() => setDeleteId(null)}
                onAgree={() => deleteMutation.mutate(deleteId)}
            />
        </MantineShell>
    );
}
