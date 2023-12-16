import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";
import { Stack } from "@mui/material";

function SellingChannel() {
  const sellingChannel = {
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
        label: "Selling Channel",
        data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <CustomPieChart header="Lands In Selling Channel" data={sellingChannel} />
    </Stack>
  );
}

export default SellingChannel;
