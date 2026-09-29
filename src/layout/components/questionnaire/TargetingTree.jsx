import {
    Badge,
    Box,
    Checkbox,
    Collapse,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { useMemo, useState } from "react";

/**
 * Exclusion-based targeting, rendered as inclusion.
 *
 * Everything is checked by default (empty exclusion arrays mean "applies
 * everywhere"). Unchecking adds to the exclusion list. Unchecking a whole
 * country implicitly excludes its villages, so those grey out rather than
 * being enumerated — which is exactly how the server evaluates it.
 */
export default function TargetingTree({ countries, villages, value, onChange }) {
    const [open, setOpen] = useState({});

    const excludedCountries = value?.excludedCountries || [];
    const excludedVillages = value?.excludedVillages || [];

    const villagesByCountry = useMemo(() => {
        const grouped = {};
        (villages || []).forEach((village) => {
            const key = village.countryId || village.country;
            grouped[key] = [...(grouped[key] || []), village];
        });
        return grouped;
    }, [villages]);

    const villagesFor = (country) =>
        villagesByCountry[country._id] || villagesByCountry[country.name] || [];

    const toggleCountry = (country) => {
        const excluded = excludedCountries.includes(country._id);
        onChange({
            excludedCountries: excluded
                ? excludedCountries.filter((id) => id !== country._id)
                : [...excludedCountries, country._id],
            // Re-including a country clears stale village exclusions under it,
            // so the UI can never show a country checked with invisible holes.
            excludedVillages: excluded
                ? excludedVillages.filter(
                      (id) => !villagesFor(country).some((v) => v._id === id)
                  )
                : excludedVillages,
        });
    };

    const toggleVillage = (villageId) => {
        onChange({
            excludedCountries,
            excludedVillages: excludedVillages.includes(villageId)
                ? excludedVillages.filter((id) => id !== villageId)
                : [...excludedVillages, villageId],
        });
    };

    const clean = !excludedCountries.length && !excludedVillages.length;

    return (
        <Box>
            <Group justify="space-between" mb="xs">
                <Box>
                    <Text size="sm" fw={600}>
                        Where this is asked
                    </Text>
                    <Text size="xs" c="dimmed">
                        Everything is included by default. Uncheck to hide it there.
                    </Text>
                </Box>
                <Badge tt="none" variant="light" color={clean ? "gray" : "orange"}>
                    {clean
                        ? "Everywhere"
                        : `${excludedCountries.length} country, ${excludedVillages.length} village excluded`}
                </Badge>
            </Group>

            <Paper withBorder radius="sm">
                <ScrollArea.Autosize mah={260}>
                    <Stack gap={0} p={4}>
                        {(countries || []).map((country) => {
                            const countryExcluded = excludedCountries.includes(
                                country._id
                            );
                            const countryVillages = villagesFor(country);
                            const excludedHere = countryVillages.filter((v) =>
                                excludedVillages.includes(v._id)
                            ).length;

                            return (
                                <Box key={country._id}>
                                    <Group gap="xs" wrap="nowrap" px="xs" py={6}>
                                        <UnstyledButton
                                            onClick={() =>
                                                setOpen((prev) => ({
                                                    ...prev,
                                                    [country._id]: !prev[country._id],
                                                }))
                                            }
                                            style={{ display: "flex" }}
                                        >
                                            {open[country._id] ? (
                                                <IconChevronDown size={15} />
                                            ) : (
                                                <IconChevronRight size={15} />
                                            )}
                                        </UnstyledButton>

                                        <Checkbox
                                            size="xs"
                                            checked={!countryExcluded}
                                            indeterminate={
                                                !countryExcluded &&
                                                excludedHere > 0 &&
                                                excludedHere < countryVillages.length
                                            }
                                            onChange={() => toggleCountry(country)}
                                            label={
                                                <Text
                                                    size="sm"
                                                    fw={500}
                                                    tt="capitalize"
                                                >
                                                    {country.display_name ||
                                                        country.name}
                                                </Text>
                                            }
                                        />
                                        <Text size="xs" c="dimmed">
                                            {countryVillages.length} village
                                            {countryVillages.length === 1 ? "" : "s"}
                                        </Text>
                                    </Group>

                                    <Collapse in={open[country._id]}>
                                        <Stack gap={2} pl={38} pb={4}>
                                            {countryVillages.map((village) => (
                                                <Checkbox
                                                    key={village._id}
                                                    size="xs"
                                                    disabled={countryExcluded}
                                                    checked={
                                                        !countryExcluded &&
                                                        !excludedVillages.includes(
                                                            village._id
                                                        )
                                                    }
                                                    onChange={() =>
                                                        toggleVillage(village._id)
                                                    }
                                                    label={
                                                        <Text
                                                            size="sm"
                                                            tt="capitalize"
                                                        >
                                                            {village.name}
                                                        </Text>
                                                    }
                                                />
                                            ))}
                                            {countryVillages.length === 0 && (
                                                <Text size="xs" c="dimmed">
                                                    No villages yet
                                                </Text>
                                            )}
                                        </Stack>
                                    </Collapse>
                                </Box>
                            );
                        })}
                    </Stack>
                </ScrollArea.Autosize>
            </Paper>
        </Box>
    );
}
