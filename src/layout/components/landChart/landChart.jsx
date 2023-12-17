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
  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <CustomPieChart header="Land Allocated" data={data} />
      <CustomPieChart header="Land Used" data={data} />
    </Stack>
  );
}

export default LandChart;
