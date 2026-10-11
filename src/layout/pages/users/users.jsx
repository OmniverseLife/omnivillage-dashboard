import {
    FormControl,
    InputLabel,
    ListSubheader,
    Menu,
    MenuItem,
    Select,
    Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { endpoints } from "../../../axios/endpoints";
import { fetchVillages } from "../../../functions/others";
import {
    deleteUser,
    downloadUserData,
    fetchAllUsers,
} from "../../../functions/users";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import Loading from "../../components/loading";
import ViewDetails2 from "../../components/viewDetails2/viewDetails2";
import Wrapper from "../../components/wrapper/wrapper";
import "./users.css";
import DeleteModal from "../../components/deleteModal/deleteModal";

function Users() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedrow, setSelectedrow] = useState(null);
    const [modalOpen, setmodalOpen] = useState(false);
    const [modalData, setmodalData] = useState({});
    const [deleteModal, setDeleteModal] = useState(false);
    // Which village's users are listed: in the address (`village`), so a
    // filtered list can be sent as a link and Back brings it back.
    const [searchParams, setSearchParams] = useSearchParams();
    const village = searchParams.get("village") || "";
    const { data: villages = [] } = useQuery({
        queryKey: ["villages"],
        queryFn: fetchVillages,
    });
    const {
        data: users = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["users"],
        queryFn: fetchAllUsers,
    });

    const { mutate, isPending } = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            refetch();
        },
    });

    const selectData = (data) => {
        let obj = data;
        setmodalData(obj);
    };
    const rows = users.map((_user, idx) => ({
        id: idx + 1,
        user_id: _user._id,
        name: `${_user.first_name} ${_user.last_name}`,
        phone: `${_user.country_code} ${_user.phone}`,
        country: _user.country,
        // As the user typed it at registration; a village is matched on it
        // without regard to case.
        village: _user.village_name || "",
        // An account that has not finished its profile has no land unit
        // yet: without the fallback one such user blanked the whole page.
        totalLand: `${_user.total_land ?? ""} ${(
            _user.land_measurement_symbol ||
            _user.land_measurement ||
            ""
        ).replace("-", "")}`.trim(),
    }));

    // A user belongs to the village whose name they registered with.
    const key = (name) => String(name || "").trim().toLowerCase();
    const countIn = (name) =>
        rows.filter((row) => key(row.village) === key(name)).length;
    // `id` stays the user's place in the whole list (the row menu looks the
    // user up by it); the number shown counts the rows on screen.
    const shown = rows
        .filter((row) => !village || key(row.village) === key(village))
        .map((row, index) => ({ ...row, sno: index + 1 }));
    // The villages of each country, countries and villages both A to Z: the
    // list is read to find one name.
    const byName = (a, b) => key(a).localeCompare(key(b));
    const byCountry = Object.entries(
        [...villages]
            .sort((a, b) => byName(a.name, b.name))
            .reduce((groups, entry) => {
                const country = entry.country || "";
                return {
                    ...groups,
                    [country]: [...(groups[country] || []), entry],
                };
            }, {})
    ).sort(([a], [b]) => byName(a, b));

    const columns = [
        { field: "sno", headerName: "S.NO", width: 100 },
        { field: "user_id", headerName: "_id", width: 250 },
        { field: "name", headerName: "Name", width: 250 },
        { field: "phone", headerName: "Phone", width: 200 },
        { field: "country", headerName: "Country", width: 150 },
        {
            field: "village",
            headerName: "Village",
            width: 180,
            cellClassName: "capitalised",
        },
        {
            field: "totalLand",
            headerName: "Total Land",
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

                                selectData(users[params.row.id - 1]);
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
                            <MenuItem
                                onClick={() => {
                                    setAnchorEl(null);
                                    setSelectedrow(null);
                                }}
                            >
                                <Link
                                    to={`${process.env.REACT_APP_BASE_URL}/api${
                                        endpoints.user.download
                                    }?user_id=${
                                        rows[selectedrow - 1]?.user_id
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
                            <MenuItem
                                onClick={() => {
                                    setAnchorEl(null);
                                    setDeleteModal(true);
                                }}
                            >
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
                            </MenuItem>
                        </Menu>
                    </div>
                );
            },
        },
    ];

    return (
        // `plain`: this page keeps its own filter in the address, and must
        // not be handed the dashboards' default country and village.
        <Wrapper plain title="Users">
            <div className="users">
                <Stack direction="row" sx={{ marginBottom: "20px" }}>
                    <FormControl size="small" sx={{ marginLeft: "auto" }}>
                        <InputLabel id="users-village-label" shrink>
                            Village
                        </InputLabel>
                        <Select
                            labelId="users-village-label"
                            label="Village"
                            notched
                            displayEmpty
                            value={village}
                            onChange={(event) => {
                                const next = new URLSearchParams(searchParams);
                                if (event.target.value)
                                    next.set("village", event.target.value);
                                else next.delete("village");
                                setSearchParams(next);
                            }}
                            // Shown also for a village named in the address
                            // that is not in the list (deleted since).
                            renderValue={(value) =>
                                value ? (
                                    <span style={{ textTransform: "capitalize" }}>
                                        {value} ({countIn(value)})
                                    </span>
                                ) : (
                                    `All villages (${rows.length})`
                                )
                            }
                            sx={{ width: 280 }}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 420 } } }}
                        >
                            <MenuItem value="">
                                All villages ({rows.length})
                            </MenuItem>
                            {byCountry.flatMap(([country, list]) => [
                                <ListSubheader
                                    key={`country-${country}`}
                                    sx={{ textTransform: "capitalize" }}
                                >
                                    {country}
                                </ListSubheader>,
                                ...list.map((entry) => (
                                    <MenuItem
                                        key={entry._id}
                                        value={entry.name}
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {entry.name} ({countIn(entry.name)})
                                    </MenuItem>
                                )),
                            ])}
                        </Select>
                    </FormControl>
                </Stack>
                <DataGrid
                    rows={shown}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    columnVisibilityModel={{
                        user_id: false,
                    }}
                    pageSizeOptions={[5, 10]}
                    // A clicked row would be "selected", and EXPORT then
                    // downloads the selected rows only: the list on screen
                    // (a village's users) is what it must download.
                    disableRowSelectionOnClick
                    slots={{ toolbar: CustomToolbar }}
                    slotProps={{
                        toolbar: {
                            printOptions: { disableToolbarButton: true },
                        },
                    }}
                    loading={isLoading}
                />
                <Loading isLoading={isLoading || isPending} />
                {selectedrow && (
                    <>
                        <ViewDetails2
                            open={modalOpen}
                            setOpen={() => setmodalOpen(false)}
                            data={modalData}
                            heading="User"
                        />
                        <DeleteModal
                            open={deleteModal}
                            onAgree={() => {
                                mutate(modalData._id);
                                setDeleteModal(false);
                                setmodalData({});
                            }}
                            setOpen={() => setDeleteModal(false)}
                        />
                    </>
                )}
            </div>
        </Wrapper>
    );
}

export default Users;
