import React, { useState } from "react";

import { Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  addPoultryCrops,
  bulkUploadPoultryCrops,
  deletePoultryCrops,
  editPoultryCrops,
  fetchPoultryCrops,
} from "../../../functions/crops";
import Crops from "./crops";
import Wrapper from "../../components/wrapper/wrapper";

function Poultry() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const {
    data: crops = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["poultry_crop"],
    queryFn: fetchPoultryCrops,
  });

  // {
  //   id: 1,
  //   Engname: "Gobi Flower",
  //   Malyname: "Gabi Flawera",
  //   country: "India",
  //   label: "Vegetables",
  // },

  const rows = crops.map((_crop, index) => ({
    id: index + 1,
    crop_id: _crop._id,
    Engname: _crop.name.en,
    Malayname: _crop.name.ms,
    Dzname: _crop.name.dz,
    country: _crop.country.join(", "),
    label: _crop.label,
    status: _crop.status ? "Approved" : "Pending",
  }));

  const columns = [
    { field: "id", headerName: "S.NO", width: 70 },
    { field: "crop_id", headerName: "Crop ID", width: 120 },
    { field: "Engname", headerName: "English Name", width: 200 },
    { field: "Malayname", headerName: "Malay Name", width: 200 },
    { field: "Dzname", headerName: "Dzongkha Name", width: 200 },
    { field: "country", headerName: "Country", width: 200 },
    {
      field: "label",
      headerName: "Label",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
          {params.row.label?.name?.en}
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
                  setDeleteId(params.row.crop_id);
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
    <Crops
      rows={rows}
      columns={columns}
      isLoading={isLoading}
      editItem={editItem}
      setEdit={setEditItem}
      editFn={editPoultryCrops}
      refetch={refetch}
      addFn={addPoultryCrops}
      deleteFn={deletePoultryCrops}
      setDeleteId={setDeleteId}
      deleteId={deleteId}
      sectionName="Poultry Crops"
      bulkUploadFn={bulkUploadPoultryCrops}
    />
    // </Wrapper>
  );
}

export default Poultry;
