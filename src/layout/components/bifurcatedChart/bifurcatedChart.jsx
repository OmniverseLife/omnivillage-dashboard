import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
// import * as faker from "@faker-js/faker";
const BifurcatedChart = ({ tag }) => {
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
  const cropData = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Quantity Produced",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const soilHealth = {
    labels: ["Land In Stable Condition", "Land Under Decreasing Yeild"],
    datasets: [
      {
        label: "Soil Health",
        data: [15, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const selfConsumed = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Self Consumed",
        data: [10, 40, 30, 30, 15, 5],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const soldToNeighbours = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Sold To Neighbours",
        data: [10, 40, 10, 30, 15, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const soldToMarket = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Sold To Market",
        data: [20, 40, 28, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const fedToLiveStock = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Fed To Live Stock",
        data: [10, 40, 20, 30, 25, 15],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const wastage = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Wastage",
        data: [10, 30, 25, 15, 25, 25],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const processing = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Processing",
        data: [30, 40, 50, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const Organiclabels = [
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

  const fertilizerData = {
    labels: Organiclabels,
    datasets: [
      {
        label: "Fertilizer A",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Fertilizer B",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const OrganicPesticides = [
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

  const pesticideData = {
    labels: OrganicPesticides,
    datasets: [
      {
        label: "Pesticide A",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Pesticide B",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const organicFetilizerCrops = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Fertilizer A",
        data: [10, 30, 25, 15, 25, 25],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const organicPesticidesCrops = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Processing",
        data: [30, 40, 50, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const incomeByCrops = {
    labels: ["Alomonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Income Generated",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
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
      <CustomPieChart header="Quantity Produced(Types)" data={tagData} />
      <CustomPieChart header="Quantity Produced(Crops)" data={cropData} />
      <CustomPieChart header="Soil Health" data={soilHealth} />
      <CustomPieChart header="Self Consumed" data={selfConsumed} />
      <CustomPieChart header="Sold To Neighbours" data={soldToNeighbours} />
      <CustomPieChart header="Sold To Market" data={soldToMarket} />
      <CustomPieChart header="Fed To Live Stock" data={fedToLiveStock} />
      <CustomPieChart header="Wastage" data={wastage} />
      <CustomPieChart header="Income By Crops" data={incomeByCrops} />
      <CustomPieChart header="Expenditure By Crops" data={expenditureByCrops} />
      <CustomPieChart header="Processing" data={processing} />
      <CustomBarChart header="Organic Fertilizer" data={fertilizerData} />
      <CustomPieChart header="Fertilizer A" data={organicFetilizerCrops} />
      <CustomPieChart header="Fertilizer B" data={organicFetilizerCrops} />
      <CustomBarChart header="Organic Pesticides" data={pesticideData} />
      <CustomPieChart header="Pesticide A" data={organicPesticidesCrops} />
      <CustomPieChart header="Pesticide B" data={organicPesticidesCrops} />
    </Stack>
  );
};
export default BifurcatedChart;
