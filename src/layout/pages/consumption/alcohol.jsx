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
import { fetchAlcohol, fetchGrains } from "../../../functions/consumption";
import { deleteCultivation } from "../../../functions/production";
import Consumption from "./consumption";
import ViewDetails from "../../components/viewDetails/viewDetails";
import Wrapper from "../../components/wrapper/wrapper";
import CsvDownload from "react-json-to-csv";

function Alcohol() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalData, setmodalData] = useState({});
  const [modalOpen, setmodalOpen] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["alcohols"],
    queryFn: fetchAlcohol,
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
      return { jsonData: data, alcohols: arr };
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
  const rows = data?.alcohols?.map((_cultivation, index) => ({
    id: index + 1,
    _id: _cultivation._id,
    name: `${_cultivation.first_name} ${_cultivation.last_name}`,
    phone: `${_cultivation.country_code} ${_cultivation.phone}`,
    data: _cultivation,
    // crop_name: _cultivation.consumption_crop.name,
    // date: moment(_cultivation.created_at).format("ll"),
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
                // selectData(alcohols[params.row.id]);
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
      <CsvDownload
        data={data?.jsonData?.map((_data) => deepFlattenToObject(_data, "_"))}
        headers={Object.keys(deepFlattenToObject(data?.jsonData[0] || {}, "_"))}
        delimiter=","
        filename="Alcohols"
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
        heading="Alcohols"
      />
    </Wrapper>
  );
}

export default Alcohol;
