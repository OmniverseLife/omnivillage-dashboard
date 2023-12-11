import React, { useState } from "react";
import Production from "./production";
import { Menu, MenuItem, Stack } from "@mui/material";
import {
  deleteFishery,
  fetchCultivations,
  fetchFishery,
} from "../../../functions/production";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";

function Fishery() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const {
    data: fishery = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["fishery"],
    queryFn: fetchFishery,
  });

  const rows = fishery.map((_fishery, index) => ({
    id: index + 1,
    _id: _fishery._id,
    name: `${_fishery.user.first_name} ${_fishery.user.last_name}`,
    phone: `${_fishery.country_code} ${_fishery.phone}`,
    crop_name: _fishery.crop.name.en,
    date: moment(_fishery.created_at).format("ll"),
  }));

  const columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "_id", headerName: "Crop ID", width: 150 },
    { field: "name", headerName: "User's Name", width: 200 },
    { field: "phone", headerName: "Phone Number", width: 200 },
    { field: "crop_name", headerName: "Crop", width: 200 },
    {
      field: "date",
      headerName: "Date",
      width: 200,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      disableClickEventBubbling: true,
      width: 100,
      renderCell: (params) => {
        return (
          <div>
            <i
              className="fa-solid fa-ellipsis-vertical actionIcon"
              style={{ fontSize: 25, marginLeft: 15, paddingInline: 10 }}
              onClick={(e) => {
                setSelectedrow(params.row.id);
                setAnchorEl(e.currentTarget);
              }}
              id={params.row.id}
            ></i>
            <Menu
              anchorEl={anchorEl}
              open={selectedrow === params.row.id && Boolean(anchorEl)}
              onClose={() => {
                setAnchorEl(null);
                setSelectedrow(null);
              }}
              // anchorOrigin={{}}
            >
              <MenuItem onClick={() => setAnchorEl(null)}>
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
                  setDeleteId(params.row._id);
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
    <Production
      rows={rows}
      columns={columns}
      isLoading={isLoading}
      refetch={refetch}
      setDeleteId={setDeleteId}
      deleteFn={deleteFishery}
      deleteId={deleteId}
    />
  );
}

export default Fishery;
