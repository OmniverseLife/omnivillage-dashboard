import React, { useState } from "react";
import "./users.css";
import { DataGrid } from "@mui/x-data-grid";
function Users() {
  const [menu, setmenu] = useState([]);

  const rows = [
    {
      id: 1,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 2,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 3,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 4,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 5,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 6,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 7,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 8,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 9,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
    {
      id: 10,
      email: "johndoe@gmail.com",
      name: "John Doe",
      phone: "+91 3674689047",
      totalLand: 50,
    },
  ];
  const columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Phone", width: 200 },
    {
      field: "totalLand",
      headerName: "Total Land",
      width: 200,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      disableClickEventBubbling: true,
      width: 100,
      renderCell: (params) => (
        <>
          <i
            class="fa-solid fa-ellipsis actionIcon"
            style={{ fontSize: 25, marginLeft: 15 }}
            onClick={() =>
              setmenu(
                menu.includes(params.row.id)
                  ? menu.filter((id) => id !== params.row.id)
                  : [...menu, params.row.id]
              )
            }
          ></i>
          {menu.includes(params.row.id) && (
            <div className="menu">
              <p>View</p>
              <p>Delete</p>
            </div>
          )}
        </>
      ),
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
      />
    </div>
  );
}

export default Users;
