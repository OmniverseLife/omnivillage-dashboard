import { Box, Button, Group, Modal, Paper, Stack, Text } from "@mantine/core";
import {
    IconMail,
    IconMapPin,
    IconTrash,
    IconUserPlus,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
    fetchTeam,
    removeTeamMember,
    resendTeamPassword,
} from "../../../functions/places";
import AssignTeamDialog, {
    TempPassword,
} from "../../components/questionnaire/AssignTeamDialog";
import MantineShell from "../../components/questionnaire/MantineShell";
import RowActions from "../../components/questionnaire/RowActions";
import { placeName } from "../../components/questionnaire/constants";
import { PageHeader } from "../../components/questionnaire/shell";
import { dataTableProps } from "../../components/questionnaire/tableStyles";
import Wrapper from "../../components/wrapper/wrapper";

const ROLE_LABELS = {
    admin: "Super admin",
    viewer: "Viewer",
    regional: "Regional team",
};

// Closing keeps what a dialog was showing, so its contents do not change
// under the reader while it fades out.
const closed = (dialog) => ({ ...dialog, opened: false });

export default function People() {
    const [assign, setAssign] = useState({ opened: false });
    const [removal, setRemoval] = useState({ opened: false });
    const [issued, setIssued] = useState({ opened: false });

    const {
        data: team = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["team"],
        queryFn: fetchTeam,
    });

    const onError = (err) =>
        toast.error(err?.response?.data?.message || "Something went wrong");

    const resendMutation = useMutation({
        mutationFn: (member) => resendTeamPassword(member._id),
        onSuccess: (answer, member) =>
            answer.emailed
                ? toast.success(
                      `A temporary password was emailed to ${member.email}.`
                  )
                : setIssued({
                      opened: true,
                      email: member.email,
                      password: answer.tempPassword,
                  }),
        onError,
    });

    const removeMutation = useMutation({
        mutationFn: removeTeamMember,
        onSuccess: () => {
            toast.success("Access removed");
            refetch();
            setRemoval(closed);
        },
        onError: (err) => {
            onError(err);
            setRemoval(closed);
        },
    });

    const columns = [
        { accessor: "name", title: "Name" },
        { accessor: "email", title: "Email" },
        {
            accessor: "role",
            title: "Role",
            render: (row) => ROLE_LABELS[row.role] || row.role,
        },
        {
            accessor: "place",
            title: "Place",
            // Only a village's own name is stored lowercase; the places
            // above it in the breadcrumb are shown as they were typed.
            render: ({ place }) =>
                place?.names
                    ?.map((name) =>
                        name === place.name ? placeName(place) : name
                    )
                    .join(" › "),
        },
        {
            accessor: "actions",
            title: "",
            width: 60,
            textAlign: "right",
            // Super admins and viewers are not managed from here.
            render: (row) =>
                row.role === "regional" && (
                    <RowActions
                        items={[
                            {
                                label: "Change place",
                                icon: <IconMapPin size={15} />,
                                // `place` is null once its place is gone, and
                                // then there is nothing to preselect.
                                onClick: () =>
                                    setAssign({
                                        opened: true,
                                        email: row.email,
                                        placeId: row.place?._id,
                                    }),
                            },
                            {
                                label: "Resend password",
                                icon: <IconMail size={15} />,
                                onClick: () => resendMutation.mutate(row),
                            },
                            { divider: true },
                            {
                                label: "Remove access",
                                icon: <IconTrash size={15} />,
                                color: "red.9",
                                onClick: () =>
                                    setRemoval({ opened: true, member: row }),
                            },
                        ]}
                    />
                ),
        },
    ];

    return (
        <Wrapper plain title="People">
            <MantineShell>
                <Box p="xl">
                    <PageHeader
                        title="People"
                        description="Everyone who can sign in to this dashboard. Regional teams see only their own place."
                        action={
                            <Button
                                leftSection={<IconUserPlus size={16} />}
                                onClick={() => setAssign({ opened: true })}
                            >
                                Assign a regional team
                            </Button>
                        }
                    />

                    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                        <DataTable
                            records={team}
                            columns={columns}
                            idAccessor="_id"
                            fetching={isLoading}
                            {...dataTableProps}
                            noRecordsText="No accounts"
                        />
                    </Paper>
                </Box>

                <AssignTeamDialog {...assign} onClose={() => setAssign(closed)} />

                <Modal
                    opened={issued.opened}
                    onClose={() => setIssued(closed)}
                    title={<Text fw={700}>Resend password</Text>}
                    centered
                    radius="md"
                >
                    <TempPassword
                        email={issued.email}
                        password={issued.password}
                        onDone={() => setIssued(closed)}
                    />
                </Modal>

                <Modal
                    opened={removal.opened}
                    onClose={() => setRemoval(closed)}
                    title={<Text fw={700}>Remove access?</Text>}
                    centered
                    radius="md"
                >
                    <Stack gap="md">
                        <Text size="sm" c="dimmed">
                            {removal.member?.email} will no longer be able to
                            sign in to this dashboard.
                        </Text>
                        <Group justify="flex-end" gap="sm">
                            <Button
                                variant="default"
                                onClick={() => setRemoval(closed)}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="red.9"
                                loading={removeMutation.isPending}
                                onClick={() =>
                                    removeMutation.mutate(removal.member._id)
                                }
                            >
                                Remove access
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </MantineShell>
        </Wrapper>
    );
}
