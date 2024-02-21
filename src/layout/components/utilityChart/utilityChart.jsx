import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import { getUtilizationData } from "../../../functions/dashboard";
import Loading from "../loading";
import { useSearchParams } from "react-router-dom";

function UtilityChart() {
  const [searchParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["utilization_data"],
    queryFn: () => getUtilizationData(searchParams.get("village")),
  });

  const soilHealth = {
    labels: data?.soil_health?.map((_item) => _item.label),
    datasets: [
      {
        label: "Soil Health (Stable)",
        data: data?.soil_health?.map((_item) => _item.value.stable),
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Soil Health (Decreasing Yeild)",
        data: data?.soil_health?.map((_item) => _item.value.decreasing_yeild),
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const selfConsumed = {
    labels: data?.self_consumed?.map((_item) => _item.label),
    datasets: [
      {
        label: "Self Consumed",
        data: data?.self_consumed?.map((_item) => _item.value),
        backgroundColor: backgroundColor[0],
      },
    ],
  };
  const soldToNeighbour = {
    labels: data?.sold_to_neighbours?.map((_item) => _item.label),
    datasets: [
      {
        label: "Sold To Neighbour",
        data: data?.sold_to_neighbours?.map((_item) => _item.value),
        backgroundColor: backgroundColor[5],
      },
    ],
  };
  const soldToMarket = {
    labels: data?.sold_to_market?.map((_item) => _item.label),
    datasets: [
      {
        label: "Sold To Market",
        data: data?.sold_to_market?.map((_item) => _item.value),
        backgroundColor: backgroundColor[3],
      },
    ],
  };
  const fedToLiveStock = {
    labels: data?.fed_to_livestock?.map((_item) => _item.label),
    datasets: [
      {
        label: "Fed To Livestock",
        data: data?.fed_to_livestock?.map((_item) => _item.value),
        backgroundColor: backgroundColor[2],
      },
    ],
  };
  const wastage = {
    labels: data?.wastage?.map((_item) => _item.label),
    datasets: [
      {
        label: "Wastage",
        data: data?.wastage?.map((_item) => _item.value),
        backgroundColor: backgroundColor[4],
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomBarChart header="Soil Health" data={soilHealth} />
      <CustomBarChart header="Self Consumed" data={selfConsumed} />
      <CustomBarChart header="Sold To Neighbour" data={soldToNeighbour} />
      <CustomBarChart header="Sold To Market" data={soldToMarket} />
      <CustomBarChart header="Fed To Live Stock" data={fedToLiveStock} />
      <CustomBarChart header="Wastage" data={wastage} />
    </Stack>
  );
}

export default UtilityChart;
