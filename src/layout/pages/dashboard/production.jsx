import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import React, { useState } from "react";
import CustomPieChart from "../../components/customPieChart/customPieChart";
import BifurcatedChart from "../../components/bifurcatedChart/bifurcatedChart";

export const backgroundColor = [
  "rgba(255, 99, 132, 0.35)",
  "rgba(54, 162, 235, 0.35)",
  "rgba(255, 206, 86, 0.35)",
  "rgba(75, 192, 192, 0.35)",
  "rgba(153, 102, 255, 0.35)",
  "rgba(255, 159, 64, 0.35)",
];
export const borderColor = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];
const LandAllocated = () => {
  const data = {
    labels: ["Cultivation", "Trees & Shrubs", "Poultry", "Fishery", "Storage"],
    datasets: [
      {
        label: "Land Allocated",
        data: [20, 20, 20, 20, 20],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack>
      <CustomPieChart header="Land Allocated" data={data} />
    </Stack>
  );
};

const LandChart = () => {
  const data = {
    labels: ["Cultivation", "Trees & Shrubs", "Poultry", "Fishery", "Storage"],
    datasets: [
      {
        label: "Land Allocated",
        data: [20, 20, 20, 20, 20],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <CustomPieChart header="Land Allocated" data={data} />
      <CustomPieChart header="Land Used" data={data} />
    </Stack>
  );
};

function Production() {
  const [selectedOption, setselectedOption] = useState("land-allocated");
  const [selectedTag, setselectedTag] = useState("grains-nuts");
  return (
    <Stack className="container">
      <Stack direction={"row"} spacing={3}>
        <FormControl>
          <InputLabel id="demo-simple-select-label">
            Production Information
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedOption}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => setselectedOption(e.target.value)}
          >
            <MenuItem value="land-allocated">Land Allocated</MenuItem>
            <MenuItem value="land-chart">Land Chart</MenuItem>
            <MenuItem value="bifurcated">Bifurcated Chart By Tags</MenuItem>
            <MenuItem value="income-chart">Income Chart</MenuItem>
            <MenuItem value="expenditure-chart">Expenditure Chart</MenuItem>
            <MenuItem value="selling-channel">Selling Channel</MenuItem>
            <MenuItem value="storage-facility">Storage Facility</MenuItem>
          </Select>
        </FormControl>
        {selectedOption === "bifurcated" && (
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
        )}
      </Stack>
      {selectedOption === "land-allocated" ? (
        <LandAllocated />
      ) : selectedOption === "land-chart" ? (
        <LandChart />
      ) : selectedOption === "bifurcated" ? (
        <BifurcatedChart tag={selectedTag} />
      ) : null}
    </Stack>
  );
}

export default Production;
