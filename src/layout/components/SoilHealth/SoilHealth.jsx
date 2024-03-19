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
import convert from "convert-units";

const landConverter = (unit, value) => {
  return Math.round(convert(value).from("km2").to(unit));
};

function SoilHealth({ land_unit }) {
  const [searchParams] = useSearchParams();

  const { data: { soil_health } = [], isLoading } = useQuery({
    queryKey: ["soil_health", searchParams.getAll("village")],
    queryFn: () => getSoilHealth(searchParams.getAll("village")),
  });

  const soilHealthData = [
    {
      name: "Stable",
      y: landConverter(land_unit, soil_health?.stable),
    },
    {
      name: "Decreasing Yeild",
      y: landConverter(land_unit, soil_health?.decreasing_yeild),
    },
  ];

  const soil_health_sum = Object.values(soil_health || {})?.reduce(
    (prev, _value) => prev + landConverter(land_unit, _value),
    0
  );

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Soil Health"
        data={soilHealthData}
        helper_text={`Each slice represents ${
          soil_health?.type !== "tree" ? "amount of land" : "number of crops"
        }`}
        measurement={`${soil_health_sum} ${land_unit}`}
      />
    </Stack>
  );
}

export default SoilHealth;
