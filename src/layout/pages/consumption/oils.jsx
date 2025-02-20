import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React, { useState } from "react";
import { fetchGrains, fetchOils } from "../../../functions/consumption";
import { deleteCultivation } from "../../../functions/production";
import Consumption from "./consumption";
import ViewDetails from "../../components/viewDetails/viewDetails";
import Wrapper from "../../components/wrapper/wrapper";
import CsvDownload from "react-json-to-csv";

function Oils() {
    const [selectedrow, setSelectedrow] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [modalData, setmodalData] = useState({});
    const [modalOpen, setmodalOpen] = useState(false);
    const [optionsModal, setOptionsModal] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["oils"],
        queryFn: fetchOils,
        select: (data) => {
            const obj = {};
            data.forEach((_data) => {
                if (_data.user) {
                    obj[_data.user._id] = [
                        ...(obj[_data.user._id] || []),
                        _data,
                    ];
                }
            });
            const arr = [];
            Object.entries(obj).forEach((_data) => {
                arr.push({
                    ..._data[1][0].user,
                    entries: _data[1],
                });
            });
            return { jsonData: data, oils: arr };
        },
    });

    function deepFlattenToObject(obj, prefix = "#") {
        return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? prefix : "";
            if (typeof obj[k] === "object" && obj[k] !== null) {
                Object.assign(acc, deepFlattenToObject(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    }

    const selectData = (data) => {
        let obj = deepFlattenToObject(data);
        delete obj["crop_name"];
        setmodalData({ ...obj });
    };

    const rows =
        data?.oils?.map((_cultivation, index) => ({
            id: index + 1,
            _id: _cultivation._id,
            name: `${_cultivation.first_name} ${_cultivation.last_name}`,
            phone: `${_cultivation.country_code} ${_cultivation.phone}`,
            data: _cultivation,
            //   crop_name: _cultivation.crop.name.en,
            //   date: moment(_cultivation.created_at).format("ll"),
        })) || [];

    const columns = [
        { field: "id", headerName: "S.NO", width: 150 },
        { field: "_id", headerName: "Crop ID", width: 150 },
        { field: "name", headerName: "User's Name", width: 300 },
        { field: "phone", headerName: "Phone Number", width: 300 },
        // { field: "crop_name", headerName: "Crop", width: 200 },
        // {
        //   field: "date",
        //   headerName: "Date",
        //   width: 200,
        // },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            disableClickEventBubbling: true,
            width: 200,
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
                                setSelectedrow(params.row);
                                setAnchorEl(e.currentTarget);
                                // selectData(oils[params.row.id]);
                            }}
                            id={params.row.id}
                        ></i>
                        <Menu
                            anchorEl={anchorEl}
                            open={
                                selectedrow?.id === params.row.id &&
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
                                    // setmodalOpen(true);
                                    setOptionsModal(true);
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
                        </Menu>
                    </div>
                );
            },
        },
    ];

    const headers = [
        {
            label: "ID",
            name: "__id",
        },
        {
            label: "User ID",
            name: "_user_id",
        },
        {
            name: "_userfirst_name",
            label: "User First Name",
        },
        {
            name: "_userlast_name",
            label: "User Last Name",
        },
        {
            name: "_usercountry",
            label: "User Country",
        },
        {
            label: "Crop Name",
            name: "_consumption_cropname",
        },
        {
            name: "_consumption_type_name",
            label: "Label",
        },
        {
            label: "Weight Measurement",
            name: "_weight_measurement",
        },
        {
            label: "Total Quantity",
            name: "_total_quantity",
        },
        {
            label: "Purchased From Market",
            name: "_purchased_from_market",
        },
        {
            label: "Purchased From Neighbours",
            name: "_purchased_from_neighbours",
        },
        {
            label: "Self Grown",
            name: "_self_grown",
        },
    ];

    return (
        <Wrapper>
            <CsvDownload
                data={data?.jsonData?.map((_data) => {
                    const flatten_obj = deepFlattenToObject(_data, "_");
                    const obj = {};
                    headers.forEach((_header) => {
                        obj[_header.name] = flatten_obj[_header.name];
                    });
                    return obj;
                })}
                headers={headers.map((_header) => _header.label)}
                delimiter=","
                filename="Oils"
            />
            <Consumption
                rows={rows}
                columns={columns}
                isLoading={isLoading}
                refetch={refetch}
                setDeleteId={setDeleteId}
                deleteFn={deleteCultivation}
                deleteId={deleteId}
            />
            <Dialog
                onClose={() => {
                    setOptionsModal(false);
                    setSelectedrow(null);
                }}
                open={optionsModal}
            >
                <DialogTitle>Choose</DialogTitle>
                <List sx={{ pt: 0, width: "300px", height: "250px" }}>
                    {selectedrow?.data?.entries?.map((_entry) => {
                        return (
                            <ListItem disableGutters key={_entry._id}>
                                <ListItemButton
                                    onClick={() => {
                                        selectData(_entry);
                                        setmodalOpen(true);
                                    }}
                                >
                                    <ListItemText
                                        primary={_entry.consumption_crop.name}
                                        sx={{ textTransform: "capitalize" }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Dialog>
            <ViewDetails
                open={modalOpen}
                setOpen={() => setmodalOpen(false)}
                data={modalData}
                heading="Oils"
            />
        </Wrapper>
    );
}

export default Oils;
