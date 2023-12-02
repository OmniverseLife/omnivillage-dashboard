import React from "react";
import "./users.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const rows = [
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
  {
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  },
];

function Users() {
  return (
    <div className="users">
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell align="right">Name</TableCell>
              <TableCell align="right">Email</TableCell>
              <TableCell align="right">Phone</TableCell>
              <TableCell align="right">Total Land</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell align="right">{row.name}</TableCell>
                <TableCell align="right">{row.email}</TableCell>
                <TableCell align="right">{row.phone}</TableCell>
                <TableCell align="right">{row.totalLand} km</TableCell>
                <TableCell align="right">
                  <i class="fa-solid fa-eye actionIcon"></i>
                  <i class="fa-solid fa-pen-to-square actionIcon"></i>
                  <i class="fa-solid fa-trash actionIcon"></i>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Users;
