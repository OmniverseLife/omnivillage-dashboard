import { Box, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getOrganicInOrganic } from "../../../functions/dashboard";
import { useSearchParams } from "react-router-dom";
import Loading from "../loading";
import CustomPieChart from "../customPieChart/customPieChart";
import CustomBarChart from "../customBarChart/customBarChart";

export default function OrganicInorganic({ category }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["organic-inorganic", searchParams.get("village"), category],
    queryFn: () => getOrganicInOrganic(searchParams.get("village"), category),
  });

  const pieDataFertilizer = [
    {
      name: "Oragnic Purchased",
      y: data?.fertilizer_data?.land_data?.["organic purchased"],
    },
    {
      name: "Oragnic Self Made",
      y: data?.fertilizer_data?.land_data?.["organic self made"],
    },
    {
      name: "Chemical Based",
      y: data?.fertilizer_data?.land_data?.["chemical based"],
    },
    {
      name: "None",
      y: data?.fertilizer_data?.land_data?.["none"],
    },
  ];

  const barDataFertilizer = {
    xAxis: Object.keys(data?.fertilizer_data?.crop_data || {}),
    dataset: [
      {
        name: "Oragnic Purchased",
        data: Object.values(data?.fertilizer_data?.crop_data || {})?.map(
          (_data) => _data["organic purchased"]
        ),
      },
    ],
  };

  const barDataFertilizer2 = {
    xAxis: Object.keys(data?.fertilizer_data?.crop_data || {}),
    dataset: [
      {
        name: "Oragnic Self Made",
        data: Object.values(data?.fertilizer_data?.crop_data || {})?.map(
          (_data) => _data["organic self made"]
        ),
      },
    ],
  };

  const barDataFertilizer3 = {
    xAxis: Object.keys(data?.fertilizer_data?.crop_data || {}),
    dataset: [
      {
        name: "Chemical Based",
        data: Object.values(data?.fertilizer_data?.crop_data || {})?.map(
          (_data) => _data["chemical based"]
        ),
      },
    ],
  };

  const barDataFertilizer4 = {
    xAxis: Object.keys(data?.fertilizer_data?.crop_data || {}),
    dataset: [
      {
        name: "None",
        data: Object.values(data?.fertilizer_data?.crop_data || {})?.map(
          (_data) => _data["none"]
        ),
      },
    ],
  };

  const pieDataPesticide = [
    {
      name: "Oragnic Purchased",
      y: data?.pesticide_data?.land_data?.["organic purchased"],
    },
    {
      name: "Oragnic Self Made",
      y: data?.pesticide_data?.land_data?.["organic self made"],
    },
    {
      name: "Chemical Based",
      y: data?.pesticide_data?.land_data?.["chemical based"],
    },
    {
      name: "None",
      y: data?.pesticide_data?.land_data?.["none"],
    },
  ];

  const barDataPesticide = {
    xAxis: Object.keys(data?.pesticide_data?.crop_data || {}),
    dataset: [
      {
        name: "Oragnic Purchased",
        data: Object.values(data?.pesticide_data?.crop_data || {})?.map(
          (_data) => _data["organic purchased"]
        ),
      },
    ],
  };

  const barDataPesticide2 = {
    xAxis: Object.keys(data?.pesticide_data?.crop_data || {}),
    dataset: [
      {
        name: "Oragnic Self Made",
        data: Object.values(data?.pesticide_data?.crop_data || {})?.map(
          (_data) => _data["organic self made"]
        ),
      },
    ],
  };

  const barDataPesticide3 = {
    xAxis: Object.keys(data?.pesticide_data?.crop_data || {}),
    dataset: [
      {
        name: "Chemical Based",
        data: Object.values(data?.pesticide_data?.crop_data || {})?.map(
          (_data) => _data["chemical based"]
        ),
      },
    ],
  };

  const barDataPesticide4 = {
    xAxis: Object.keys(data?.pesticide_data?.crop_data || {}),
    dataset: [
      {
        name: "None",
        data: Object.values(data?.pesticide_data?.crop_data || {})?.map(
          (_data) => _data["none"]
        ),
      },
    ],
  };

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={3}>
      <Loading isLoading={isLoading} />
      {/* <Box width="50%"> */}
      <CustomPieChart
        data={pieDataFertilizer}
        header="Fertilizer Land Chart"
        style={{ margin: 0 }}
        helper_text={`Each slice represents number of ${
          category === "trees" ? "Trees" : "Land used"
        }`}
      />
      {/* </Box> */}
      <Box width="48%">
        <CustomBarChart
          data={barDataFertilizer}
          header="Fertilizer Crop Chart(Organic Purchased)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
      <Box width="48%">
        <CustomBarChart
          data={barDataFertilizer2}
          header="Fertilizer Crop Chart(Organic Self Made)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
      <Box width="48%">
        <CustomBarChart
          data={barDataFertilizer3}
          header="Fertilizer Crop Chart(Chemical Based)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
      <Box width="48%">
        <CustomBarChart
          data={barDataFertilizer4}
          header="Fertilizer Crop Chart(None)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
      <CustomPieChart
        data={pieDataPesticide}
        header="Pesticide Land Chart"
        style={{ margin: 0 }}
        helper_text={`Each slice represents number of ${
          category === "trees" ? "Trees" : "Land used"
        }`}
      />
      {/* </Box> */}
      <Box width="48%">
        <CustomBarChart
          data={barDataPesticide}
          header="Pesticide Crop Chart(Organic Purchased)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
      <Box width="48%">
        <CustomBarChart
          data={barDataPesticide2}
          header="Pesticide Crop Chart(Organic Self Made)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
      <Box width="48%">
        <CustomBarChart
          data={barDataPesticide3}
          header="Pesticide Crop Chart(Chemical Based)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
      <Box width="48%">
        <CustomBarChart
          data={barDataPesticide4}
          header="Pesticide Crop Chart(None)"
          helper_text="Each bar represents number of farmers"
        />
      </Box>
    </Stack>
  );
}
