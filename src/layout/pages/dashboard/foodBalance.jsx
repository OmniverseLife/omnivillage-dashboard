import React, { useEffect, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { fetchLabels } from "../../../functions/others";
import Loading from "../../components/loading";
function FoodBalance() {
  const [selectedOption, setselectedOption] = useState("analytics");
  const [selectedTag, setselectedTag] = useState("");

  const { data: labels = [], isLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  useEffect(() => {
    if (!isLoading) {
      setselectedTag(labels[0]._id);
    }
  }, [isLoading, labels]);

  return (
    <Stack className="container">
      <Stack direction={"row"} spacing={3} marginBottom={3}>
        <FormControl size="small">
          <InputLabel id="demo-simple-select-label">Section</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedOption}
            style={{ width: 300, textTransform: "capitalize" }}
            label="Section"
            onChange={(e) => setselectedOption(e.target.value)}
          >
            <MenuItem value={"analytics"} sx={{ textTransform: "capitalize" }}>
              Deficit
            </MenuItem>
            <MenuItem
              value={"food_balance"}
              sx={{ textTransform: "capitalize" }}
            >
              Food balance
            </MenuItem>
          </Select>
        </FormControl>
        {selectedOption === "food_balance" && (
          <FormControl size="small">
            <InputLabel id="demo-simple-select-label">Tags</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedTag}
              style={{ width: 300, textTransform: "capitalize" }}
              label="Tags"
              onChange={(e) => setselectedTag(e.target.value)}
            >
              {labels.map((_label) => {
                return (
                  <MenuItem
                    value={_label._id}
                    key={_label._id}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {_label.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
        {/* {selectedOption === "analytics" && (
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
        )} */}
      </Stack>
      {selectedOption === "analytics" ? (
        <FoodBalanceAnalytics />
      ) : selectedOption === "food_balance" ? (
        <DeficitCrops parentLoading={isLoading} tag={selectedTag} />
      ) : null}
      {/* <DeficitCrops /> */}
    </Stack>
  );
}

export default FoodBalance;
