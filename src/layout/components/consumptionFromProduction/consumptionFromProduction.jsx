import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";

function ConsumptionFromProduction() {
  const data = {
    labels: [
      "Self Grown",
      "Self Consumed",
      "Purchased From Neighbours",
      "Purshased From Outside",
    ],
    datasets: [
      {
        label: "Consumption From Production",
        data: [30, 40, 50, 30],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <CustomPieChart header="Consumption From Production" data={data} />
    </Stack>
  );
}

export default ConsumptionFromProduction;
