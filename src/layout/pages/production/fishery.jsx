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
import CsvDownload from "react-json-to-csv";

function Fishery() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalData, setmodalData] = useState({});
  const [modalOpen, setmodalOpen] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
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
      return { jsonData: data, fishery: arr };
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
    data?.fishery?.map((_fishery, index) => ({
      id: index + 1,
      _id: _fishery._id,
      name: `${_fishery.first_name} ${_fishery.last_name}`,
      phone: `${_fishery.country_code} ${_fishery.phone}`,
      data: _fishery,
      // crop_name: _fishery.crop.name.en,
      // date: moment(_fishery.created_at).format("ll"),
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

  const headers = [
    {
      name: "__id",
      label: "ID",
    },
    {
      name: "_fishery_type",
      label: "Fishery Type",
    },
    {
      name: "_user_id",
      label: "User ID",
    },
    {
      name: "_cropnameen",
      label: "Fish Name",
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
      name: "_important_informationnumber_of_fishes",
      label: "Number of Fishes",
    },
    {
      name: "_important_informationtype_of_feed",
      label: "Type of Feed",
    },
    {
      name: "_production_informationtotal_feed",
      label: "Total Feed",
    },
    {
      name: "_production_informationproduction_output",
      label: "Production Output",
    },
    {
      name: "_production_informationself_consumed",
      label: "Self Consumed",
    },
    {
      name: "_production_informationsold_to_neighbours",
      label: "Sold to Neighbour",
    },
    {
      name: "_production_informationsold_for_industrial_use",
      label: "Sold for Industrial Use",
    },
    {
      name: "_production_informationwastage",
      label: "Wastage",
    },
    {
      name: "_production_informationother",
      label: "Other",
    },
    {
      name: "_production_informationother_value",
      label: "Other value",
    },
    {
      name: "_usercurrency",
      label: "User Currency",
    },
    {
      name: "_production_informationincome_from_sale",
      label: "Income from Sale",
    },
    {
      name: "_production_informationexpenditure_on_inputs",
      label: "Expenditure on Inputs",
    },
    {
      name: "_processing_method",
      label: "Processing Information",
    },
    {
      name: "_production_informationyeild",
      label: "Yeild",
    },
    {
      name: "",
      label: "",
    },
  ];

  return (
    <Wrapper>
      <CsvDownload
        data={data?.jsonData?.map((_data) => {
          const flatten_obj = deepFlattenToObject(_data, "_");
          const obj = {};
          headers.forEach((_header) => {
            if (
              _header.name === "_important_informationmonth_planted" ||
              _header.name === "_important_informationmonth_harvested"
            )
              obj[_header.name] = moment(flatten_obj[_header.name]).format(
                "DD MMMM, YYYY"
              );
            else obj[_header.name] = flatten_obj[_header.name];
          });
          return obj;
        })}
        // headers={Object.keys(deepFlattenToObject(data?.jsonData[0] || {}, "_"))}
        headers={headers.map((_header) => _header.label)}
        delimiter=","
        filename="Fishery"
      />
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
