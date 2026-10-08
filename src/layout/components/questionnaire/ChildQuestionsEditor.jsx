import {
    Accordion,
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    Select,
    Stack,
    Switch,
    Text,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Controller, useFieldArray } from "react-hook-form";
import LocalisedInput from "./LocalisedInput";
import { QUESTION_TYPES, SELECT_TYPES } from "./constants";
import { localise } from "./localise";
import OptionsList from "./OptionsList";

/**
 * Children of a repeatable_group or a section.
 *
 * Each child is saved as its own question doc with parentQuestionId set, and
 * is also a row of its own in the editor's list: that row is where a saved
 * field is archived, deleted or given another type. A group child may itself
 * be a repeatable_group — that is the poultry shape (Livestock -> Products ->
 * Output) — and the server caps nesting at two levels, so the picker hides it
 * once we are already nested.
 *
 * A group's fields can also be laid out in sections (Crop -> Utilisation,
 * Important information). Such a section is only a heading: what it holds is
 * stored in the row, exactly like the fields beside it.
 *
 * `language` is the one the panel's selector chose; every label and option
 * list in here follows it.
 */
export default function ChildQuestionsEditor({
    control,
    register,
    watch,
    setValue,
    language,
    parentType = "repeatable_group",
    depth = 1,
    name = "children",
}) {
    const { fields, append, remove } = useFieldArray({ control, name });
    const isSection = parentType === "section";
    const allowGroups = !isSection && depth < 2;

    const types = QUESTION_TYPES.filter((t) => {
        if (t.value === "section") return !isSection; // never inside another
        if (t.value === "repeatable_group") return allowGroups;
        return true;
    });

    return (
        <Box>
            <Group justify="space-between" mb="xs">
                <Box>
                    <Group gap={6}>
                        <Text size="sm" fw={600}>
                            {isSection
                                ? "Questions in this section"
                                : "Fields in each row"}
                        </Text>
                        {!allowGroups && !isSection && (
                            <Badge tt="none" color="orange" variant="light" size="sm">
                                max nesting
                            </Badge>
                        )}
                    </Group>
                    <Text size="xs" c="dimmed">
                        {isSection
                            ? "Grouped under one heading. Each is answered normally — the grouping is presentation only."
                            : "These become the columns of every row someone adds."}
                    </Text>
                </Box>
                <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={() =>
                        append({
                            label: {},
                            type: "text",
                            required: false,
                            options: [],
                            children: [],
                        })
                    }
                >
                    {isSection ? "Add question" : "Add field"}
                </Button>
            </Group>

            {fields.length === 0 && (
                <Text size="xs" c="dimmed">
                    Nothing here yet — add at least one.
                </Text>
            )}

            <Accordion variant="separated" radius="sm">
                {fields.map((field, index) => (
                    <Accordion.Item key={field.id} value={field.id}>
                        <Accordion.Control>
                            <Group gap="xs" wrap="nowrap">
                                <Text size="sm" fw={500}>
                                    {localise(field.label, language) ||
                                        `Untitled ${index + 1}`}
                                </Text>
                                {field._id && (
                                    <Badge tt="none" size="xs" variant="default">
                                        saved
                                    </Badge>
                                )}
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack gap="md">
                                <Group align="flex-end" gap="sm" wrap="nowrap">
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Controller
                                            control={control}
                                            name={`${name}.${index}.label`}
                                            render={({ field: labelField }) => (
                                                <LocalisedInput
                                                    label="Label"
                                                    required
                                                    language={language}
                                                    value={labelField.value}
                                                    onChange={labelField.onChange}
                                                />
                                            )}
                                        />
                                    </Box>
                                    <Controller
                                        control={control}
                                        name={`${name}.${index}.type`}
                                        render={({ field: typeField }) => (
                                            <Select
                                                label="Type"
                                                w={200}
                                                // Locked once saved. Its own row
                                                // in the list is where the type
                                                // changes, while nothing has
                                                // been answered yet.
                                                disabled={Boolean(field._id)}
                                                data={types.map((t) => ({
                                                    value: t.value,
                                                    label: t.label,
                                                }))}
                                                value={typeField.value}
                                                onChange={typeField.onChange}
                                            />
                                        )}
                                    />
                                    {/* A saved field is a question of its
                                        own, which may have answers: it is
                                        archived or deleted from its own row
                                        in the list, not dropped from here. */}
                                    {!field._id && (
                                        <ActionIcon
                                            variant="subtle"
                                            color="danger"
                                            size="lg"
                                            aria-label="Remove"
                                            onClick={() => remove(index)}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    )}
                                </Group>

                                {watch(`${name}.${index}.type`) !== "section" && (
                                <Controller
                                    control={control}
                                    name={`${name}.${index}.required`}
                                    render={({ field: req }) => (
                                        <Switch
                                            checked={Boolean(req.value)}
                                            onChange={(e) =>
                                                req.onChange(e.currentTarget.checked)
                                            }
                                            label={
                                                isSection
                                                    ? "Required"
                                                    : "Required in every row"
                                            }
                                        />
                                    )}
                                />
                                )}

                                <Controller
                                    control={control}
                                    name={`${name}.${index}.type`}
                                    render={({ field: typeField }) =>
                                        SELECT_TYPES.includes(typeField.value) ? (
                                            <OptionsList
                                                control={control}
                                                register={register}
                                                watch={watch}
                                                setValue={setValue}
                                                language={language}
                                                name={`${name}.${index}.options`}
                                                mode={field._id ? "edit" : "add"}
                                                // Which options are in use is
                                                // only looked up for the
                                                // question a panel is opened
                                                // on. Here an answered field
                                                // offers Archive throughout.
                                                usedOptions={
                                                    field.answered
                                                        ? undefined
                                                        : []
                                                }
                                                compact
                                            />
                                        ) : typeField.value === "repeatable_group" ? (
                                            <ChildQuestionsEditor
                                                control={control}
                                                register={register}
                                                watch={watch}
                                                setValue={setValue}
                                                language={language}
                                                depth={depth + 1}
                                                name={`${name}.${index}.children`}
                                            />
                                        ) : typeField.value === "section" ? (
                                            <ChildQuestionsEditor
                                                control={control}
                                                register={register}
                                                watch={watch}
                                                setValue={setValue}
                                                language={language}
                                                parentType="section"
                                                name={`${name}.${index}.children`}
                                            />
                                        ) : (
                                            <span />
                                        )
                                    }
                                />
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Box>
    );
}
