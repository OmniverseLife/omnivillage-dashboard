import {
    ActionIcon,
    Button,
    Group,
    NumberInput,
    Select,
    Stack,
    TextInput,
} from "@mantine/core";
import { IconFilterPlus, IconFilterX, IconX } from "@tabler/icons-react";
import { useMemo, useRef } from "react";
import { flattenFilterTargets, operatorsFor } from "./constants";

// These rows sit in a popover. A list of choices that opened outside it (in
// a portal, as it does by default) would count as a click outside, and
// choosing from it would close the popover.
const INSIDE = { withinPortal: false };

/**
 * The per-question filters of the Responses page: one row per filter, each
 * a question, a condition and a value.
 *
 * `filters` is the list as the URL holds it, one `<question path>:<condition>
 * :<value>` each, a row still being filled in included (its value is empty,
 * and the page does not send it). `onChange` is handed the whole next list.
 */
export default function ResponseFilterBar({ filters, onChange, columns, language }) {
    const targets = useMemo(
        () =>
            flattenFilterTargets(columns, [], [], language).filter(
                // ponytail: no filter on a date. The server compares a
                // filter's value as a number or as text, and a saved date is
                // neither, so such a row could never match. Offer it again
                // once `f` compares dates.
                (target) => target.type !== "date"
            ),
        [columns, language]
    );

    const parse = (raw) => {
        const [path, op, ...rest] = raw.split(":");
        return { path, op, value: rest.join(":") };
    };

    // Removing a row takes the button that was pressed with it, and focus
    // with the button: Esc would then no longer reach the popover. Focus
    // is handed to the one button that is always here.
    const add = useRef(null);
    const remove = (next) => {
        add.current?.focus();
        onChange(next);
    };

    return (
        <Stack gap="sm">
            {filters.map((raw, index) => {
                const { path, op, value } = parse(raw);
                const target = targets.find((t) => t.path === path);
                const update = (next) => {
                    const copy = [...filters];
                    copy[index] = next;
                    onChange(copy);
                };

                return (
                    <Group key={index} gap="sm" align="flex-end" wrap="nowrap">
                        <Select
                            label={index === 0 ? "Question" : undefined}
                            aria-label="Question"
                            w={260}
                            searchable
                            comboboxProps={INSIDE}
                            data={targets.map((t) => ({
                                value: t.path,
                                label: t.label,
                            }))}
                            value={path}
                            onChange={(v) => {
                                if (!v) return;
                                const next = targets.find((t) => t.path === v);
                                update(
                                    `${v}:${operatorsFor(next?.type)[0].value}:`
                                );
                            }}
                        />
                        <Select
                            label={index === 0 ? "Condition" : undefined}
                            aria-label="Condition"
                            w={150}
                            comboboxProps={INSIDE}
                            data={operatorsFor(target?.type).map((o) => ({
                                value: o.value,
                                label: o.label,
                            }))}
                            value={op}
                            onChange={(v) => v && update(`${path}:${v}:${value}`)}
                        />

                        {target?.options?.length > 0 ? (
                            <Select
                                label={index === 0 ? "Value" : undefined}
                                aria-label="Value"
                                w={200}
                                searchable
                                comboboxProps={INSIDE}
                                data={target.options.map((o) => ({
                                    value: o.value,
                                    label: o.label,
                                }))}
                                value={value || null}
                                onChange={(v) =>
                                    update(`${path}:${op}:${v || ""}`)
                                }
                            />
                        ) : target?.type === "boolean" ? (
                            <Select
                                label={index === 0 ? "Value" : undefined}
                                aria-label="Value"
                                w={200}
                                comboboxProps={INSIDE}
                                data={[
                                    { value: "true", label: "Yes" },
                                    { value: "false", label: "No" },
                                ]}
                                value={value || null}
                                onChange={(v) =>
                                    update(`${path}:${op}:${v || ""}`)
                                }
                            />
                        ) : target?.type === "number" ? (
                            <NumberInput
                                label={index === 0 ? "Value" : undefined}
                                aria-label="Value"
                                w={200}
                                value={value === "" ? "" : Number(value)}
                                onChange={(v) =>
                                    update(`${path}:${op}:${v ?? ""}`)
                                }
                            />
                        ) : (
                            <TextInput
                                label={index === 0 ? "Value" : undefined}
                                aria-label="Value"
                                w={200}
                                value={value}
                                onChange={(e) =>
                                    update(
                                        `${path}:${op}:${e.currentTarget.value}`
                                    )
                                }
                            />
                        )}

                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            aria-label="Remove filter"
                            onClick={() =>
                                remove(filters.filter((_, i) => i !== index))
                            }
                        >
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>
                );
            })}

            <Group gap="sm">
                <Button
                    ref={add}
                    size="xs"
                    variant="light"
                    leftSection={<IconFilterPlus size={14} />}
                    disabled={targets.length === 0}
                    onClick={() => {
                        const first = targets[0];
                        onChange([
                            ...filters,
                            `${first.path}:${operatorsFor(first.type)[0].value}:`,
                        ]);
                    }}
                >
                    Add filter
                </Button>
                {filters.length > 0 && (
                    <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        leftSection={<IconFilterX size={14} />}
                        onClick={() => remove([])}
                    >
                        Clear all
                    </Button>
                )}
            </Group>
        </Stack>
    );
}
