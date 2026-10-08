import {
    Badge,
    Box,
    Button,
    Chip,
    Divider,
    Group,
    Input,
    Menu,
    Modal,
    Pill,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { addPlace, editPlace } from "../../../functions/places";
import { PLACE_LEVELS, breadcrumb, placeName } from "./constants";
import { DEFAULT_LANGUAGE, LANGUAGE_NAMES, languageName } from "./localise";

const emptyForm = { name: "", level: "village", parentId: "", languages: [] };

const rank = (level) =>
    PLACE_LEVELS.findIndex((entry) => entry.value === level);

// The design's pills are tighter than Mantine's (four fit on the first row),
// and it marks the chosen level with a fill and bold text where Mantine
// would add a tick and shift the label aside to make room for it.
const chip = { label: { paddingInline: 14 } };
const chosenChip = {
    iconWrapper: { display: "none" },
    label: {
        ...chip.label,
        backgroundColor: "var(--mantine-color-gray-1)",
        fontWeight: 700,
    },
};

/**
 * Adds a place of any level (PDF p.25). Given `place`, it renames that place
 * and edits its languages instead; level and parent are not offered there.
 *
 * `languages` holds only what the admin added HERE. An empty list is how a
 * place says "the same as the place above me", so the inherited ones are
 * shown but never sent.
 */
export default function PlaceFormDialog({ opened, onClose, places, place }) {
    const queryClient = useQueryClient();
    const { control, register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: emptyForm,
    });

    useEffect(() => {
        if (!opened) return;
        reset(
            place
                ? {
                      name: placeName(place),
                      level: place.level,
                      parentId: place.path[place.path.length - 1] || "",
                      // A country's English is the fixed chip, not an added one.
                      languages: (place.languages || []).filter(
                          (code) =>
                              place.level !== "country" ||
                              code !== DEFAULT_LANGUAGE
                      ),
                  }
                : emptyForm
        );
    }, [opened, place, reset]);

    const byId = useMemo(
        () => new Map(places.map((entry) => [entry._id, entry])),
        [places]
    );
    const level = watch("level");
    const isCountry = level === "country";
    const parent = byId.get(watch("parentId"));

    // Everything named from the country down to the parent is inherited; what
    // is added here adds to it. `source` is the nearest of those places, for
    // the "as India" wording.
    const above =
        !isCountry && parent
            ? [...parent.path.map((id) => byId.get(id)), parent].filter(
                  (entry) => entry?.languages?.length
              )
            : [];
    const source = above[above.length - 1];
    const inherited = above.length
        ? [...new Set(above.flatMap((entry) => entry.languages))]
        : [DEFAULT_LANGUAGE];

    const save = useMutation({
        mutationFn: place ? editPlace : addPlace,
        onSuccess: () => {
            toast.success(place ? "Place updated" : "Place added");
            queryClient.invalidateQueries({ queryKey: ["places"] });
            onClose();
        },
        onError: (err) =>
            toast.error(err?.response?.data?.message || "Something went wrong"),
    });

    const submit = (form) => {
        const name = form.name.trim();
        // English is the stored fallback, so a country always keeps it.
        const languages = isCountry
            ? [DEFAULT_LANGUAGE, ...form.languages]
            : form.languages;
        if (!place) {
            save.mutate({
                name,
                level: form.level,
                languages,
                ...(isCountry ? {} : { parentId: form.parentId }),
            });
            return;
        }
        save.mutate({
            place_id: place._id,
            languages,
            // A village that has villagers cannot be renamed, so a name that
            // was not touched is not sent: its languages can still be saved.
            ...([place.name, placeName(place)].includes(name) ? {} : { name }),
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            radius="md"
            title={
                <Box>
                    <Text fw={700}>{place ? "Rename place" : "Add place"}</Text>
                    <Text size="xs" c="dimmed">
                        {place
                            ? breadcrumb(place, byId)
                            : "A country, state, district, sub-district or village"}
                    </Text>
                </Box>
            }
        >
            <form onSubmit={handleSubmit(submit)}>
                <Stack gap="lg">
                    <TextInput
                        label="Name"
                        placeholder="Name of the place"
                        required
                        withAsterisk={false}
                        data-autofocus
                        {...register("name")}
                    />

                    {!place && (
                        <Controller
                            control={control}
                            name="level"
                            render={({ field }) => (
                                <Input.Wrapper label="Level" labelElement="div">
                                    <Chip.Group
                                        value={field.value}
                                        onChange={(next) => {
                                            field.onChange(next);
                                            // A place only fits inside a
                                            // higher level than its own.
                                            if (
                                                parent &&
                                                rank(parent.level) >= rank(next)
                                            )
                                                setValue("parentId", "");
                                        }}
                                    >
                                        <Group
                                            gap="xs"
                                            mt={4}
                                            role="radiogroup"
                                            aria-label="Level"
                                        >
                                            {PLACE_LEVELS.map((entry) => (
                                                <Chip
                                                    key={entry.value}
                                                    value={entry.value}
                                                    variant="outline"
                                                    color="gray"
                                                    styles={
                                                        entry.value === field.value
                                                            ? chosenChip
                                                            : chip
                                                    }
                                                >
                                                    {entry.label}
                                                </Chip>
                                            ))}
                                        </Group>
                                    </Chip.Group>
                                </Input.Wrapper>
                            )}
                        />
                    )}

                    {!place && !isCountry && (
                        <Controller
                            control={control}
                            name="parentId"
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Inside"
                                    searchable
                                    data={places
                                        .filter(
                                            (entry) =>
                                                rank(entry.level) < rank(level)
                                        )
                                        .map((entry) => ({
                                            value: entry._id,
                                            label: breadcrumb(entry, byId),
                                        }))}
                                    value={field.value || null}
                                    onChange={(value) => field.onChange(value || "")}
                                    error={Boolean(fieldState.error)}
                                    description="Pick the nearest level that exists. A village can sit directly in a country when the middle levels are not needed."
                                    inputWrapperOrder={[
                                        "label",
                                        "input",
                                        "description",
                                        "error",
                                    ]}
                                />
                            )}
                        />
                    )}

                    <Controller
                        control={control}
                        name="languages"
                        render={({ field }) => {
                            const choices = Object.keys(LANGUAGE_NAMES).filter(
                                (code) =>
                                    !inherited.includes(code) &&
                                    !field.value.includes(code)
                            );
                            return (
                                <Input.Wrapper label="Languages" labelElement="div">
                                    <Group gap="xs" mt={4}>
                                        <Badge
                                            tt="none"
                                            size="lg"
                                            variant="default"
                                            fw={400}
                                            c="dimmed"
                                        >
                                            {inherited.map(languageName).join(", ")}
                                            {source && ` · as ${source.name}`}
                                        </Badge>
                                        {field.value.map((code) => (
                                            <Pill
                                                key={code}
                                                size="md"
                                                withRemoveButton
                                                onRemove={() =>
                                                    field.onChange(
                                                        field.value.filter(
                                                            (added) => added !== code
                                                        )
                                                    )
                                                }
                                            >
                                                {languageName(code)}
                                            </Pill>
                                        ))}
                                        <Menu position="bottom-start" shadow="md">
                                            <Menu.Target>
                                                <Button
                                                    variant="default"
                                                    size="xs"
                                                    leftSection={<IconPlus size={14} />}
                                                    disabled={choices.length === 0}
                                                >
                                                    Add language
                                                </Button>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                {choices.map((code) => (
                                                    <Menu.Item
                                                        key={code}
                                                        onClick={() =>
                                                            field.onChange([
                                                                ...field.value,
                                                                code,
                                                            ])
                                                        }
                                                    >
                                                        {languageName(code)}
                                                    </Menu.Item>
                                                ))}
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Group>
                                </Input.Wrapper>
                            );
                        }}
                    />

                    {!place && (
                        <Text
                            size="sm"
                            p="sm"
                            bg="brand.0"
                            c="brand.8"
                            style={{
                                border: "1px solid var(--mantine-color-brand-3)",
                                borderRadius: "var(--mantine-radius-md)",
                            }}
                        >
                            No question setup is needed. The place starts with the
                            full Master questionnaire, plus whatever the levels
                            above it have already changed.
                        </Text>
                    )}

                    <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={save.isPending}>
                            {place ? "Save" : "Add place"}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
