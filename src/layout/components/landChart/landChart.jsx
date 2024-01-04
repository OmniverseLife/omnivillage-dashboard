import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";

function LandChart() {
  const data = {
    labels: [
      "Grains and Nuts",
      "Legumes",
      "Fruits, Vegetables & Herbs",
      "Dairy & Animal based",
      "Meat & Seafood",
      "Sauce",
      "Tea/Coffee",
      "Oils",
      "Processed foods & Beverages",
      "Tobacco and Alcohol",
    ],
    datasets: [
      {
        label: "Land Allocated",
        data: [40, 50, 10, 15, 10, 10, 25, 15, 10, 20],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  const data_used = {
    labels: [
      "Grains and Nuts",
      "Legumes",
      "Fruits, Vegetables & Herbs",
      "Dairy & Animal based",
      "Meat & Seafood",
      "Sauce",
      "Tea/Coffee",
      "Oils",
      "Processed foods & Beverages",
      "Tobacco and Alcohol",
    ],
    datasets: [
      {
        label: "Land Allocated",
        data: [30, 40, 10, 10, 10, 10, 20, 10, 10, 40],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <CustomPieChart header="a. Land Allocated" data={data} />
      <CustomPieChart header="b. Land Used" data={data_used} />
    </Stack>
  );
}

export default LandChart;
