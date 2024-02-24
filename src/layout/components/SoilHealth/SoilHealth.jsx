import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import CustomPieChart from "../customPieChart/customPieChart";
import { useQuery } from "@tanstack/react-query";
import {
  getIncomeExpenditureData,
  getSoilHealth,
} from "../../../functions/dashboard";
import Loading from "../loading";
import { useSearchParams } from "react-router-dom";

function SoilHealth() {
  const [searchParams] = useSearchParams();

  const { data: { soil_health, type } = [], isLoading } = useQuery({
    queryKey: [
      "soil_health",
      searchParams.get("crop"),
      searchParams.get("village"),
    ],
    queryFn: () =>
      getSoilHealth(searchParams.get("crop"), searchParams.get("village")),
  });

  const soilHealthData = [
    {
      name: "Stable",
      y: soil_health?.stable,
    },
    {
      name: "Decreasing Yeild",
      y: soil_health?.decreasing_yeild,
    },
  ];

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Soil Health"
        data={soilHealthData}
        helper_text={`Each slice represents ${
          soil_health?.type !== "tree" ? "amount of land" : "number of crops"
        }`}
      />
    </Stack>
  );
}

export default SoilHealth;
