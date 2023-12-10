import React, { useState } from "react";
import "./users.css";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers } from "../../../functions/users";
import Loading from "../../components/loading";
import { Menu, MenuItem, Stack } from "@mui/material";

function Users() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedrow, setSelectedrow] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  // {
  //   id: 1,
  //   email: "johndoe@gmail.com",
  //   name: "John Doe",
  //   phone: "+91 3674689047",
  //   totalLand: 50,
  // }

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

  return (
    <div className="users">
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10]}
        loading={isLoading}
      />
      <Loading isLoading={isLoading} />
    </div>
  );
}

export default Users;
