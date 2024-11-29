import { Menu, MenuItem, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getAllModerators } from "../../../functions/moderator";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import Loading from "../../components/loading";
import ViewModeratorDetails from "../../components/viewModeratorDetails/viewModeratorDetails";
import Wrapper from "../../components/wrapper/wrapper";
import "./moderator.css";
import { useEffect } from "react";

function Moderators() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedrow, setSelectedrow] = useState(null);
    const [modalOpen, setmodalOpen] = useState(false);
    const [modalData, setmodalData] = useState({});
    const { data: moderators = [], isLoading } = useQuery({
        queryKey: ["moderator"],
        queryFn: getAllModerators,
    });

    const selectData = (data) => {
        setmodalData(data);
    };

    const rows = moderators.map((_moderator, idx) => ({
        id: idx + 1,
        moderator_id: _moderator._id,
        name: `${_moderator.first_name} ${_moderator.last_name}`,
        phone: `${_moderator.country_code} ${_moderator.phone}`,
        country: _moderator.country,
        status:
            _moderator.status === 0
                ? "Pending"
                : _moderator.status === 1
                ? "Approved"
                : "Rejected",
    }));

    const columns = [
        { field: "id", headerName: "S.NO", width: 100 },
        { field: "moderator_id", headerName: "_id", width: 250 },
        { field: "name", headerName: "Name", width: 250 },
        { field: "phone", headerName: "Phone", width: 200 },
        { field: "country", headerName: "Country", width: 150 },
        {
            field: "status",
            headerName: "Status",
            width: 180,
        },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            disableClickEventBubbling: true,
            width: 180,
            renderCell: (params) => {
                return (
                    <div>
                        <i
                            className="fa-solid fa-ellipsis-vertical actionIcon"
                            style={{
                                fontSize: 25,
                                marginLeft: 15,
                                paddingInline: 10,
                            }}
                            onClick={(e) => {
                                setSelectedrow(params.row.id);
                                setAnchorEl(e.currentTarget);

                                selectData(moderators[params.row.id - 1]);
                            }}
                            id={params.row.id}
                        ></i>
                        <Menu
                            anchorEl={anchorEl}
                            open={
                                selectedrow === params.row.id &&
                                Boolean(anchorEl)
                            }
                            onClose={() => {
                                setAnchorEl(null);
                                setSelectedrow(null);
                            }}
                            // anchorOrigin={{}}
                        >
                            <MenuItem
                                onClick={() => {
                                    setAnchorEl(null);
                                    setmodalOpen(true);
                                }}
                            >
                                <Stack direction="row" alignItems="center">
                                    <i
                                        className="fa-regular fa-file-lines"
                                        style={{ marginRight: 10 }}
                                    ></i>
                                    View Detail
                                </Stack>
                            </MenuItem>
                            {/* <MenuItem
                                onClick={() => {
                                    setAnchorEl(null);
                                    setSelectedrow(null);
                                }}
                            >
                                <Link
                                    to={`${process.env.REACT_APP_BASE_URL}/api${
                                        endpoints.user.download
                                    }?moderator_id=${
                                        rows[selectedrow - 1]?.moderator_id
                                    }`}
                                    style={{ color: "#333" }}
                                >
                                    <Stack direction="row" alignItems="center">
                                        <i
                                            className="fa-solid fa-file-arrow-down"
                                            style={{ marginRight: 10 }}
                                        ></i>
                                        Download Data
                                    </Stack>
                                </Link>
                            </MenuItem>
                            <MenuItem onClick={() => setAnchorEl(null)}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    sx={{ color: "#f45536" }}
                                >
                                    <i
                                        className="fa-regular fa-trash-can"
                                        style={{ marginRight: 10 }}
                                    ></i>{" "}
                                    Delete
                                </Stack>
                            </MenuItem> */}
                        </Menu>
                    </div>
                );
            },
        },
    ];

    return (
        <Wrapper>
            <div className="users">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    columnVisibilityModel={{
                        moderator_id: false,
                    }}
                    pageSizeOptions={[5, 10]}
                    slots={{ toolbar: CustomToolbar }}
                    slotProps={{
                        toolbar: {
                            printOptions: { disableToolbarButton: true },
                        },
                    }}
                    loading={isLoading}
                />
                <Loading isLoading={isLoading} />
                {selectedrow && (
                    <ViewModeratorDetails
                        open={modalOpen}
                        setOpen={() => setmodalOpen(false)}
                        data={modalData}
                        heading="Moderator"
                    />
                )}
            </div>
        </Wrapper>
    );
}

export default Moderators;
