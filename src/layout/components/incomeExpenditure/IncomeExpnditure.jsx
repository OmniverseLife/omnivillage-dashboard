import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { getIncomeExpenditureData } from "../../../functions/dashboard";
import { Box, Stack } from "@mui/material";
import Loading from "../loading";
import CustomBarChart from "../customBarChart/customBarChart";

export default function IncomeExpnditure() {
  const [searchParams] = useSearchParams();

  const { data = [], isLoading } = useQuery({
    queryKey: [
      "income-expenditure",
      searchParams.get("crop"),
      searchParams.get("village"),
    ],
    queryFn: () =>
      getIncomeExpenditureData(
        searchParams.get("crop"),
        searchParams.get("village")
      ),
  });

  console.log(data);

  const incomeExpenditureData = {
    xAxis: data.map((_data) => _data.name),
    dataset: [
      {
        name: "Income",
        data: data.map((_data) => _data.income),
      },
      {
        name: "Expenditure",
        data: data.map((_data) => _data.expenditure),
      },
    ],
  };

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <Box sx={{ width: "100%" }}>
        <CustomBarChart
          header="Income Expenditure"
          data={incomeExpenditureData}
          helper_text={`Each bar represents data in USD`}
        />
      </Box>
    </Stack>
  );
}
