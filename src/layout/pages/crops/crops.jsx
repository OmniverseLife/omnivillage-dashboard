import React, { useState } from "react";
import "./crops.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Button,
  Chip,
  Modal,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

const rows = [
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
  {
    Engname: "Gobi Flower",
    Malyname: "Gabi Flawera",
    country: "India",
    label: "Vegetables",
  },
];

const Row = ({ row, index }) => {
  const [menu, setmenu] = useState(false);
  return (
    <>
      <TableRow
        key={row.name}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {index + 1}
        </TableCell>
        <TableCell align="right">{row.Engname}</TableCell>
        <TableCell align="right">{row.Malyname}</TableCell>
        <TableCell align="right">{row.country}</TableCell>
        <TableCell align="right">{row.label}</TableCell>
        <TableCell align="right" style={{ position: "relative" }}>
          {/* <i class="fa-solid fa-eye actionIcon"></i>
          <i class="fa-solid fa-pen-to-square actionIcon"></i>
          <i class="fa-solid fa-trash actionIcon"></i> */}
          <i
            class="fa-solid fa-ellipsis actionIcon"
            style={{ fontSize: 25, marginLeft: 15 }}
            onClick={() => setmenu(!menu)}
          ></i>
          {menu && (
            <div
              className="menu"
              // style={{ transform: `translateY(${index * 60}px)` }}
            >
              <p>View</p>
              <p>Delete</p>
            </div>
          )}
        </TableCell>
      </TableRow>
    </>
  );
};

function Crops() {
  const [open, setopen] = useState(false);
  const [country, setcountry] = useState("india");
  const [selectedLabel, setselectedLabel] = useState("");
  const labels = [
    "Grains & Nuts",
    "Vegetables",
    "Herbs",
    "Legumes",
    "Fruits",
    "Dairy",
    "Meat",
    "Spices & Condiments",
    "Tea/Coffee",
    "Oils",
    "Processed food & beverages",
    "Alcohol/Tobacco",
  ];

  const handleChange = (event, newcountry) => {
    setcountry(newcountry);
  };
  return (
    <div className="Crops">
      <Button
        variant="contained"
        className="ModalOpeningButtton"
        onClick={() => setopen(true)}
      >
        Add Crop
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell align="right">English Name</TableCell>
              <TableCell align="right">Malay Name</TableCell>
              <TableCell align="right">Country</TableCell>
              <TableCell align="right">Label</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              return <Row row={row} index={index} key={row} />;
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={open} className="modal">
        <Stack
          width={500}
          bgcolor={"#fff"}
          borderRadius={1}
          padding={2}
          color={"#000"}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={"1px solid #333"}
            paddingBottom={1}
          >
            <h3>Add Crop</h3>
            <i
              class="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => setopen(false)}
            ></i>
          </Stack>
          <Stack>
            <h3 style={{ margin: "10px 0" }}>Name :</h3>
            <Stack spacing={2} direction="row" justifyContent="space-between">
              <TextField
                id="outlined-basic"
                label="Name In English"
                variant="outlined"
                size="small"
                style={{ width: "48%" }}
              />
              <TextField
                id="outlined-basic"
                label="Name In Malay"
                size="small"
                style={{ width: "48%" }}
                variant="outlined"
              />
            </Stack>
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select Country :</h3>
            <ToggleButtonGroup
              color="info"
              value={country}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton value="india" style={{ outline: "none" }}>
                India
              </ToggleButton>
              <ToggleButton value="malaysia" style={{ outline: "none" }}>
                Malaysia
              </ToggleButton>
              <ToggleButton value="nepal" style={{ outline: "none" }}>
                Nepal
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select label :</h3>
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="flex-start"
              spacing={2}
            >
              {labels.map((item, id) => (
                <Chip
                  style={{
                    margin: "5px 10px 5px 0",
                    background: item === selectedLabel && "#0080ff",
                    color: item === selectedLabel && "#fff",
                  }}
                  key={item}
                  label={item}
                  variant="contained"
                  onClick={() => setselectedLabel(item)}
                />
              ))}
            </Stack>
          </Stack>
          <Stack spacing={2} direction="row" alignSelf="flex-end" marginTop={3}>
            <Button
              color="warning"
              style={{ outline: "none" }}
              onClick={() => setopen(false)}
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
            >
              add
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </div>
  );
}

export default Crops;
