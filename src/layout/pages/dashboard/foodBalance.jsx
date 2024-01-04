import React, { useState } from "react";
import FoodBalanceAnalytics from "../../components/foodBalanceAnalytics/foodBalanceAnalytics";
import DeficitCrops from "../../components/deficitCrops/deficitCrops";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
function FoodBalance() {
  const [selectedOption, setselectedOption] = useState("analytics");
  const [selectedTag, setselectedTag] = useState("grains-nuts");

  return (
    <Stack className="container">
      <Stack direction={"row"} spacing={3} marginBottom={3}>
        <FormControl size="small">
          <InputLabel id="demo-simple-select-label">
            Food Balance Information
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedOption}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => setselectedOption(e.target.value)}
          >
            <MenuItem value="analytics">Analytics</MenuItem>
            <MenuItem value="deficit">Deficit Crops</MenuItem>
          </Select>
        </FormControl>
        {selectedOption === "analytics" && (
          <FormControl size="small">
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
      {selectedOption === "analytics" ? (
        <FoodBalanceAnalytics />
      ) : selectedOption === "deficit" ? (
        <DeficitCrops />
      ) : null}
    </Stack>
  );
}

export default FoodBalance;
