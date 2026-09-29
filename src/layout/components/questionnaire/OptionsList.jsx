import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    Paper,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { IconLock, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { DEFAULT_LANGUAGE, languageName, localise } from "./localise";
import { slugifyLocalised } from "./optionHelpers";

const HEX_ID = /^[a-f0-9]{24}$/i;

/**
 * Options for a select question, built for real master data: seeded questions
 * carry up to 115 options (Crop), so this is a compact, searchable,
 * height-bounded list with ONE language switcher for the whole list — not a
 * card and a language picker per option.
 *
 * `value` is the option's immutable identity (stored with every answer);
 * `label` is localised display copy. Once saved, the key is shown read-only
 * and de-emphasised — for seeded options it is the master-data record id,
 * which means nothing to an admin but must never change.
 */
export default function OptionsList({
    control,
    register,
    watch,
    setValue,
    languages = [DEFAULT_LANGUAGE],
    name = "options",
    lockSaved = true,
    compact = false,
}) {
    const { fields, append, remove } = useFieldArray({ control, name });
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [query, setQuery] = useState("");

    const all = watch(name) || [];
    const current = languages.includes(language) ? language : DEFAULT_LANGUAGE;

    const untranslated =
        current === DEFAULT_LANGUAGE
            ? 0
            : all.filter((o) => !o?.label?.[current]?.trim?.()).length;

    // Filter by label in ANY language, but keep the original field index so
    // form paths stay correct.
    const visible = fields
        .map((field, index) => ({ field, index }))
        .filter(({ index }) => {
            if (!query.trim()) return true;
            const label = all[index]?.label || {};
            const haystack = Object.values(label).join(" ").toLowerCase();
            return haystack.includes(query.trim().toLowerCase());
        });

    return (
        <Box>
            <Group justify="space-between" align="flex-end" mb="xs" wrap="nowrap">
                <Box>
                    <Group gap={8}>
                        <Text size="sm" fw={600}>
                            Options
                        </Text>
                        <Badge tt="none" variant="light" color="gray" size="sm">
                            {fields.length}
                        </Badge>
                        {untranslated > 0 && (
                            <Badge tt="none" variant="light" color="orange" size="sm">
                                {untranslated} missing in {languageName(current)}
                            </Badge>
                        )}
                    </Group>
                    {!compact && (
                        <Text size="xs" c="dimmed">
                            The label is what people read. The key is stored with
                            every answer and cannot change once saved.
                        </Text>
                    )}
                </Box>
                <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => append({ value: "", label: {} })}
                >
                    Add option
                </Button>
            </Group>

            <Paper withBorder radius="sm">
                <Group
                    gap="xs"
                    p="xs"
                    wrap="nowrap"
                    style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
                >
                    <TextInput
                        size="xs"
                        placeholder="Search options"
                        leftSection={<IconSearch size={14} />}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        style={{ flex: 1 }}
                    />
                    {languages.length > 1 && (
                        <SegmentedControl
                            size="xs"
                            value={current}
                            onChange={setLanguage}
                            data={languages.map((code) => ({
                                value: code,
                                label: languageName(code),
                            }))}
                        />
                    )}
                </Group>

                <ScrollArea.Autosize mah={compact ? 240 : 340} type="auto">
                    {fields.length === 0 ? (
                        <Text size="xs" c="dimmed" p="sm">
                            No options yet — a select question needs at least one.
                        </Text>
                    ) : visible.length === 0 ? (
                        <Text size="xs" c="dimmed" p="sm">
                            No options match “{query}”.
                        </Text>
                    ) : (
                        <Stack gap={0}>
                            {visible.map(({ field, index }) => {
                                const saved = all[index]?.value;
                                const locked = lockSaved && Boolean(field.value);
                                return (
                                    <Group
                                        key={field.id}
                                        gap="sm"
                                        px="xs"
                                        py={6}
                                        wrap="nowrap"
                                        style={{
                                            borderBottom:
                                                "1px solid var(--mantine-color-gray-1)",
                                        }}
                                    >
                                        <Controller
                                            control={control}
                                            name={`${name}.${index}.label`}
                                            render={({ field: labelField }) => (
                                                <TextInput
                                                    size="xs"
                                                    style={{ flex: 1 }}
                                                    value={
                                                        labelField.value?.[current] ||
                                                        ""
                                                    }
                                                    // In another language, show the
                                                    // English as a hint to translate.
                                                    placeholder={
                                                        current === DEFAULT_LANGUAGE
                                                            ? "Option label"
                                                            : localise(
                                                                  labelField.value
                                                              ) || "Option label"
                                                    }
                                                    onChange={(e) => {
                                                        const next = {
                                                            ...(labelField.value ||
                                                                {}),
                                                            [current]:
                                                                e.currentTarget.value,
                                                        };
                                                        labelField.onChange(next);
                                                        if (
                                                            !locked &&
                                                            current ===
                                                                DEFAULT_LANGUAGE &&
                                                            !watch(
                                                                `${name}.${index}.value`
                                                            )
                                                        ) {
                                                            setValue(
                                                                `${name}.${index}.value`,
                                                                slugifyLocalised(
                                                                    next[
                                                                        DEFAULT_LANGUAGE
                                                                    ]
                                                                )
                                                            );
                                                        }
                                                    }}
                                                />
                                            )}
                                        />

                                        {locked ? (
                                            <Tooltip
                                                withArrow
                                                multiline
                                                w={260}
                                                label={
                                                    HEX_ID.test(saved || "")
                                                        ? `Linked to a master-data record (${saved}). Locked: changing it would detach past answers.`
                                                        : `Key: ${saved}. Locked: changing it would detach past answers.`
                                                }
                                            >
                                                <Group
                                                    gap={4}
                                                    w={130}
                                                    wrap="nowrap"
                                                    style={{ flexShrink: 0 }}
                                                >
                                                    <IconLock
                                                        size={12}
                                                        style={{
                                                            color: "var(--mantine-color-gray-5)",
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <Text
                                                        size="xs"
                                                        c="dimmed"
                                                        truncate
                                                    >
                                                        {HEX_ID.test(saved || "")
                                                            ? "Master data"
                                                            : saved}
                                                    </Text>
                                                </Group>
                                            </Tooltip>
                                        ) : (
                                            <TextInput
                                                size="xs"
                                                w={130}
                                                placeholder="key"
                                                styles={{
                                                    input: {
                                                        fontFamily:
                                                            "var(--mantine-font-family-monospace)",
                                                    },
                                                }}
                                                {...register(`${name}.${index}.value`)}
                                            />
                                        )}

                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            size="sm"
                                            aria-label="Remove option"
                                            onClick={() => remove(index)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                );
                            })}
                        </Stack>
                    )}
                </ScrollArea.Autosize>
            </Paper>
        </Box>
    );
}
