import {
    Button,
    Divider,
    NavLink,
    Popover,
    ScrollArea,
    Text,
    TextInput,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { levelLabel, placeName, plural, visiblePlaces } from "./constants";
import { SectionHeading } from "./shell";

// The places a super admin opened last, newest first. Kept in this browser:
// it is a convenience of this screen, not something to store on the account.
const RECENT = "questionnaire-recent-places";

// The row that stands for no place at all, where a screen offers it.
const ALL = { _id: null, name: "All places" };

/**
 * The "Place: Ladakh" button at the start of a place's toolbar and the list
 * it opens (PDF p.10 for a regional team, p.11 for a super admin).
 *
 * `places` is the one list of every place, in tree order. A regional team is
 * also sent the places above its own, for their names only (`managed` is
 * false on those): they are not offered. `current` is the place on screen,
 * as `{ placeId, name }`, its name written for display; `onChoose(id)` opens
 * another.
 *
 * `allowAll` is for a screen that can also show every place at once
 * (Responses): a super admin gets an "All places" row first. It is the one
 * chosen when `current` is empty, and choosing it calls `onChoose(null)`.
 */
export default function PlacePicker({ places, current, onChoose, allowAll }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const regional = user.role === "regional";
    const [opened, setOpened] = useState(false);
    const [search, setSearch] = useState("");
    const currentId = current?.placeId ?? null;

    // This place first: it is the one opened last. Worked out again when
    // the place changes under a picker that stays on screen.
    const recent = useMemo(
        () =>
            [
                currentId,
                ...JSON.parse(localStorage.getItem(RECENT) || "[]").filter(
                    (id) => id !== currentId
                ),
            ]
                .filter(Boolean)
                .slice(0, 5),
        [currentId]
    );
    useEffect(() => {
        if (!regional) localStorage.setItem(RECENT, JSON.stringify(recent));
    }, [regional, recent]);

    // The name handed in is already written for display; the names in
    // `places` are as stored (a village's in lower case).
    const here = current ? current.name : ALL.name;
    // A team looking at a place inside its own is shown where it stands.
    const below = regional && user.place && user.place._id !== currentId;

    const listed = visiblePlaces(
        places.filter((place) => place.managed !== false),
        search,
        ""
    );
    // A team's own place sits at the left edge, however deep it is.
    const top = Math.min(...listed.map((place) => place.depth));
    const villagesIn = (id) =>
        places.filter(
            (place) => place.level === "village" && place.path.includes(id)
        ).length;

    // `detail` is what the tree says beside a place. A recent place has
    // none, and is not marked as the one on screen: the tree does that.
    const row = (place, key, indent, detail) => {
        const selected = Boolean(detail) && place._id === currentId;
        return (
            <NavLink
                key={key}
                component="button"
                type="button"
                label={placeName(place)}
                rightSection={
                    detail ? (
                        <Text
                            size="xs"
                            c={selected ? undefined : "dimmed"}
                            fw={selected ? 700 : undefined}
                        >
                            {detail}
                        </Text>
                    ) : undefined
                }
                pl={12 + indent * 18}
                fw={selected ? 700 : undefined}
                bg={selected ? "brand.0" : undefined}
                aria-current={selected ? "true" : undefined}
                style={{ borderRadius: "var(--mantine-radius-md)" }}
                onClick={() => {
                    setOpened(false);
                    if (place._id !== currentId) onChoose(place._id);
                }}
            />
        );
    };

    return (
        <Popover
            opened={opened}
            onChange={setOpened}
            position="bottom-start"
            width={360}
            shadow="md"
            trapFocus
        >
            <Popover.Target>
                <Button
                    variant="default"
                    bg="brand.0"
                    bd="1px solid var(--mantine-color-brand-6)"
                    rightSection={<IconChevronDown size={16} />}
                    style={{ flexShrink: 0 }}
                    onClick={() => setOpened((open) => !open)}
                >
                    Place:{" "}
                    {below ? `${placeName(user.place)} › ${here}` : here}
                </Button>
            </Popover.Target>
            <Popover.Dropdown p="sm">
                <TextInput
                    data-autofocus
                    aria-label={
                        regional
                            ? "Search your villages"
                            : "Search by name at any level"
                    }
                    placeholder={
                        regional
                            ? "Search your villages"
                            : "Search by name at any level"
                    }
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                />
                {/* As tall as the window leaves under the toolbar, so that a
                    short list of places is seen whole. */}
                <ScrollArea.Autosize
                    mah="max(220px, calc(100dvh - 340px))"
                    type="auto"
                    mt="sm"
                >
                    {!regional && !search.trim() && allowAll && (
                        <>
                            {row(
                                ALL,
                                "all",
                                0,
                                currentId === null && "selected"
                            )}
                            <Divider my="xs" />
                        </>
                    )}
                    {/* Nothing opened yet is possible only where no place
                        has to be chosen. */}
                    {!regional && !search.trim() && recent.length > 0 && (
                        <>
                            <SectionHeading px={12} mb={4}>
                                Recent
                            </SectionHeading>
                            {recent
                                .map((id) =>
                                    places.find((place) => place._id === id)
                                )
                                // One that was deleted since, or the list
                                // of places has not arrived yet.
                                .filter(Boolean)
                                .map((place) =>
                                    row(place, `recent-${place._id}`, 0)
                                )}
                            <Divider my="xs" />
                        </>
                    )}
                    <SectionHeading px={12} mb={4}>
                        {regional ? "Your place" : "All places"}
                    </SectionHeading>
                    {listed.length === 0 && (
                        <Text size="sm" c="dimmed" px={12} py={8}>
                            {search.trim() ? "No places match" : "Loading…"}
                        </Text>
                    )}
                    {listed.map((place) =>
                        row(
                            place,
                            place._id,
                            place.depth - top,
                            [
                                levelLabel(place.level),
                                place.level === "country" &&
                                    plural(villagesIn(place._id), "village"),
                                place._id === currentId && "selected",
                            ]
                                .filter(Boolean)
                                .join(" · ")
                        )
                    )}
                </ScrollArea.Autosize>
                <Divider my="xs" />
                <Text size="xs" c="dimmed" px={12} pb={4}>
                    {regional
                        ? `You manage ${
                              user.place ? placeName(user.place) : "your place"
                          } and everything inside it. Other places and the Master are not shown.`
                        : // Responses belong to places: there is no Master
                        // to look for in that list.
                        allowAll
                        ? "Places are added in Locations."
                        : "The Master is not in this list. It has its own menu item. Places are added in Locations."}
                </Text>
            </Popover.Dropdown>
        </Popover>
    );
}
