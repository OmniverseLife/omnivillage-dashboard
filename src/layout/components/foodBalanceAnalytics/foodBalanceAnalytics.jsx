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
    queryKey: ["Deficiet chart"],
    queryFn: () => fetchDeficietChart(searchParams.get("village")),
  });

  useEffect(() => {
    if (!isLoading) {
      setChartData(
        Object.entries(data).map((_data) => ({ name: _data[0], y: _data[1] }))
      );
    }
  }, [data, isLoading]);

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Analytics"
        data={chartData}
        helper_text="Each slice only contains data for tags that are in deficiency"
      />
    </Stack>
  );
}

export default FoodBalanceAnalytics;
