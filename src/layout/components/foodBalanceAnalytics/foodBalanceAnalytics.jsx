import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import { Stack } from "@mui/material";
import CustomBarChart from "../customBarChart/customBarChart";

function FoodBalanceAnalytics() {
  const tagWiseLabels = [
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
  const cropsWiseData = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Production",
        data: [60, 70, 50, 5, 75, 95],
        backgroundColor: backgroundColor[2],
        borderWidth: 1,
      },
      {
        label: "Consumption",
        data: [10, 30, 25, 15, 25, 25],
        backgroundColor: backgroundColor[1],

        borderWidth: 1,
      },
    ],
  };
  const tagWisedata = {
    labels: tagWiseLabels,
    datasets: [
      {
        label: "Production",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Consumption",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <CustomBarChart header="Tag Wise" data={tagWisedata} />
      <CustomBarChart header="Selected Crop Wise" data={cropsWiseData} />
    </Stack>
  );
}

export default FoodBalanceAnalytics;
