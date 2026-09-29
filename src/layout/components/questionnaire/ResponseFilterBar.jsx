import {
    ActionIcon,
    Button,
    Group,
    MultiSelect,
    NumberInput,
    Paper,
    Select,
    Stack,
    TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconFilterPlus, IconFilterX, IconX } from "@tabler/icons-react";
import { useMemo } from "react";
import { flattenFilterTargets, operatorsFor } from "./constants";
import { localise } from "./localise";

/**
 * All filter state lives in the URL, which is the pattern the existing
 * dashboard pages already use. Consequences worth having: a filtered view is a
 * shareable link, the Back button works, and the table and the graphs tab read
 * the same source so they cannot disagree.
 */
export default function ResponseFilterBar({
    searchParams,
    setSearchParams,
    screens,
    countries,
    villages,
    columns,
    language,
}) {
    const categoryId = searchParams.get("categoryId") || "";
    // Deliberately NOT "country"/"village": the shared Wrapper around every page
    // writes village NAMES into those params, while these hold ObjectIds.
    const country = searchParams.get("countryId") || "";
    const selectedVillages = searchParams.getAll("villageId");
    const filters = searchParams.getAll("f");

    const targets = useMemo(
        () => flattenFilterTargets(columns, [], [], language),
        [columns, language]
    );

    const setParam = (key, value) => {
        if (!value) searchParams.delete(key);
        else searchParams.set(key, value);
        setSearchParams(searchParams);
    };

    const setFilters = (next) => {
        searchParams.delete("f");
        next.forEach((filter) => searchParams.append("f", filter));
        setSearchParams(searchParams);
    };

    const parse = (raw) => {
        const [path, op, ...rest] = raw.split(":");
        return { path, op, value: rest.join(":") };
    };

    const visibleVillages = country
        ? villages.filter(
              (village) =>
                  village.countryId === country ||
                  village.country === countries.find((c) => c._id === country)?.name
          )
        : villages;

    const hasFilters =
        filters.length > 0 ||
        country ||
        selectedVillages.length > 0 ||
        searchParams.get("from") ||
        searchParams.get("to");

    return (
        <Paper withBorder radius="md" p="md" mb="md">
            <Group gap="md" align="flex-end" wrap="wrap">
                <Select
                    label="Screen"
                    w={230}
                    searchable
                    data={screens.map((s) => ({
                        value: s._id,
                        label: localise(s.title, language),
                    }))}
                    value={categoryId || null}
                    onChange={(v) => {
                        if (!v) return;
                        // Columns are per-screen, so every per-question filter
                        // becomes meaningless the moment the screen changes.
                        searchParams.delete("f");
                        setParam("categoryId", v);
                    }}
                />
                <Select
                    label="Country"
                    w={170}
                    clearable
                    placeholder="All countries"
                    data={countries.map((c) => ({
                        value: c._id,
                        label: c.display_name || c.name,
                    }))}
                    value={country || null}
                    onChange={(v) => {
                        searchParams.delete("villageId");
                        setParam("countryId", v || "");
                    }}
                />
                <MultiSelect
                    label="Villages"
                    w={230}
                    clearable
                    searchable
                    placeholder={
                        selectedVillages.length ? undefined : "All villages"
                    }
                    data={visibleVillages.map((v) => ({
                        value: v._id,
                        label: v.name,
                    }))}
                    value={selectedVillages}
                    onChange={(next) => {
                        searchParams.delete("villageId");
                        next.forEach((id) => searchParams.append("villageId", id));
                        setSearchParams(searchParams);
                    }}
                />
                <DatePickerInput
                    label="From"
                    placeholder="Any date"
                    w={160}
                    clearable
                    valueFormat="DD MMM YYYY"
                    value={
                        searchParams.get("from")
                            ? new Date(searchParams.get("from"))
                            : null
                    }
                    onChange={(d) =>
                        setParam("from", d ? d.toISOString().slice(0, 10) : "")
                    }
                />
                <DatePickerInput
                    label="To"
                    placeholder="Any date"
                    w={160}
                    clearable
                    valueFormat="DD MMM YYYY"
                    value={
                        searchParams.get("to")
                            ? new Date(searchParams.get("to"))
                            : null
                    }
                    onChange={(d) =>
                        setParam("to", d ? d.toISOString().slice(0, 10) : "")
                    }
                />
            </Group>

            {filters.length > 0 && (
                <Stack gap="sm" mt="md">
                    {filters.map((raw, index) => {
                        const { path, op, value } = parse(raw);
                        const target = targets.find((t) => t.path === path);
                        const update = (next) => {
                            const copy = [...filters];
                            copy[index] = next;
                            setFilters(copy);
                        };

                        return (
                            <Group key={index} gap="sm" align="flex-end" wrap="nowrap">
                                <Select
                                    label={index === 0 ? "Question" : undefined}
                                    w={260}
                                    searchable
                                    data={targets.map((t) => ({
                                        value: t.path,
                                        label: t.label,
                                    }))}
                                    value={path}
                                    onChange={(v) => {
                                        if (!v) return;
                                        const next = targets.find(
                                            (t) => t.path === v
                                        );
                                        update(
                                            `${v}:${operatorsFor(next?.type)[0].value}:`
                                        );
                                    }}
                                />
                                <Select
                                    label={index === 0 ? "Condition" : undefined}
                                    w={150}
                                    data={operatorsFor(target?.type).map((o) => ({
                                        value: o.value,
                                        label: o.label,
                                    }))}
                                    value={op}
                                    onChange={(v) =>
                                        v && update(`${path}:${v}:${value}`)
                                    }
                                />

                                {target?.options?.length > 0 ? (
                                    <Select
                                        label={index === 0 ? "Value" : undefined}
                                        w={200}
                                        searchable
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
                                        w={200}
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
                                        w={200}
                                        value={value === "" ? "" : Number(value)}
                                        onChange={(v) =>
                                            update(`${path}:${op}:${v ?? ""}`)
                                        }
                                    />
                                ) : target?.type === "date" ? (
                                    <DatePickerInput
                                        label={index === 0 ? "Value" : undefined}
                                        w={200}
                                        valueFormat="DD MMM YYYY"
                                        value={value ? new Date(value) : null}
                                        onChange={(d) =>
                                            update(
                                                `${path}:${op}:${
                                                    d
                                                        ? d
                                                              .toISOString()
                                                              .slice(0, 10)
                                                        : ""
                                                }`
                                            )
                                        }
                                    />
                                ) : (
                                    <TextInput
                                        label={index === 0 ? "Value" : undefined}
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
                                        setFilters(
                                            filters.filter((_, i) => i !== index)
                                        )
                                    }
                                >
                                    <IconX size={16} />
                                </ActionIcon>
                            </Group>
                        );
                    })}
                </Stack>
            )}

            <Group gap="sm" mt="md">
                <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconFilterPlus size={14} />}
                    disabled={targets.length === 0}
                    onClick={() => {
                        const first = targets[0];
                        setFilters([
                            ...filters,
                            `${first.path}:${operatorsFor(first.type)[0].value}:`,
                        ]);
                    }}
                >
                    Add filter
                </Button>
                {hasFilters && (
                    <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        leftSection={<IconFilterX size={14} />}
                        onClick={() => {
                            ["f", "villageId", "countryId", "from", "to"].forEach((k) =>
                                searchParams.delete(k)
                            );
                            setSearchParams(searchParams);
                        }}
                    >
                        Clear all
                    </Button>
                )}
            </Group>
        </Paper>
    );
}
