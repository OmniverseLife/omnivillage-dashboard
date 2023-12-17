import React, { useState } from "react";
import Production from "./production";
import { Menu, MenuItem, Stack } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteCultivation,
  fetchCultivations,
} from "../../../functions/production";
import { toast } from "sonner";
import moment from "moment";
import ViewDetails from "../../components/viewDetails/viewDetails";

function Cultivation() {
  const [selectedrow, setSelectedrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalData, setmodalData] = useState({});
  const [modalOpen, setmodalOpen] = useState(false);
  const {
    data: cultivations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cultivations"],
    queryFn: fetchCultivations,
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
    console.log(obj);
    setmodalData({ ...obj });
  };
  const rows = cultivations.map((_cultivation, index) => ({
    id: index + 1,
    _id: _cultivation._id,
    name: `${_cultivation.user.first_name} ${_cultivation.user.last_name}`,
    phone: `${_cultivation.user.country_code} ${_cultivation.user.phone}`,
    crop_name: _cultivation.crop.name.en,
    date: moment(_cultivation.created_at).format("ll"),
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
                selectData(cultivations[params.row.id]);
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
              {/* <MenuItem
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
                  ></i>
                  Delete
                </Stack>
              </MenuItem> */}
            </Menu>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <Production
        rows={rows}
        columns={columns}
        isLoading={isLoading}
        refetch={refetch}
        setDeleteId={setDeleteId}
        deleteFn={deleteCultivation}
        deleteId={deleteId}
      />
      {selectedrow && (
        <ViewDetails
          open={modalOpen}
          setOpen={() => setmodalOpen(false)}
          data={modalData}
          heading="Cultivation"
        />
      )}
    </div>
  );
}

export default Cultivation;
