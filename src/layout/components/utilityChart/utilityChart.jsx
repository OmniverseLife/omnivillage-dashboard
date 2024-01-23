import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import { getUtilizationData } from "../../../functions/dashboard";
import Loading from "../loading";

function UtilityChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["utilization_data"],
    queryFn: getUtilizationData,
  });

  const barTags = [
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

  const soilHealth = {
    labels: barTags,
    datasets: [
      {
        label: "Soil Health (Stable)",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Soil Health (Decreasing Yeild)",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const selfConsumed = {
    labels: barTags,
    datasets: [
      {
        label: "Self Consumed",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[0],
      },
    ],
  };
  const soldToNeighbour = {
    labels: barTags,
    datasets: [
      {
        label: "Sold To Neighbour",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[5],
      },
    ],
  };
  const soldToMarket = {
    labels: barTags,
    datasets: [
      {
        label: "Sold To Market",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[3],
      },
    ],
  };
  const fedToLiveStock = {
    labels: barTags,
    datasets: [
      {
        label: "Fed To Live Stock",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
    ],
  };
  const wastage = {
    labels: barTags,
    datasets: [
      {
        label: "Wastage",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[4],
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomBarChart header="Soil Health" data={soilHealth} />
      <CustomBarChart header="Self Consumed" data={selfConsumed} />
      <CustomBarChart header="Sold To Neighbour" data={soldToNeighbour} />
      <CustomBarChart header="Sold To Market" data={soldToMarket} />
      <CustomBarChart header="Fed To Live Stock" data={fedToLiveStock} />
      <CustomBarChart header="Wastage" data={wastage} />
    </Stack>
  );
}

export default UtilityChart;
