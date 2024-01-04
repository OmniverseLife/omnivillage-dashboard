import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";
import { Stack } from "@mui/material";

function SellingChannel() {
  const sellingChannel = {
    labels: ["Local Market", "Agent", "Ecommerce", "Export", "None"],
    datasets: [
      {
        label: "Selling Channel",
        data: [20, 20, 20, 20, 20],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <CustomPieChart
        header="Selling Channel"
        data={sellingChannel}
        measurement="Total 100"
      />
    </Stack>
  );
}

export default SellingChannel;
