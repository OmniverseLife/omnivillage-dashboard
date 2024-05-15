import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";
import { useQuery } from "@tanstack/react-query";
import {
  getLandAllocationData,
  getLandUsedCultivation,
  getLandUsedData,
} from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";

const landConverter = (unit, value) => {
  return Math.round(convert(value).from("km2").to(unit));
};

function LandChart({ land_unit }) {
  const [searchParams] = useSearchParams();

  const { data: land_allocation = {}, isLandAllocationLoading } = useQuery({
    queryKey: ["land_allocation", searchParams.getAll("village")],
    queryFn: () => getLandAllocationData(searchParams.getAll("village")),
  });

  // const { data: land_used = {}, isLandUsedLoading } = useQuery({
  //   queryKey: ["land_used", searchParams.getAll("village")],
  //   queryFn: () => getLandUsedData(searchParams.getAll("village")),
  // });
  const { data: land_used = {}, isLandUsedLoading } = useQuery({
    queryKey: ["land_used", searchParams.getAll("village")],
    queryFn: () => getLandUsedCultivation(searchParams.getAll("village")),
  });

  // , "Fishery", "Poultry", "Storage", "trees"

  // const data = {
  //   labels: ["Cultivation"],
  //   datasets: [
  //     {
  //       label: "Land Allocated",
  //       data: [
  //         landConverter(land_unit, land_allocation?.cultivation ?? 0),
  //         // landConverter(land_unit, land_allocation?.fishery ?? 0),
  //         // landConverter(land_unit, land_allocation?.poultry ?? 0),
  //         // landConverter(land_unit, land_allocation?.storage ?? 0),
  //         // landConverter(land_unit, land_allocation?.trees ?? 0),
  //       ],
  //       backgroundColor: backgroundColor,
  //       borderColor: borderColor,
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  console.log(land_used);
  const data = [
    {
      name: "Cultivation",
      y: landConverter(land_unit, land_allocation?.cultivation ?? 0),
    },
    {
      name: "Fishery",
      y: landConverter(land_unit, land_allocation?.fishery ?? 0),
    },
    {
      name: "Poultry",
      y: landConverter(land_unit, land_allocation?.poultry ?? 0),
    },
    {
      name: "Storage",
      y: landConverter(land_unit, land_allocation?.storage ?? 0),
    },
    {
      name: "Trees",
      y: landConverter(land_unit, land_allocation?.trees ?? 0),
    },
  ];

  // , "Fishery", "Poultry", "Storage", "trees"
  // const usedLand = {
  //   labels: ["Cultivation"],
  //   datasets: [
  //     {
  //       label: "Land Used",
  //       data: [
  //         landConverter(land_unit, land_used?.cultivation ?? 0),
  //         // landConverter(land_unit, land_used?.fishery ?? 0),
  //         // landConverter(land_unit, land_used?.poultry ?? 0),
  //         // landConverter(land_unit, land_used?.storage ?? 0),
  //         // landConverter(land_unit, land_used?.trees ?? 0),
  //       ],
  //       backgroundColor: backgroundColor,
  //       borderColor: borderColor,
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  const usedLand = Object.entries(land_used).map((_used) => ({
    name: _used[0],
    y: landConverter(land_unit, _used[1]),
  }));
  //   [
  //   {
  //     name: "Cultivation",
  //     y: landConverter(land_unit, land_used?.cultivation ?? 0),
  //   },
  // ];

  const land_allocated_sum = Object.values(land_allocation).reduce(
    (prev, current) => prev + landConverter(land_unit, current),
    0
  );

  const land_used_sum = Object.values(land_used).reduce(
    (prev, current) => prev + landConverter(land_unit, current),
    0
  );

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      flexWrap={"wrap"}
      rowGap={10}
    >
      <Loading isLoading={isLandAllocationLoading || isLandUsedLoading} />
      <CustomPieChart
        header="Land Allocated"
        data={data}
        measurement={`${Math.round(land_allocated_sum)} ${land_unit}`}
        helper_text="Each slice represent amount of land."
        // style={{ width: "100%" }}
      />
      <CustomPieChart
        header="Land Used"
        data={usedLand}
        measurement={`${Math.round(land_used_sum)} ${land_unit}`}
        helper_text="Each slice represent amount of land."
        // style={{ width: "100%" }}
      />
    </Stack>
  );
}

export default LandChart;
