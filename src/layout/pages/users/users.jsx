import React, { useState } from "react";
import "./users.css";
import { DataGrid } from "@mui/x-data-grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { downloadUserData, fetchAllUsers } from "../../../functions/users";
import Loading from "../../components/loading";
import { Menu, MenuItem, Stack } from "@mui/material";
import ViewDetails from "../../components/viewDetails/viewDetails";
import Wrapper from "../../components/wrapper/wrapper";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import ViewDetails2 from "../../components/viewDetails2/viewDetails2";
import { Link } from "react-router-dom";
import { endpoints } from "../../../axios/endpoints";

function Users() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedrow, setSelectedrow] = useState(null);
  const [modalOpen, setmodalOpen] = useState(false);
  const [modalData, setmodalData] = useState({});
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: downloadUserData,
  });

  const selectData = (data) => {
    // let obj = deepFlattenToObject(data);
    let obj = data;
    // delete obj["members"];
    // delete obj["__v"];
    // delete obj["_id"];

    console.log(obj);
    setmodalData(obj);
  };
  const rows = users.map((_user, idx) => ({
    id: idx + 1,
    user_id: _user._id,
    name: `${_user.first_name} ${_user.last_name}`,
    phone: `${_user.country_code} ${_user.phone}`,
    country: _user.country,
    totalLand: `${_user.total_land} ${(
      _user.land_measurement_symbol || _user.land_measurement
    ).replace("-", "")}`,
  }));

  const columns = [
    { field: "id", headerName: "S.NO", width: 100 },
    { field: "user_id", headerName: "_id", width: 250 },
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
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setSelectedrow(null);
                }}
              >
                <Link
                  to={`${process.env.REACT_APP_BASE_URL}/api${
                    endpoints.user.download
                  }?user_id=${rows[selectedrow - 1]?.user_id}`}
                  style={{ color: "#333" }}
                >
                  <Stack direction="row" alignItems="center">
                    <i
                      className="fa-solid fa-file-arrow-down"
                      style={{ marginRight: 10 }}
                    ></i>
                    Download Data
                  </Stack>
                </Link>
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
          columnVisibilityModel={{
            user_id: false,
          }}
          pageSizeOptions={[5, 10]}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            toolbar: { printOptions: { disableToolbarButton: true } },
          }}
          loading={isLoading}
        />
        <Loading isLoading={isLoading || isPending} />
        {selectedrow && (
          <ViewDetails2
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
