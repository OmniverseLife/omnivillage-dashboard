import React, { useMemo, useState } from "react";
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
import { deletePoultry, fetchPoultry } from "../../../functions/production";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import ViewDetails from "../../components/viewDetails/viewDetails";
import Wrapper from "../../components/wrapper/wrapper";
import CsvDownload from "react-json-to-csv";

function Poultry() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalData, setmodalData] = useState({});
  const [modalOpen, setmodalOpen] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["poultry"],
    queryFn: fetchPoultry,
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
      return { jsonData: data, poultry: arr };
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
    data?.poultry?.map((_poultry, index) => ({
      id: index + 1,
      _id: _poultry._id,
      name: `${_poultry.first_name} ${_poultry.last_name}`,
      phone: `${_poultry.country_code} ${_poultry.phone}`,
      data: _poultry,
      // crop_name: _poultry.crop.name.en,
      // date: moment(_poultry.created_at).format("ll"),
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
                // selectData(poultry[params.row.id]);
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

  const convertProductToRecord = (obj, product) => {
    return {
      ...obj,
      product_id: product._id,
      product_name: product.name,
      product_output: product.production_output,
      product_self_consumed: product.self_consumed,
      product_sold_to_neighbours: product.sold_to_neighbours,
      product_sold_for_industrial_use: product.sold_for_industrial_use,
      product_wastage: product.wastage,
      product_other: product.other,
      product_other_value: product.other_value,
      product_month_harvested: product.month_harvested,
      product_processing_method: product.processing_method,
    };
  };

  const converted_records = useMemo(
    () =>
      data?.jsonData
        ?.map((_data) =>
          _data.products.map((_product) => {
            return convertProductToRecord(_data, _product);
          })
        )
        .flat(),
    [data?.jsonData]
  );

  const headers = [
    {
      name: "__id",
      label: "ID",
    },
    {
      name: "_user_id",
      label: "User ID",
    },
    {
      name: "_cropnameen",
      label: "Poultry Name",
    },
    {
      name: "_label_name",
      label: "Label",
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
      name: "_number",
      label: "Number of Animals",
    },
    {
      name: "_avg_age_of_live_stocks",
      label: "Average age of Livestocks",
    },
    {
      name: "_avg_age_time_period",
      label: "Average Time Period",
    },
    {
      name: "_type_of_feed",
      label: "Type of Feed",
    },
    {
      name: "_other_type_of_feed",
      label: "Other type of Feed",
    },
    {
      name: "_weight_measurement",
      label: "Weight Measurement",
    },
    {
      name: "_personal_informationtotal_feed",
      label: "Total Feed",
    },
    {
      name: "_personal_informationself_produced",
      label: "Self Produced Feed",
    },
    {
      name: "_personal_informationneighbours",
      label: "Feed purchased from Neighbour",
    },
    {
      name: "_personal_informationpurchased_from_market",
      label: "Feed purchased from Market",
    },
    {
      name: "_personal_informationother",
      label: "Feed from Other Source",
    },
    {
      name: "_personal_informationother_value",
      label: "Feed from Other Source Value",
    },
    {
      name: "_product_id",
      label: "Product ID",
    },
    {
      name: "_product_name",
      label: "Product Name",
    },
    {
      name: "_product_output",
      label: "Product Output",
    },
    {
      name: "_product_self_consumed",
      label: "Product Seld Consumed",
    },
    // {
    //   name: "_product_fed_to_livestock",
    //   label: "Product Fed to Livestock",
    // },
    {
      name: "_product_sold_to_neighbours",
      label: "Sold to Neighbour",
    },
    {
      name: "_product_sold_for_industrial_use",
      label: "Sold for Industrial Use",
    },
    {
      name: "_product_wastage",
      label: "Product Wastage",
    },
    {
      name: "_product_other",
      label: "Product Other",
    },
    {
      name: "_product_other_value",
      label: "Product Other Value",
    },
    {
      name: "_product_month_harvested",
      label: "Product Month Harvested",
    },
    {
      name: "_product_processing_method",
      label: "Product Processing Method",
    },
    {
      name: "_steroids",
      label: "Steroids used",
    },
    {
      name: "_usercurrency",
      label: "User Currency",
    },
    {
      name: "_income_from_sale",
      label: "Income from Sale",
    },
    {
      name: "_expenditure_on_inputs",
      label: "Expenditure on Inputs",
    },
  ];

  return (
    <Wrapper>
      <CsvDownload
        data={converted_records?.map((_data) => {
          const flatten_obj = deepFlattenToObject(_data, "_");
          const obj = {};
          headers.forEach((_header) => {
            if (_header.name === "_product_month_harvested")
              obj[_header.name] = moment(flatten_obj[_header.name]).format(
                "DD MMMM, YYYY"
              );
            else obj[_header.name] = flatten_obj[_header.name];
          });
          return obj;
        })}
        headers={headers.map((_header) => _header.label)}
        // headers={Object.keys(deepFlattenToObject(data?.jsonData[0] || {}, "_"))}
        delimiter=","
        filename="Poultry"
      />
      <Production
        rows={rows}
        columns={columns}
        isLoading={isLoading}
        refetch={refetch}
        setDeleteId={setDeleteId}
        deleteFn={deletePoultry}
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
        heading="Poultry"
      />
    </Wrapper>
  );
}

export default Poultry;
