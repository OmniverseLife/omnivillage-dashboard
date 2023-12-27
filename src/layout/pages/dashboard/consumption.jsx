import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import React, { useState } from "react";
import { backgroundColor } from "./production";
import CustomBarChart from "../../components/customBarChart/customBarChart";

function Consumption() {
  const tags = [
    "Grains & Nuts",
    "Vegetables",
    "Herbs",
    "Legumes",
    "Fruits",
    "Dairy",
    "Meat",
    "Spices & Condiments",
    "DaiTea/Coffeery",
    "Oils",
    "Processed Food & Beverages",
    "Alcohol/Tobacco",
  ];

  const tagsData = {
    labels: tags,
    datasets: [
      {
        label: "Ideal Quantity To Be Consumed",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Currently Quantity Consumed",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const crops = [
    "Almonds",
    "Walnuts",
    "Cashew Nuts",
    "Carrot",
    "Apple",
    "Banana",
  ];
  const cropsData = {
    labels: crops,
    datasets: [
      {
        label: "Ideal Quantity To Be Consumed",
        data: [40, 80, 60, 30, 70, 10],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Currently Quantity Consumed",
        data: [20, 60, 90, 30, 20, 50],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const [selectedOption, setselectedOption] = useState("ideal");
  const [selectedCrop, setselectedCrop] = useState("");
  const [selectedTag, setselectedTag] = useState("grains-nuts");
  return (
    <Stack className="container">
      <Stack direction={"row"} spacing={3} marginBottom={3}>
        {/* <FormControl>
          <InputLabel id="demo-simple-select-label">
            Consumption Information
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedOption}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => setselectedOption(e.target.value)}
          >
            <MenuItem value="ideal">Ideal Quantity Healthy Diet</MenuItem>
          </Select>
        </FormControl> */}

        <FormControl>
          <InputLabel id="demo-simple-select-label">Tags</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedTag}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => setselectedTag(e.target.value)}
          >
            <MenuItem value="grains-nuts">Grains & Nuts</MenuItem>
            <MenuItem value="vegetables">Vegetables</MenuItem>
            <MenuItem value="herbs">Herbs</MenuItem>
            <MenuItem value="legumes">Legumes</MenuItem>
            <MenuItem value="fruits">Fruits</MenuItem>
            <MenuItem value="dairy">Dairy</MenuItem>
            <MenuItem value="meat">Meat</MenuItem>
            <MenuItem value="spices-condiments">Spices & Condiments</MenuItem>
            <MenuItem value="tea-coffee">Tea/Coffee</MenuItem>
            <MenuItem value="oils">Oils</MenuItem>
            <MenuItem value="food-beverage">
              Processed Food & Beverages
            </MenuItem>
            <MenuItem value="alocohol-tobacco">Alcohol/Tobacco</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="demo-simple-select-label">Crops</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedCrop}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => setselectedCrop(e.target.value)}
          >
            <MenuItem value="almonds">Almonds</MenuItem>
            <MenuItem value="walnuts">Walnuts</MenuItem>
            <MenuItem value="cashew">Cashew Nuts</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <CustomBarChart
        header="Ideal Quantity Consumption (Tags)"
        data={tagsData}
      />
      <CustomBarChart
        header="Ideal Quantity Consumption (Crops)"
        data={cropsData}
      />
    </Stack>
  );
}

export default Consumption;
