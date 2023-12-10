import React, { useState } from "react";
import "./crops.css";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Chip,
  Modal,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
function Crops() {
  const [menu, setmenu] = useState([]);
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
  const rows = [
    {
      id: 1,
      Engname: "Gobi Flower",
      Malyname: "Gabi Flawera",
      country: "India",
      label: "Vegetables",
    },
    {
      id: 2,
      Engname: "Gobi Flower",
      Malyname: "Gabi Flawera",
      country: "India",
      label: "Vegetables",
    },
    {
      id: 3,
      Engname: "Gobi Flower",
      Malyname: "Gabi Flawera",
      country: "India",
      label: "Vegetables",
    },
    {
      id: 4,
      Engname: "Gobi Flower",
      Malyname: "Gabi Flawera",
      country: "India",
      label: "Vegetables",
    },
    {
      id: 5,
      Engname: "Gobi Flower",
      Malyname: "Gabi Flawera",
      country: "India",
      label: "Vegetables",
    },
    {
      id: 6,
      Engname: "Gobi Flower",
      Malyname: "Gabi Flawera",
      country: "India",
      label: "Vegetables",
    },
  ];
  const columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "Engname", headerName: "English Name", width: 200 },
    { field: "Malyname", headerName: "Malay Name", width: 200 },
    { field: "country", headerName: "Country", width: 200 },
    {
      field: "label",
      headerName: "Label",
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
    <Stack>
      <Button
        variant="contained"
        className="ModalOpeningButtton"
        onClick={() => setopen(true)}
      >
        Add Crop
      </Button>
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
    </Stack>
  );
}

export default Crops;
