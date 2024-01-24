import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";
import { useQuery } from "@tanstack/react-query";
import {
  getLandAllocationData,
  getLandUsedData,
} from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";

const landConverter = (unit, value) => {
  return Math.round(convert(value).from("km2").to(unit));
};

function LandChart({ land_unit }) {
  const { data: land_allocation = {}, isLandAllocationLoading } = useQuery({
    queryKey: ["land_allocation"],
    queryFn: getLandAllocationData,
  });

  const { data: land_used = {}, isLandUsedLoading } = useQuery({
    queryKey: ["land_used"],
    queryFn: getLandUsedData,
  });

  const data = {
    labels: ["Cultivation", "Fishery", "Poultry", "Storage", "trees"],
    datasets: [
      {
        label: "Land Allocated",
        data: [
          landConverter(land_unit, land_allocation?.cultivation ?? 0),
          landConverter(land_unit, land_allocation?.fishery ?? 0),
          landConverter(land_unit, land_allocation?.poultry ?? 0),
          landConverter(land_unit, land_allocation?.storage ?? 0),
          landConverter(land_unit, land_allocation?.trees ?? 0),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const usedLand = {
    labels: ["Cultivation", "Fishery", "Poultry", "Storage", "trees"],
    datasets: [
      {
        label: "Land Used",
        data: [
          landConverter(land_unit, land_used?.cultivation ?? 0),
          landConverter(land_unit, land_used?.fishery ?? 0),
          landConverter(land_unit, land_used?.poultry ?? 0),
          landConverter(land_unit, land_used?.storage ?? 0),
          landConverter(land_unit, land_used?.trees ?? 0),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  const land_allocated_sum = Object.values(land_allocation).reduce(
    (prev, current) => prev + landConverter(land_unit, current),
    0
  );

  const land_used_sum = Object.values(land_used).reduce(
    (prev, current) => prev + landConverter(land_unit, current),
    0
  );

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLandAllocationLoading || isLandUsedLoading} />
      <CustomPieChart
        header="Land Allocated"
        data={data}
        measurement={`${Math.round(land_allocated_sum)} ${land_unit}`}
      />
      <CustomPieChart
        header="Land Used"
        data={usedLand}
        measurement={`${Math.round(land_used_sum)} ${land_unit}`}
      />
    </Stack>
  );
}

export default LandChart;
