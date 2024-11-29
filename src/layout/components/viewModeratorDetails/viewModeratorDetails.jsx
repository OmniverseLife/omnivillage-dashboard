/* eslint-disable no-unsafe-optional-chaining */
import styled from "@emotion/styled";
import { Button, Modal, Stack } from "@mui/material";
import moment from "moment";
import React from "react";
import { mediaURL } from "../../../axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeModeratorStatus } from "../../../functions/moderator";
import { queryClient } from "../../../main";

const StyledRow = styled(Stack)`
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #eee;
    p,
    a {
        width: 200px;
        padding: 10px;
        width: 50%;
        text-transform: capitalize;
        word-break: break-all;
        /* border-bottom: 1px solid #eee; */
    }
    h2 {
        width: 100%;
        padding: 20px 10px;
        text-transform: capitalize;
        /* border-bottom-color: #ccc; */
    }
    h3 {
        width: 100%;
        padding: 12px 10px;
        text-transform: capitalize;
        /* border-bottom-color: #ccc; */
        /* border-bottom: 1px solid #eee; */
    }
`;

function ViewModeratorDetails({ open, setOpen, data, heading }) {
    const { mutate, isPending } = useMutation({
        mutationFn: changeModeratorStatus,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["moderator"] });
            setOpen(false);
            toast.success(data.message);
        },
    });

    return (
        // <Stack>
        <Modal open={open} className="modal">
            <Stack
                width="auto"
                minWidth="40vw"
                bgcolor={"#fff"}
                borderRadius={1}
                padding={2}
                color={"#000"}
                maxHeight="90vh"
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    borderBottom={"1px solid #333"}
                    paddingBottom={1}
                >
                    <h3>{heading} Details</h3>
                    <i
                        className="fa-solid fa-xmark actionIcon"
                        style={{ fontSize: 25 }}
                        onClick={() => setOpen()}
                    ></i>
                </Stack>
                <Stack
                    margin="20px 0"
                    direction="column"
                    sx={{
                        overflowY: "scroll",
                    }}
                >
                    {Object.entries(data).map((_data) => {
                        return (
                            <StyledRow
                                direction="row"
                                key={_data[0]}
                                alignItems="center"
                            >
                                <p>{_data[0].replaceAll("_", " ")}</p>
                                {_data[0] === "address_proof" ||
                                _data[0] === "officer_proof" ? (
                                    <a
                                        href={mediaURL + _data[1]}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open
                                        <i
                                            className="fa-solid fa-arrow-up-right-from-square"
                                            style={{ marginLeft: 10 }}
                                        ></i>
                                    </a>
                                ) : (
                                    <p>
                                        {_data[0] === "createdAt" ||
                                        _data[0] === "updatedAt" ||
                                        _data[0] === "month_planted" ||
                                        _data[0] === "month_harvested"
                                            ? moment(_data[1]).format(
                                                  "dddd, DD MMM YYYY hh:mm a"
                                              )
                                            : _data[1]?.toString()}
                                    </p>
                                )}
                            </StyledRow>
                        );
                    })}
                </Stack>
                <Stack spacing={2} direction="row" alignSelf="flex-end">
                    <Button
                        variant="contained"
                        color="warning"
                        style={{ outline: "none" }}
                        onClick={() =>
                            mutate({ status: 2, moderator_id: data._id })
                        }
                        disabled={isPending || data.status === 2}
                    >
                        {data.status === 2 ? "Rejected" : "Reject"}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        style={{ outline: "none" }}
                        onClick={() =>
                            mutate({ status: 1, moderator_id: data._id })
                        }
                        disabled={isPending || data.status === 1}
                    >
                        {data.status === 1 ? "Approved" : "Approve"}
                    </Button>
                </Stack>
            </Stack>
        </Modal>
        // {/* </Stack> */}
    );
}

export default ViewModeratorDetails;
