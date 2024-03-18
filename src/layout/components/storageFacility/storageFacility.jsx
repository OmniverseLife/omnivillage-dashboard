import { Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import convert from "convert-units";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { getStorageData } from "../../../functions/dashboard";
import CustomPieChart from "../customPieChart/customPieChart";
import Loading from "../loading";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function StorageFacility({ weight_unit }) {
  const [searchParams] = useSearchParams();

  const { data = {}, isLoading } = useQuery({
    queryKey: ["storage_data", searchParams.getAll("village")],
    queryFn: () => getStorageData(searchParams.getAll("village")),
  });

  const grains = [
    { name: "Bags", y: weightConverter(weight_unit, data?.grain?.bags ?? 0) },
    {
      name: "Containers",
      y: weightConverter(weight_unit, data?.grain?.containers ?? 0),
    },
    { name: "Piles", y: weightConverter(weight_unit, data?.grain?.piles ?? 0) },
    {
      name: "Warehouse",
      y: weightConverter(weight_unit, data?.grain?.warehouse ?? 0),
    },
  ];

  const poultry = [
    {
      name: "Common Storage",
      y: weightConverter(weight_unit, data?.poultry?.common_storage),
    },
    {
      name: "Refrigeration",
      y: weightConverter(weight_unit, data?.poultry?.refrigeration),
    },
  ];

  const meat = [
    {
      name: "Common Storage",
      y: weightConverter(weight_unit, data?.meat?.common_storage),
    },
    {
      name: "Refrigeration",
      y: weightConverter(weight_unit, data?.meat?.refrigeration),
    },
  ];

  const fruits = [
    { name: "Bags", y: weightConverter(weight_unit, data?.fruits?.bags) },
    {
      name: "Containers",
      y: weightConverter(weight_unit, data?.fruits?.containers),
    },
    {
      name: "Freezing",
      y: weightConverter(weight_unit, data?.fruits?.freezing),
    },
    { name: "Drying", y: weightConverter(weight_unit, data?.fruits?.drying) },
    { name: "Canning", y: weightConverter(weight_unit, data?.fruits?.canning) },
  ];

  // Sum

  const grains_sum = Object.values(data?.grain || {}).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  const poultry_sum = Object.values(data?.poultry || {}).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  const meat_sum = Object.values(data?.meat || {}).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  const fruits_sum = Object.values(data?.fruits || {}).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      flexWrap={"wrap"}
      rowGap={5}
    >
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Storage Facility Grains"
        data={grains}
        measurement={`${grains_sum} ${weight_unit}`}
        helper_text="Each slice represents amount of crop stored"
      />
      <CustomPieChart
        header="Storage Facility Poultry"
        data={poultry}
        measurement={`${poultry_sum} ${weight_unit}`}
        helper_text="Each slice represents amount of crop stored"
      />
      <CustomPieChart
        header="Storage Facility Meat"
        data={meat}
        measurement={`${meat_sum} ${weight_unit}`}
        helper_text="Each slice represents amount of crop stored"
      />
      <CustomPieChart
        header="Storage Facility Fruits & Vegetables"
        data={fruits}
        measurement={`${fruits_sum} ${weight_unit}`}
        helper_text="Each slice represents amount of crop stored"
      />
    </Stack>
  );
}

export default StorageFacility;
