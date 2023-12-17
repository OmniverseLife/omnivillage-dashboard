import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import React, { useState } from "react";

function Consumption() {
  const [selectedOption, setselectedOption] = useState("land-allocated");
  const [selectedTag, setselectedTag] = useState("grains-nuts");
  return (
    <Stack className="container">
      <Stack direction={"row"} spacing={3} marginBottom={3}>
        <FormControl>
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
            <MenuItem value="land-allocated">Land Allocated</MenuItem>
            <MenuItem value="land-chart">Land Chart</MenuItem>
            <MenuItem value="bifurcated">Bifurcated Chart By Tags</MenuItem>
            <MenuItem value="income-chart">Income Chart</MenuItem>
            <MenuItem value="expenditure-chart">Expenditure Chart</MenuItem>
            <MenuItem value="selling-channel">Selling Channel</MenuItem>
            <MenuItem value="storage-facility">Storage Facility</MenuItem>
          </Select>
        </FormControl>
        {selectedOption === "bifurcated" ||
        selectedOption === "income-chart" ||
        selectedOption === "expenditure-chart" ? (
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
      {selectedOption === "land-allocated" ? (
        <LandAllocated />
      ) : selectedOption === "land-chart" ? (
        <LandChart />
      ) : selectedOption === "bifurcated" ? (
        <BifurcatedChart tag={selectedTag} />
      ) : selectedOption === "income-chart" ? (
        <IncomeSaleChart />
      ) : selectedOption === "expenditure-chart" ? (
        <ExpenditureSaleChart />
      ) : selectedOption === "selling-channel" ? (
        <SellingChannel />
      ) : selectedOption === "storage-facility" ? (
        <StorageFacility />
      ) : null}
    </Stack>
  );
}

export default Consumption;
