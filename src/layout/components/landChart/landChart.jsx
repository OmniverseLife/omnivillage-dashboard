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

function LandChart({ land_unit }) {
  const { data: land_allocation, isLandAllocationLoading } = useQuery({
    queryKey: ["land_allocation"],
    queryFn: getLandAllocationData,
  });

  const { data: land_used, isLandUsedLoading } = useQuery({
    queryKey: ["land_used"],
    queryFn: getLandUsedData,
  });

  const data = {
    labels: ["Cultivation", "Fishery", "Poultry", "Storage", "trees"],
    datasets: [
      {
        label: "Land Allocated",
        data: [
          Math.round(land_allocation?.cultivation),
          Math.round(land_allocation?.fishery),
          Math.round(land_allocation?.poultry),
          Math.round(land_allocation?.storage),
          Math.round(land_allocation?.trees),
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
        label: "Land Allocated",
        data: [
          Math.round(land_used?.cultivation),
          Math.round(land_used?.fishery),
          Math.round(land_used?.poultry),
          Math.round(land_used?.storage),
          Math.round(land_used?.trees),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLandAllocationLoading || isLandUsedLoading} />
      <CustomPieChart
        header="Land Allocated"
        data={data}
        measurement={"100km"}
      />
      <CustomPieChart
        header="Land Used"
        data={usedLand}
        measurement={"100km"}
      />
      {/* <CustomPieChart
        header="Land Allocated (Tags)"
        data={tagData}
        measurement={"100km"}
      />
      <CustomPieChart
        header="Land Used (Tags)"
        data={tagData}
        measurement={"100km"}
      /> */}
    </Stack>
  );
}

export default LandChart;
