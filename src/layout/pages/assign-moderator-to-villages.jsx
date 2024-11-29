import { MenuItem, Select, Stack, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import Wrapper from "../components/wrapper/wrapper";
import ReactSelect from "react-select";
import { useMutation, useQueries } from "@tanstack/react-query";
import { fetchVillages } from "../../functions/others";
import { getAllApprovedModerators } from "../../functions/moderator";
import Loading from "../components/loading";
import { addModeratorToVillage } from "../../functions/villages";
import { toast } from "sonner";

export default function AssignModeratorToVillages() {
    const [country, setCountry] = useState("india");

    const result = useQueries({
        queries: [
            { queryKey: ["villages"], queryFn: fetchVillages },
            {
                queryKey: ["moderators_approved"],
                queryFn: getAllApprovedModerators,
            },
        ],
    });

    const [villages, moderators] = result;

    const { mutate, isPending } = useMutation({
        mutationFn: addModeratorToVillage,
        onSuccess: (data) => {
            villages.refetch();
            toast.success(data.message);
        },
    });

    const moderator_options = useMemo(
        () =>
            moderators.data
                ?.filter(
                    (_moderator) => _moderator.country.toLowerCase() === country
                )
                .map((_moderator) => ({
                    label: `${_moderator.first_name} ${_moderator.last_name}`,
                    value: _moderator._id,
                })),
        [moderators, country]
    );

    if (villages.isLoading || moderators.isLoading)
        return <Loading isLoading />;

    return (
        <Wrapper>
            <Loading isLoading={isPending} />
            <Stack justifyContent="flex-end" style={{ marginBottom: 40 }}>
                <Select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                        marginLeft: "auto",
                        width: 200,
                        background: "#fff",
                    }}
                    size="small"
                >
                    <MenuItem value="india">India</MenuItem>
                    <MenuItem value="bhutan">Bhutan</MenuItem>
                    <MenuItem value="malaysia">Malaysia</MenuItem>
                </Select>
            </Stack>
            <Stack
                direction="column"
                spacing={10}
                style={{
                    padding: 200,
                    paddingTop: 50,
                    background: "#fff",
                    borderRadius: 20,
                    color: "#000",
                }}
            >
                {villages.data
                    ?.filter(
                        (_village) => _village.country.toLowerCase() === country
                    )
                    .map((_village) => (
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            key={_village._id}
                        >
                            <h4
                                style={{
                                    color: "#000",
                                    textTransform: "capitalize",
                                    width: 200,
                                }}
                            >
                                {_village.name}
                            </h4>
                            <span style={{ color: "#000" }}>
                                ---------------
                            </span>
                            <ReactSelect
                                options={moderator_options}
                                onChange={(value) => {
                                    mutate({
                                        village_id: _village._id,
                                        moderator_id: value.value,
                                    });
                                }}
                                value={
                                    _village.moderator_id
                                        ? moderator_options.find(
                                              (_moderator) =>
                                                  _moderator.value ===
                                                  _village.moderator_id
                                          )
                                        : null
                                }
                                styles={{
                                    control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        width: "300px",
                                    }),
                                }}
                            />
                        </Stack>
                    ))}
            </Stack>
        </Wrapper>
    );
}
