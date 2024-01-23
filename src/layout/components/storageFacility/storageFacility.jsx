import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";
import { Stack } from "@mui/material";
import { getStorageData } from "../../../functions/dashboard";
import { useQuery } from "@tanstack/react-query";
import Loading from "../loading";

function StorageFacility() {
  const { data, isLoading } = useQuery({
    queryKey: ["storage_data"],
    queryFn: getStorageData,
  });

  const grains = {
    labels: ["Bags", "Containers", "Piles", "Warehouse"],
    datasets: [
      {
        label: "Storage Facility Grains",
        data: [20, 20, 20, 20],
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
        data: [20, 50],
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
        data: [20, 50],
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
        data: [20, 20, 20, 20, 15],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Storage Facility Grains"
        data={grains}
        measurement={"80 km²"}
      />
      <CustomPieChart
        header="Storage Facility Poultry"
        data={poultry}
        measurement={"70 km²"}
      />
      <CustomPieChart
        header="Storage Facility Meat"
        data={meat}
        measurement={"70 km²"}
      />
      <CustomPieChart
        header="Storage Facility Fruits & Vegetables"
        data={fruits}
        measurement={"95 km²"}
      />
    </Stack>
  );
}

export default StorageFacility;
