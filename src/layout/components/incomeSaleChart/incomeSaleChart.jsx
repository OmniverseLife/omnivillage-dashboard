import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import CustomPieChart from "../customPieChart/customPieChart";
import { useQuery } from "@tanstack/react-query";
import { getIncomeExpenditureData } from "../../../functions/dashboard";
import Loading from "../loading";

function IncomeSaleChart() {
  const { data: income_expenditure, isLoading } = useQuery({
    queryKey: ["income_expenditure"],
    queryFn: getIncomeExpenditureData,
  });

  const incomeByLabels = [
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

  const incomeByLabelsData = {
    labels: incomeByLabels,
    datasets: [
      {
        label: "Income",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Expenditure",
        data: [40, 50, 80, 20, 80, 90, 10, 50, 65, 15, 70, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomBarChart header="Income & Expenditure" data={incomeByLabelsData} />
    </Stack>
  );
}

export default IncomeSaleChart;
