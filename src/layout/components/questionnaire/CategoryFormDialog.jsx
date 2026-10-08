import {
    Alert,
    Box,
    Button,
    Divider,
    Group,
    Modal,
    Radio,
    Stack,
    Switch,
    Text,
} from "@mantine/core";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import LocalisedInput from "./LocalisedInput";
import { DEFAULT_LANGUAGE, localise, withoutBlanks } from "./localise";
import { SectionHeading } from "./shell";

const emptyForm = { title: {}, description: {}, is_screen: true, active: true };

const KINDS = [
    {
        value: "page",
        title: "Question page",
        text: "Holds questions. This is what a user fills in.",
    },
    {
        value: "group",
        title: "Group",
        text: "Holds other categories, the way Food holds Production and Consumption.",
    },
];

// The wording that belongs to one kind of questionnaire (see the panel).
const COPY = {
    master: {
        title: "Add category to the Master",
        note: "This category appears in every place. A regional team can hide it for its own place.",
        top: "Top level, after the last category. Drag it in the tree to move it.",
    },
};

// A place's own category sits at the end and is not dragged.
const placeCopy = (name, reach) => ({
    title: `Add category to ${name}`,
    note: `This category appears in ${reach} only.`,
    top: "Top level, after the last category.",
});

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Adds a category (PDF p.19), at the top level or inside `parent`. Given
 * `category` it renames that one instead: title and description only, since
 * what kind of category it is cannot change once it exists.
 *
 * A new category is written in English, the language every other one falls
 * back to. Renaming edits the language the editor is showing (`language`),
 * which is how a title gets its translations.
 *
 * Like the other dialogs it saves nothing itself: `onAdd(body)` or
 * `onRename(changes)`. In a place (`placeName` is its name) what it adds
 * belongs to that place: the editor says so when it sends the body.
 */
export default function CategoryFormDialog({
    scope,
    placeName,
    placeReach,
    opened,
    onClose,
    category,
    parent,
    path,
    language,
    onAdd,
    onRename,
    loading,
}) {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: emptyForm,
    });
    const copy =
        scope.type === "master" ? COPY.master : placeCopy(placeName, placeReach);
    const editing = category ? language : DEFAULT_LANGUAGE;

    useEffect(() => {
        if (!opened) return;
        reset(
            category
                ? {
                      ...emptyForm,
                      title: category.title || {},
                      description: category.description || {},
                  }
                : emptyForm
        );
    }, [opened, category, reset]);

    const submit = (form) => {
        const title = withoutBlanks(form.title);
        const description = withoutBlanks(form.description);
        if (!title[DEFAULT_LANGUAGE]) {
            toast.error("Enter the title in English.");
            return;
        }
        if (!category) {
            onAdd({
                title,
                description,
                is_screen: form.is_screen,
                active: form.active,
                ...(parent && { parentId: parent._id }),
            });
            return;
        }
        const changes = {
            ...(!same(title, withoutBlanks(category.title)) && { title }),
            ...(!same(description, withoutBlanks(category.description)) && {
                description,
            }),
        };
        if (Object.keys(changes).length) onRename(changes);
        else onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={460}
            centered
            radius="md"
            title={
                <Box>
                    <Text fw={700}>
                        {category ? "Rename category" : copy.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {category
                            ? path
                            : parent
                            ? `Inside ${localise(
                                  parent.title,
                                  language
                              )}, after its last category.`
                            : copy.top}
                    </Text>
                </Box>
            }
        >
            <form onSubmit={handleSubmit(submit)}>
                <Stack gap="md">
                    {!category && <Alert variant="light">{copy.note}</Alert>}
                    <Controller
                        control={control}
                        name="title"
                        render={({ field }) => (
                            <LocalisedInput
                                label="Title"
                                language={editing}
                                value={field.value}
                                onChange={field.onChange}
                                data-autofocus
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <LocalisedInput
                                label="Description"
                                language={editing}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Optional. Shown under the title in the app"
                            />
                        )}
                    />

                    {!category && (
                        <>
                            <Divider />
                            <SectionHeading>What kind of category</SectionHeading>
                            <Controller
                                control={control}
                                name="is_screen"
                                render={({ field }) => (
                                    <Radio.Group
                                        aria-label="What kind of category"
                                        value={field.value ? "page" : "group"}
                                        onChange={(value) =>
                                            field.onChange(value === "page")
                                        }
                                    >
                                        <Stack gap="sm">
                                            {KINDS.map((kind) => {
                                                const chosen =
                                                    (kind.value === "page") ===
                                                    field.value;
                                                return (
                                                    <Radio.Card
                                                        key={kind.value}
                                                        value={kind.value}
                                                        radius="md"
                                                        p="md"
                                                        style={
                                                            chosen
                                                                ? {
                                                                      borderColor:
                                                                          "var(--mantine-primary-color-filled)",
                                                                      backgroundColor:
                                                                          "var(--mantine-primary-color-light)",
                                                                  }
                                                                : undefined
                                                        }
                                                    >
                                                        <Group
                                                            wrap="nowrap"
                                                            align="flex-start"
                                                            gap="sm"
                                                        >
                                                            <Radio.Indicator mt={2} />
                                                            <Box>
                                                                <Text size="sm" fw={700}>
                                                                    {kind.title}
                                                                </Text>
                                                                <Text size="sm" c="dimmed">
                                                                    {kind.text}
                                                                </Text>
                                                            </Box>
                                                        </Group>
                                                    </Radio.Card>
                                                );
                                            })}
                                        </Stack>
                                    </Radio.Group>
                                )}
                            />
                            <Divider />
                            <Controller
                                control={control}
                                name="active"
                                render={({ field }) => (
                                    <Switch
                                        checked={Boolean(field.value)}
                                        onChange={(event) =>
                                            field.onChange(
                                                event.currentTarget.checked
                                            )
                                        }
                                        label="Show in the app"
                                        description="Switch off to prepare a category before field users can see it."
                                        styles={{ label: { fontWeight: 700 } }}
                                    />
                                )}
                            />
                        </>
                    )}

                    <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            {category ? "Save to draft" : "Add category"}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
