import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import CustomPieChart from "../customPieChart/customPieChart";

function ExpenditureSaleChart() {
  const expenditureByLabels = [
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

  const expenditureByLabelsData = {
    labels: expenditureByLabels,
    datasets: [
      {
        label: "Expenditure",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
    ],
  };
  const expenditureByCrops = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Expenditure",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <CustomBarChart
        header="a. Expenditure By Labels"
        data={expenditureByLabelsData}
      />
      <CustomPieChart
        header="b. Expenditure By Crops"
        data={expenditureByCrops}
      />
    </Stack>
  );
}

export default ExpenditureSaleChart;
