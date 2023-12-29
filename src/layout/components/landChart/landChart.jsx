import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";

function LandChart() {
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
  const tagData = {
    labels: [
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
    ],
    datasets: [
      {
        label: "Quantity Produced",
        data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <CustomPieChart
        header="Land Allocated"
        data={data}
        measurement={"100km"}
      />
      <CustomPieChart header="Land Used" data={data} measurement={"100km"} />
      <CustomPieChart
        header="Land Allocated (Tags)"
        data={tagData}
        measurement={"100km"}
      />
      <CustomPieChart
        header="Land Used (Tags)"
        data={tagData}
        measurement={"100km"}
      />
    </Stack>
  );
}

export default LandChart;
