import {
    Anchor,
    Box,
    Button,
    Group,
    ScrollArea,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import StatusPill from "./StatusPill";
import { DEFAULT_LANGUAGE, localise } from "./localise";
import { slugifyLocalised } from "./optionHelpers";
import { SectionHeading } from "./shell";

const HELP = {
    edit: "The label is what people read. The key is stored with every answer and never changes.",
    add: "Shown for Single select and Multi select. The key is filled in from the label and locks when you save.",
};

// Room for a word-sized key; a seeded option's key is a 24-character record
// id, which is cut short and shown whole on hover.
const KEY_WIDTH = 170;

/**
 * Options for a select question, built for real master data: seeded questions
 * carry up to 115 options (Crop), so this is a compact, height-bounded list
 * that turns searchable once it is long. The language comes from the form it
 * sits in: one selector there drives every field and this list.
 *
 * `value` is the option's immutable identity (stored with every answer);
 * `label` is localised display copy. What a row offers depends on the row,
 * not on the list:
 *   - an option that was loaded (the form marks it `saved`) shows its key
 *     read-only, and "Archive" — or "Delete" once `usedOptions` shows that no
 *     saved answer holds it. An archived one is greyed, with "Restore";
 *   - an option added here has an editable key and "Remove".
 * Nothing is sent from here: the form saves the whole list.
 *
 * `usedOptions` left undefined means "not known yet", which offers Archive:
 * the choice that is always safe. `mode` picks the wording above the list.
 *
 * Given `place` (`{ _id, name, nameOf(id), published }`) it is the list of a
 * question that place did not add (PDF p.15). A place cannot reword or
 * archive an option: each row has a switch (`asked`) that decides whether
 * the place offers it, and the place adds options of its own, whose key the
 * server gives. Such a row is told by having no `value` yet, or the place's
 * id in `addedBy`; it can be removed until it has been published
 * (`published` holds the keys that have): answers may sit on it after that,
 * and its switch is the way to stop offering it.
 */
export default function OptionsList({
    control,
    register,
    watch,
    setValue,
    name = "options",
    mode = "add",
    language = DEFAULT_LANGUAGE,
    usedOptions,
    compact = false,
    place,
}) {
    const { fields, append, remove } = useFieldArray({ control, name });
    const [query, setQuery] = useState("");

    const all = watch(name) || [];

    const ownIn = (option) => !option.value || option.addedBy === place._id;
    const removableIn = (option) =>
        !option.value ||
        (option.addedBy === place._id &&
            !(place.published || []).includes(option.value));
    // Its place is kept in every row once one row has it, so that the
    // labels and switches of the list stay in line.
    const anyRemovable = Boolean(place) && all.some(removableIn);

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

    const actionFor = (option, index) => {
        const path = `${name}.${index}.archived`;
        if (!option.saved)
            return { label: "Remove", run: () => remove(index) };
        if (option.archived)
            return {
                label: "Restore",
                run: () => setValue(path, false, { shouldDirty: true }),
            };
        if (usedOptions && !usedOptions.includes(option.value))
            return { label: "Delete", run: () => remove(index) };
        return {
            label: "Archive",
            run: () => setValue(path, true, { shouldDirty: true }),
        };
    };

    return (
        <Box>
            <SectionHeading>
                {place ? `Answer options in ${place.name}` : "Answer options"}
                {!place &&
                    mode === "edit" &&
                    ` · ${all.filter((option) => !option?.archived).length}`}
            </SectionHeading>
            {!compact && (
                <Text size="sm" c="dimmed" mt={4}>
                    {place
                        ? `Switch off options that do not apply in ${place.name}, or add options only ${place.name} needs. Keys never change.`
                        : HELP[mode]}
                </Text>
            )}

            {fields.length > 7 && (
                <TextInput
                    mt="sm"
                    aria-label="Search options"
                    placeholder="Search options"
                    leftSection={<IconSearch size={14} />}
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                />
            )}

            <ScrollArea.Autosize
                mah={compact ? 240 : 340}
                type="auto"
                // Keeps the scrollbar of a long list off the links at the
                // end of each row.
                offsetScrollbars="present"
                mt="sm"
            >
                {fields.length === 0 ? (
                    <Text size="sm" c="dimmed">
                        No options yet. A select question needs at least one.
                    </Text>
                ) : visible.length === 0 ? (
                    <Text size="sm" c="dimmed">
                        No options match “{query}”.
                    </Text>
                ) : (
                    visible.map(({ field, index }) => {
                        const option = all[index] || {};
                        const keyPath = `${name}.${index}.value`;
                        const action = actionFor(option, index);
                        const own = Boolean(place) && ownIn(option);
                        const off = Boolean(place) && option.asked === false;
                        const keyText = (
                            <Text
                                size="xs"
                                c="dimmed"
                                ff="monospace"
                                truncate
                                w={KEY_WIDTH}
                                title={option.value}
                                style={{
                                    flexShrink: 0,
                                    opacity: option.archived ? 0.55 : 1,
                                }}
                            >
                                key: {option.value}
                            </Text>
                        );
                        return (
                            <Group
                                key={field.id}
                                gap="sm"
                                py={5}
                                wrap="nowrap"
                            >
                                <Controller
                                    control={control}
                                    name={`${name}.${index}.label`}
                                    render={({ field: labelField }) => (
                                        <TextInput
                                            // The ref lets the form put the
                                            // cursor in a row just added.
                                            ref={labelField.ref}
                                            aria-label="Option label"
                                            style={{ flex: 1, minWidth: 0 }}
                                            disabled={
                                                place
                                                    ? off
                                                    : Boolean(option.archived)
                                            }
                                            // A place writes the label of
                                            // its own options only.
                                            readOnly={Boolean(place) && !own}
                                            title={
                                                place && !own
                                                    ? "A place cannot reword an option it did not add."
                                                    : undefined
                                            }
                                            value={
                                                labelField.value?.[language] ||
                                                ""
                                            }
                                            // In another language, show the
                                            // English as a hint to translate.
                                            placeholder={
                                                (language !== DEFAULT_LANGUAGE &&
                                                    localise(
                                                        labelField.value
                                                    )) ||
                                                "Option label"
                                            }
                                            onChange={(event) => {
                                                const next = {
                                                    ...(labelField.value || {}),
                                                    [language]:
                                                        event.currentTarget
                                                            .value,
                                                };
                                                // The key follows the English
                                                // label until someone types a
                                                // key of their own: it is
                                                // rewritten only while it is
                                                // still what the label gave.
                                                // (Not in a place: the server
                                                // gives its options their key.)
                                                if (
                                                    !place &&
                                                    !option.saved &&
                                                    language ===
                                                        DEFAULT_LANGUAGE &&
                                                    (watch(keyPath) || "") ===
                                                        slugifyLocalised(
                                                            labelField.value?.[
                                                                DEFAULT_LANGUAGE
                                                            ]
                                                        )
                                                ) {
                                                    setValue(
                                                        keyPath,
                                                        slugifyLocalised(
                                                            next[
                                                                DEFAULT_LANGUAGE
                                                            ]
                                                        ),
                                                        { shouldDirty: true }
                                                    );
                                                }
                                                labelField.onChange(next);
                                            }}
                                        />
                                    )}
                                />

                                {place ? (
                                    <>
                                        {/* What the place did to it, where
                                            the Master shows its key. */}
                                        <Box w={KEY_WIDTH} style={{ flexShrink: 0 }}>
                                            {off ? (
                                                <StatusPill
                                                    status={{
                                                        kind: "hidden",
                                                        here:
                                                            !option.hiddenBy ||
                                                            option.hiddenBy ===
                                                                place._id,
                                                        placeName: place.nameOf(
                                                            option.hiddenBy
                                                        ),
                                                    }}
                                                />
                                            ) : own || option.addedBy ? (
                                                <StatusPill
                                                    status={{
                                                        kind: "added",
                                                        here: own,
                                                        placeName: place.nameOf(
                                                            option.addedBy
                                                        ),
                                                    }}
                                                />
                                            ) : (
                                                keyText
                                            )}
                                        </Box>
                                        {anyRemovable && (
                                            <Box
                                                w={64}
                                                ta="right"
                                                style={{ flexShrink: 0 }}
                                            >
                                                {removableIn(option) && (
                                                    <Anchor
                                                        component="button"
                                                        type="button"
                                                        size="sm"
                                                        fw={600}
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                    >
                                                        Remove
                                                    </Anchor>
                                                )}
                                            </Box>
                                        )}
                                        {/* Not on a row added just now: it
                                            has no key yet to switch. */}
                                        <Box w={46} style={{ flexShrink: 0 }}>
                                            {option.value && (
                                                <Switch
                                                    size="md"
                                                    aria-label={`Offer “${localise(
                                                        option.label,
                                                        language
                                                    )}” in ${place.name}`}
                                                    checked={!off}
                                                    onChange={(event) =>
                                                        setValue(
                                                            `${name}.${index}.asked`,
                                                            event.currentTarget
                                                                .checked,
                                                            { shouldDirty: true }
                                                        )
                                                    }
                                                />
                                            )}
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        {option.saved ? (
                                            keyText
                                        ) : (
                                            <TextInput
                                                aria-label="Option key"
                                                w={KEY_WIDTH}
                                                placeholder="key"
                                                style={{ flexShrink: 0 }}
                                                styles={{
                                                    input: {
                                                        fontFamily:
                                                            "var(--mantine-font-family-monospace)",
                                                    },
                                                }}
                                                {...register(keyPath)}
                                            />
                                        )}

                                        <Anchor
                                            component="button"
                                            type="button"
                                            size="sm"
                                            fw={600}
                                            w={64}
                                            ta="right"
                                            style={{ flexShrink: 0 }}
                                            onClick={action.run}
                                        >
                                            {action.label}
                                        </Anchor>
                                    </>
                                )}
                            </Group>
                        );
                    })
                )}
            </ScrollArea.Autosize>

            <Button
                mt="sm"
                variant="default"
                leftSection={<IconPlus size={14} />}
                onClick={() => {
                    // A search would hide the empty row it is about to add.
                    setQuery("");
                    // The cursor goes to the label; left to itself the form
                    // would pick the key, the field it met first.
                    append(
                        place
                            ? { label: {}, asked: true }
                            : { value: "", label: {} },
                        { focusName: `${name}.${fields.length}.label` }
                    );
                }}
            >
                {place ? `Add option for ${place.name}` : "Add option"}
            </Button>
        </Box>
    );
}
