import { useState } from "react";

import { Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Dropdown from "./dropdown";
import { getModeratorDropdownValues } from "../../../functions/moderator-dropdown";
import { bulkUploadCultivationCrops } from "../../../functions/crops";
import { business_officer_types } from "../../../helper/constants";

function BusinessOfficerDropdown() {
    const [selectedRow, setSelectedRow] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const {
        data: dropdown = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["business_officer_dropdowns"],
        queryFn: () => getModeratorDropdownValues("business"),
    });

    const rows = dropdown.map((_dropdown, index) => ({
        id: index + 1,
        dropdown_id: _dropdown._id,
        eng_name: _dropdown.name.en,
        malay_name: _dropdown.name.ms,
        dz_name: _dropdown.name.dz,
        type: _dropdown.type,
        status: _dropdown.status ? "Approved" : "Pending",
    }));

    const columns = [
        { field: "id", headerName: "S.NO", width: 70 },
        { field: "dropdown_id", headerName: "Dropdown ID", width: 120 },
        { field: "eng_name", headerName: "English Name", width: 300 },
        { field: "malay_name", headerName: "Malay Name", width: 300 },
        { field: "dz_name", headerName: "Dzongkha Name", width: 300 },
        {
            field: "type",
            headerName: "Type",
            width: 280,
            renderCell: (params) => (
                <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                >
                    {business_officer_types[params.row.type]}
                </Typography>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            width: 100,
        },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            disableClickEventBubbling: true,
            width: 80,
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
                                setSelectedRow(params.row.id);
                                setAnchorEl(e.currentTarget);
                            }}
                            id={params.row.id}
                        ></i>
                        <Menu
                            anchorEl={anchorEl}
                            open={
                                selectedRow === params.row.id &&
                                Boolean(anchorEl)
                            }
                            onClose={() => {
                                setAnchorEl(null);
                                setSelectedRow(null);
                            }}
                            // anchorOrigin={{}}
                        >
                            <MenuItem
                                onClick={() => {
                                    setEditItem(params.row);
                                    setAnchorEl(null);
                                }}
                            >
                                <Stack direction="row" alignItems="center">
                                    <i
                                        className="fa-regular fa-file"
                                        style={{ marginRight: 10 }}
                                    ></i>
                                    Edit
                                </Stack>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    setDeleteId(params.row.dropdown_id);
                                    setAnchorEl(null);
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
        // <Wrapper>
        <Dropdown
            dropdown_type="business"
            rows={rows}
            columns={columns}
            types={business_officer_types}
            isLoading={isLoading}
            editItem={editItem}
            setEdit={setEditItem}
            refetch={refetch}
            setDeleteId={setDeleteId}
            deleteId={deleteId}
            sectionName="Business Officer Dropdown"
            bulkUploadFn={bulkUploadCultivationCrops}
        />
        // </Wrapper>
    );
}

export default BusinessOfficerDropdown;
