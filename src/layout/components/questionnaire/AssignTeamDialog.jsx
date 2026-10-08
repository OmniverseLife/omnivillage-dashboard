import {
    Box,
    Button,
    Code,
    Divider,
    Group,
    Modal,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { assignTeam, fetchPlaces } from "../../../functions/places";
import { breadcrumb, placeName } from "./constants";

/**
 * What is left to show when a new temporary password could not be emailed:
 * the server hands it back once, for the super admin to pass on.
 */
export function TempPassword({ email, password, onDone }) {
    return (
        <Stack gap="md">
            <Text size="sm">
                The email could not be sent. Give this temporary password to{" "}
                {email}:
            </Text>
            <Code block fz="lg" ta="center">
                {password}
            </Code>
            <Group justify="flex-end">
                <Button onClick={onDone}>Done</Button>
            </Group>
        </Stack>
    );
}

/**
 * Gives one person one place to manage (PDF p.26).
 *
 * `placeId` preselects the place of the row it was opened from. `email` fixes
 * the person, which is how People moves an existing account to another place
 * with this same dialog.
 */
export default function AssignTeamDialog({ opened, onClose, placeId, email }) {
    const queryClient = useQueryClient();
    const [issued, setIssued] = useState(null);

    const { data: places = [] } = useQuery({
        queryKey: ["places", "stats"],
        queryFn: () => fetchPlaces({ stats: true }),
        enabled: opened,
    });
    const byId = useMemo(
        () => new Map(places.map((place) => [place._id, place])),
        [places]
    );

    const { control, register, handleSubmit, reset, watch } = useForm({
        defaultValues: { email: "", placeId: "" },
    });

    useEffect(() => {
        if (!opened) return;
        setIssued(null);
        reset({ email: email || "", placeId: placeId || "" });
    }, [opened, email, placeId, reset]);

    const chosen = byId.get(watch("placeId"));
    const name = chosen ? placeName(chosen) : "this place";

    const assign = useMutation({
        mutationFn: assignTeam,
        onSuccess: (answer, sent) => {
            queryClient.invalidateQueries({ queryKey: ["places"] });
            queryClient.invalidateQueries({ queryKey: ["team"] });
            // A new account whose email did not go out: stay open, because
            // this is the only time its temporary password can be shown.
            if (answer.created && !answer.emailed) {
                setIssued({ email: sent.email, password: answer.tempPassword });
                return;
            }
            toast.success(
                answer.emailed
                    ? `A temporary password was emailed to ${sent.email}.`
                    : `${sent.email} now manages ${name}.`
            );
            onClose();
        },
        onError: (err) =>
            toast.error(err?.response?.data?.message || "Something went wrong"),
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            radius="md"
            title={
                <Box>
                    <Text fw={700}>Assign a regional team</Text>
                    <Text size="xs" c="dimmed">
                        Give a person their own place to manage
                    </Text>
                </Box>
            }
        >
            {issued ? (
                <TempPassword {...issued} onDone={onClose} />
            ) : (
                <form
                    onSubmit={handleSubmit((form) =>
                        assign.mutate({
                            email: form.email.trim(),
                            placeId: form.placeId,
                        })
                    )}
                >
                    <Stack gap="lg">
                        <TextInput
                            label="Email"
                            type="email"
                            placeholder="name@example.org"
                            required
                            withAsterisk={false}
                            readOnly={Boolean(email)}
                            variant={email ? "filled" : "default"}
                            data-autofocus
                            {...register("email")}
                        />
                        <Controller
                            control={control}
                            name="placeId"
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Place"
                                    searchable
                                    data={places.map((place) => ({
                                        value: place._id,
                                        label: breadcrumb(place, byId),
                                    }))}
                                    value={field.value || null}
                                    onChange={(value) => field.onChange(value || "")}
                                    error={Boolean(fieldState.error)}
                                    description="The person manages this place and everything inside it."
                                    inputWrapperOrder={[
                                        "label",
                                        "input",
                                        "description",
                                        "error",
                                    ]}
                                />
                            )}
                        />

                        <Box
                            p="sm"
                            bg="brand.0"
                            c="brand.8"
                            style={{
                                border: "1px solid var(--mantine-color-brand-3)",
                                borderRadius: "var(--mantine-radius-md)",
                            }}
                        >
                            <Text size="sm" fw={700}>
                                When this person signs in, they
                            </Text>
                            <Text size="sm">
                                see only Questionnaire and Responses, for {name}
                            </Text>
                            <Text size="sm">
                                can switch questions on or off, reword them and add
                                their own
                            </Text>
                            <Text size="sm">
                                cannot open the Master, any other place, Locations
                                or People
                            </Text>
                        </Box>

                        {chosen && (
                            <Text size="sm" c="dimmed">
                                Already assigned to {name}:{" "}
                                {chosen.team?.length
                                    ? chosen.team
                                          .map((member) => member.email)
                                          .join(", ")
                                    : "no one yet"}
                                .
                            </Text>
                        )}

                        <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
                        <Group justify="flex-end" gap="sm">
                            <Button variant="default" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={assign.isPending}>
                                Assign
                            </Button>
                        </Group>
                    </Stack>
                </form>
            )}
        </Modal>
    );
}
