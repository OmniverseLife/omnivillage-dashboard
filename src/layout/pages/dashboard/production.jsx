import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import React, { useState } from "react";

import BifurcatedChart from "../../components/bifurcatedChart/bifurcatedChart";
import IncomeSaleChart from "../../components/incomeSaleChart/incomeSaleChart";
import ExpenditureSaleChart from "../../components/expenditureSaleChart /expenditureSaleChart";
import LandAllocated from "../../components/landAllocated/landAllocated";
import LandChart from "../../components/landChart/landChart";
import SellingChannel from "../../components/sellingChannel/sellingChannel";
import StorageFacility from "../../components/storageFacility/storageFacility";

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

function Production() {
  const [selectedOption, setselectedOption] = useState("land-chart");
  const [selectedTag, setselectedTag] = useState("grains-nuts");
  return (
    <Stack className="container">
      <Stack direction={"row"} spacing={3} marginBottom={3}>
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
            <MenuItem value="land-chart">Land Chart</MenuItem>
            <MenuItem value="bifurcated">Bifurcated Chart By Tags</MenuItem>
            <MenuItem value="income-chart">Income & Expenditure Chart</MenuItem>
            <MenuItem value="selling-channel">Selling Channel</MenuItem>
            <MenuItem value="storage-facility">Storage Facility</MenuItem>
          </Select>
        </FormControl>
        {selectedOption === "bifurcated" ? (
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
        ) : null}
      </Stack>
      {selectedOption === "land-chart" ? (
        <LandChart />
      ) : selectedOption === "bifurcated" ? (
        <BifurcatedChart tag={selectedTag} />
      ) : selectedOption === "income-chart" ? (
        <IncomeSaleChart />
      ) : selectedOption === "selling-channel" ? (
        <SellingChannel />
      ) : selectedOption === "storage-facility" ? (
        <StorageFacility />
      ) : null}
    </Stack>
  );
}

export default Production;
