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
import ConsumptionFromProduction from "../../components/consumptionFromProduction/consumptionFromProduction";
import SelfGrown from "../../components/selfGrown/selfGrown";
import PurchasedNeighbour from "../../components/purchasedNeighbour/purchasedNeighbour";
import PurchasedOutside from "../../components/purchasedOutside/purchasedOutside";
import IdealQuantityDiet from "../../components/idealQuantityDiet/idealQuantityDiet";

function Consumption() {
  const [selectedOption, setselectedOption] = useState(
    "consumption-production"
  );
  const [selectedTag, setselectedTag] = useState("grains-nuts");
  const [selectedCrop, setselectedCrop] = useState("");
  const [selectedWeight, setselectedWeight] = useState("kg");
  const renderItems = () => {
    switch (selectedOption) {
      case "consumption-production":
        return <ConsumptionFromProduction />;
      case "self-grown":
        return <SelfGrown />;
      case "purchased-neighbours":
        return <PurchasedNeighbour />;
      case "purchased-outside":
        return <PurchasedOutside />;
      case "ideal-diet":
        return <IdealQuantityDiet />;
    }
  };
  return (
    <Stack className="container">
      <Stack direction={"row"} spacing={3} marginBottom={3}>
        <FormControl size="small">
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
            <MenuItem value="consumption-production">
              Consumption From Production
            </MenuItem>
            <MenuItem value="self-grown">Self Grown & Consumed</MenuItem>
            <MenuItem value="purchased-neighbours">
              Purchased From Neighbours
            </MenuItem>
            <MenuItem value="purchased-outside">
              Purchased From Outside
            </MenuItem>
            <MenuItem value="ideal-diet">Ideal Quantity Healthy Diet</MenuItem>
          </Select>
        </FormControl>
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
        {selectedOption === "consumption-production" && (
          <FormControl size="small">
            <InputLabel id="demo-simple-select-label">Crops</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedCrop}
              style={{ width: 200 }}
              label="Production Information"
              onChange={(e) => setselectedCrop(e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="almonds">Almonds</MenuItem>
              <MenuItem value="walnuts">Walnuts</MenuItem>
              <MenuItem value="cashew">Cashew Nuts</MenuItem>
            </Select>
          </FormControl>
        )}

        <FormControl size="small" style={{ marginLeft: "auto" }}>
          <InputLabel id="demo-simple-select-label">Weight</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedWeight}
            style={{ width: 200 }}
            label="Production Information"
            onChange={(e) => setselectedWeight(e.target.value)}
          >
            <MenuItem value="tonne">Tonne</MenuItem>
            <MenuItem value="kg">Kilogram</MenuItem>
            <MenuItem value="g">Gram</MenuItem>
            <MenuItem value="mg">Miligram</MenuItem>
            <MenuItem value="stone">Stone</MenuItem>
            <MenuItem value="pound">Pound</MenuItem>
            <MenuItem value="ounce">Ounce</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      {renderItems()}
    </Stack>
  );
}

export default Consumption;
