import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";

function SelfGrown() {
  const selfGrownData = {
    labels: ["Almonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Self Grown",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const selfConsumedData = {
    labels: ["Almonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Self Consumed",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <CustomPieChart header="Self Grown" data={selfGrownData} />
      <CustomPieChart header="Self Consumed" data={selfConsumedData} />
    </Stack>
  );
}

export default SelfGrown;
