import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";
import { Stack } from "@mui/material";
import { getStorageData } from "../../../functions/dashboard";
import { useQuery } from "@tanstack/react-query";
import Loading from "../loading";
import convert from "convert-units";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function StorageFacility({ weight_unit }) {
  const { data, isLoading } = useQuery({
    queryKey: ["storage_data"],
    queryFn: getStorageData,
  });

  const grains = {
    labels: ["Bags", "Containers", "Piles", "Warehouse"],
    datasets: [
      {
        label: "Storage Facility Grains",
        data: [
          weightConverter(weight_unit, data?.grain?.bags ?? 0),
          weightConverter(weight_unit, data?.grain?.containers ?? 0),
          weightConverter(weight_unit, data?.grain?.piles ?? 0),
          weightConverter(weight_unit, data?.grain?.warehouse ?? 0),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const poultry = {
    labels: ["Common Storage", "Refrigeration"],
    datasets: [
      {
        label: "Storage Facility Poultry",
        data: [
          weightConverter(weight_unit, data?.poultry?.common_storage),
          weightConverter(weight_unit, data?.poultry?.refrigeration),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const meat = {
    labels: ["Common Storage", "Refrigeration"],
    datasets: [
      {
        label: "Storage Facility Meat",
        data: [
          weightConverter(weight_unit, data?.meat?.common_storage),
          weightConverter(weight_unit, data?.meat?.refrigeration),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const fruits = {
    labels: ["Bags", "Containers", "Freezing", "Drying", "Canning"],
    datasets: [
      {
        label: "Storage Facility Fruits",
        data: [
          weightConverter(weight_unit, data?.fruits?.bags),
          weightConverter(weight_unit, data?.fruits?.containers),
          weightConverter(weight_unit, data?.fruits?.freezing),
          weightConverter(weight_unit, data?.fruits?.drying),
          weightConverter(weight_unit, data?.fruits?.canning),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  // Sum

  const grains_sum = Object.values(data?.grains).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  const poultry_sum = Object.values(data?.poultry).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  const meat_sum = Object.values(data?.meat).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  const fruits_sum = Object.values(data?.fruits).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Storage Facility Grains"
        data={grains}
        measurement={`${grains_sum} ${weight_unit}`}
      />
      <CustomPieChart
        header="Storage Facility Poultry"
        data={poultry}
        measurement={`${poultry_sum} ${weight_unit}`}
      />
      <CustomPieChart
        header="Storage Facility Meat"
        data={meat}
        measurement={`${meat_sum} ${weight_unit}`}
      />
      <CustomPieChart
        header="Storage Facility Fruits & Vegetables"
        data={fruits}
        measurement={`${fruits_sum} ${weight_unit}`}
      />
    </Stack>
  );
}

export default StorageFacility;
