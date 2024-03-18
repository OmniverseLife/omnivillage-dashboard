import React, { useState, useEffect } from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import { Stack } from "@mui/material";
import CustomPieChart from "../customPieChart/customPieChart";
import { useQuery } from "@tanstack/react-query";
import { fetchDeficietChart } from "../../../functions/dashboard";
import { useSearchParams } from "react-router-dom";
import Loading from "../loading";

function FoodBalanceAnalytics() {
  const [searchParams] = useSearchParams();
  const [chartData, setChartData] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ["Deficiet_chart", searchParams.getAll("village")],
    queryFn: () => fetchDeficietChart(searchParams.getAll("village")),
    initialData: [],
  });

  useEffect(() => {
    if (!isLoading) {
      setChartData(
        Object.entries(data).map((_data) => ({ name: _data[0], y: _data[1] }))
      );
    }
  }, [data, isLoading]);

  const deficit_sum = Object.values(data).reduce(
    (prev, current) => prev + current,
    0
  );

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Deficit"
        data={chartData}
        measurement={`${deficit_sum} kgs`}
        helper_text="Each slice only contains data for tags that are in deficiency"
      />
    </Stack>
  );
}

export default FoodBalanceAnalytics;
