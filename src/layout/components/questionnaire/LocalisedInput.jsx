import {
    Badge,
    Group,
    Input,
    SegmentedControl,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useState } from "react";
import { DEFAULT_LANGUAGE, languageName, missingLanguages } from "./localise";

/**
 * One field, one value per language.
 *
 * The language picker is a SegmentedControl above the input, with its own
 * label — not tabs sharing an edge with the field, which is what made the
 * previous version read as one merged control.
 *
 * English is required because it is the stored fallback: a question with no
 * English renders blank for anyone whose language has no translation yet.
 */
export default function LocalisedInput({
    label,
    value,
    onChange,
    languages = [DEFAULT_LANGUAGE],
    required = false,
    multiline = false,
    placeholder,
    description,
}) {
    const [active, setActive] = useState(DEFAULT_LANGUAGE);
    const current = languages.includes(active) ? active : DEFAULT_LANGUAGE;
    const missing = missingLanguages(value, languages);

    const Field = multiline ? Textarea : TextInput;

    return (
        <Stack gap={6}>
            <Group justify="space-between" align="center" wrap="nowrap">
                <Input.Label required={required} size="sm">
                    {label}
                </Input.Label>

                <Group gap="xs" wrap="nowrap">
                    {missing.length > 0 && (
                        <Tooltip
                            label={`No translation yet for ${missing
                                .map(languageName)
                                .join(", ")}`}
                            withArrow
                        >
                            <Badge tt="none" color="orange" variant="light" size="sm">
                                {missing.length} untranslated
                            </Badge>
                        </Tooltip>
                    )}

                    {languages.length > 1 && (
                        <SegmentedControl
                            size="xs"
                            value={current}
                            onChange={setActive}
                            data={languages.map((code) => ({
                                value: code,
                                label: languageName(code),
                            }))}
                        />
                    )}
                </Group>
            </Group>

            {description && (
                <Text size="xs" c="dimmed">
                    {description}
                </Text>
            )}

            <Field
                autosize={multiline || undefined}
                minRows={multiline ? 2 : undefined}
                placeholder={
                    placeholder || `${label} in ${languageName(current)}`
                }
                value={(value && value[current]) || ""}
                onChange={(event) =>
                    onChange({
                        ...(value || {}),
                        [current]: event.currentTarget.value,
                    })
                }
            />
        </Stack>
    );
}
