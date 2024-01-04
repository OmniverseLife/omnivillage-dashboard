import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import { Stack } from "@mui/material";

function LandAllocated() {
  const data = {
    labels: ["Cultivation", "Trees & Shrubs", "Poultry", "Fishery", "Storage"],
    datasets: [
      {
        label: "Land Allocated",
        data: [20, 20, 20, 40, 20],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack>
      <CustomPieChart header="a. Land Allocated" data={data} />
    </Stack>
  );
}

export default LandAllocated;
