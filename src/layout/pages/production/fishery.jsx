import React, { useState } from "react";
import Production from "./production";
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
import {
  deleteFishery,
  fetchCultivations,
  fetchFishery,
} from "../../../functions/production";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import ViewDetails from "../../components/viewDetails/viewDetails";
import Wrapper from "../../components/wrapper/wrapper";

function Fishery() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalData, setmodalData] = useState({});
  const [modalOpen, setmodalOpen] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);

  const {
    data: fishery = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["fishery"],
    queryFn: fetchFishery,
    select: (data) => {
      const obj = {};
      data.forEach((_data) => {
        obj[_data.user._id] = [...(obj[_data.user._id] || []), _data];
      });
      const arr = [];
      Object.entries(obj).forEach((_data) => {
        arr.push({
          ..._data[1][0].user,
          entries: _data[1],
        });
      });
      return arr;
    },
  });

  function deepFlattenToObject(obj, prefix = "") {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + "#" : "";
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

  const rows = fishery.map((_fishery, index) => ({
    id: index + 1,
    _id: _fishery._id,
    name: `${_fishery.first_name} ${_fishery.last_name}`,
    phone: `${_fishery.country_code} ${_fishery.phone}`,
    data: _fishery,
    // crop_name: _fishery.crop.name.en,
    // date: moment(_fishery.created_at).format("ll"),
  }));

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
              style={{ fontSize: 25, marginLeft: 15, paddingInline: 10 }}
              onClick={(e) => {
                setSelectedrow(params.row);
                setAnchorEl(e.currentTarget);
                // selectData(fishery[params.row.id]);
              }}
              id={params.row.id}
            ></i>
            <Menu
              anchorEl={anchorEl}
              open={selectedrow?.id === params.row.id && Boolean(anchorEl)}
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

  return (
    <Wrapper>
      <Production
        rows={rows}
        columns={columns}
        isLoading={isLoading}
        refetch={refetch}
        setDeleteId={setDeleteId}
        deleteFn={deleteFishery}
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
                    primary={_entry.crop.name.en}
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
        heading="Fishery"
      />
    </Wrapper>
  );
}

export default Fishery;
