import React, { useState } from "react";
import "./users.css";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers } from "../../../functions/users";
import Loading from "../../components/loading";
import { Menu, MenuItem, Stack } from "@mui/material";
import ViewDetails from "../../components/viewDetails/viewDetails";
import Wrapper from "../../components/wrapper/wrapper";

function Users() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedrow, setSelectedrow] = useState(null);
  const [modalOpen, setmodalOpen] = useState(false);
  const [modalData, setmodalData] = useState({});
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
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
    delete obj["updatedAt"];
    delete obj["__v"];
    delete obj["_id"];

    console.log(obj);
    setmodalData({ ...obj });
  };
  const rows = users.map((_user, idx) => ({
    id: idx + 1,
    name: `${_user.first_name} ${_user.last_name}`,
    phone: `${_user.country_code} ${_user.phone}`,
    country: _user.country,
    totalLand: `${_user.total_land} ${(
      _user.land_measurement_symbol || _user.land_measurement
    ).replace("-", "")}`,
  }));

  const columns = [
    { field: "id", headerName: "S.NO", width: 100 },
    { field: "name", headerName: "Name", width: 250 },
    { field: "phone", headerName: "Phone", width: 200 },
    { field: "country", headerName: "Country", width: 150 },
    {
      field: "totalLand",
      headerName: "Total Land",
      width: 180,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      disableClickEventBubbling: true,
      width: 180,
      renderCell: (params) => {
        return (
          <div>
            <i
              className="fa-solid fa-ellipsis-vertical actionIcon"
              style={{ fontSize: 25, marginLeft: 15, paddingInline: 10 }}
              onClick={(e) => {
                setSelectedrow(params.row.id);
                setAnchorEl(e.currentTarget);

                selectData(users[params.row.id - 1]);
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
              <MenuItem onClick={() => setAnchorEl(null)}>
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
  console.log(selectedrow);
  return (
    <Wrapper>
      <div className="users">
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          // columnVisibilityModel={{
          //   totalLand: false,
          // }}
          pageSizeOptions={[5, 10]}
          loading={isLoading}
        />
        <Loading isLoading={isLoading} />
        {selectedrow && (
          <ViewDetails
            open={modalOpen}
            setOpen={() => setmodalOpen(false)}
            data={modalData}
            heading="User"
          />
        )}
      </div>
    </Wrapper>
  );
}

export default Users;
