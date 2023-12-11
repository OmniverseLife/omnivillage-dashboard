import React, { useState } from "react";
import Production from "./production";
import { Menu, MenuItem, Stack } from "@mui/material";
import { deleteHunting, fetchHunting } from "../../../functions/production";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

function Hunting() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const {
    data: huntings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["huntings"],
    queryFn: fetchHunting,
  });

  const rows = huntings.map((_hunting, index) => ({
    id: index + 1,
    _id: _hunting._id,
    name: `${_hunting.user.first_name} ${_hunting.user.last_name}`,
    phone: `${_hunting.country_code} ${_hunting.phone}`,
    crop_name: _hunting.crop.name.en,
    date: moment(_hunting.created_at).format("ll"),
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
      deleteFn={deleteHunting}
      deleteId={deleteId}
    />
  );
}

export default Hunting;
