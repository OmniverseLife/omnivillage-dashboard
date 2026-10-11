import { Input, Stack, Text, TextInput } from "@mantine/core";
import { DEFAULT_LANGUAGE, languageName } from "./localise";

/**
 * One field, one value per language.
 *
 * The form it sits in owns the choice of language (one selector for every
 * field of that form) and hands it in as `language`; this shows and edits
 * that language's text.
 *
 * English is required because it is the stored fallback: a question with no
 * English renders blank for anyone whose language has no translation yet.
 */
export default function LocalisedInput({
    label,
    value,
    onChange,
    language = DEFAULT_LANGUAGE,
    required = false,
    placeholder,
    description,
    // Anything else goes to the input itself (`data-autofocus`, for one).
    ...input
}) {
    return (
        <Stack gap={6}>
            <Input.Label required={required} size="sm">
                {label}
            </Input.Label>

            {description && (
                <Text size="xs" c="dimmed">
                    {description}
                </Text>
            )}

            <TextInput
                // The label above is not tied to the box; this names it.
                aria-label={label}
                // In another language the English is the hint: it is what
                // is being translated, and what people see until it is.
                placeholder={
                    (language !== DEFAULT_LANGUAGE &&
                        value?.[DEFAULT_LANGUAGE]) ||
                    placeholder ||
                    `${label} in ${languageName(language)}`
                }
                value={(value && value[language]) || ""}
                onChange={(event) =>
                    onChange({
                        ...(value || {}),
                        [language]: event.currentTarget.value,
                    })
                }
                {...input}
            />
        </Stack>
    );
}
