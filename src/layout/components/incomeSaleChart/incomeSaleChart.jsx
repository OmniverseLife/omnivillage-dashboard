import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import CustomPieChart from "../customPieChart/customPieChart";
import { useQuery } from "@tanstack/react-query";
import { getIncomeExpenditureData } from "../../../functions/dashboard";
import Loading from "../loading";
import { useSearchParams } from "react-router-dom";

function IncomeSaleChart() {
  const [searchParams] = useSearchParams();

  const { data: income_expenditure = [], isLoading } = useQuery({
    queryKey: ["income_expenditure"],
    queryFn: () => getIncomeExpenditureData(searchParams.get("village")),
  });

  const incomeByLabels = income_expenditure.map((_item) => _item.label);

  const incomeByLabelsData = {
    labels: incomeByLabels,
    datasets: [
      {
        label: "Income",
        data: income_expenditure.map((_item) => Math.round(_item.income)),
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Expenditure",
        data: income_expenditure.map((_item) => Math.round(_item.expenditure)),
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
