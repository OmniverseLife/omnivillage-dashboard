import { Box, Stack, Typography } from "@mui/material";
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
    queryKey: ["organic-inorganic", searchParams.getAll("village"), category],
    queryFn: () =>
      getOrganicInOrganic(searchParams.getAll("village"), category),
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

  const fertilizer_pie_sum = Object.values(
    data?.fertilizer_data?.land_data || {}
  ).reduce((prev, _value) => prev + _value, 0);

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

  const fertilizer_bar_sum1 = Object.values(
    data?.fertilizer_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["organic purchased"], 0);

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

  const fertilizer_bar_sum2 = Object.values(
    data?.fertilizer_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["organic self made"], 0);

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

  const fertilizer_bar_sum3 = Object.values(
    data?.fertilizer_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["chemical based"], 0);

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

  const fertilizer_bar_sum4 = Object.values(
    data?.fertilizer_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["none"], 0);

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

  const pesticide_pie_sum = Object.values(
    data?.pesticide_data?.land_data || {}
  ).reduce((prev, _value) => prev + _value, 0);

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

  const pesticides_bar_sum1 = Object.values(
    data?.pesticide_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["organic purchased"], 0);

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

  const pesticides_bar_sum2 = Object.values(
    data?.pesticide_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["organic self made"], 0);

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

  const pesticides_bar_sum3 = Object.values(
    data?.pesticide_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["chemical based"], 0);

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

  const pesticides_bar_sum4 = Object.values(
    data?.pesticide_data?.crop_data || {}
  ).reduce((prev, _value) => prev + _value["none"], 0);

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={3}>
      <Loading isLoading={isLoading} />
      <Typography variant="h4">Fertilizers</Typography>
      {/* <Box width="50%"> */}
      <CustomPieChart
        data={pieDataFertilizer}
        header="Fertilizer Land Chart"
        style={{ margin: 0 }}
        helper_text={`Each slice represents number of ${
          category === "trees" ? "Trees" : "Land used"
        }`}
        measurement={`${fertilizer_pie_sum} km2`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataFertilizer}
        header="Fertilizer Crop Chart(Organic Purchased)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${fertilizer_bar_sum1}`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataFertilizer2}
        header="Fertilizer Crop Chart(Organic Self Made)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${fertilizer_bar_sum2}`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataFertilizer3}
        header="Fertilizer Crop Chart(Chemical Based)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${fertilizer_bar_sum3}`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataFertilizer4}
        header="Fertilizer Crop Chart(None)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${fertilizer_bar_sum4}`}
      />
      <Typography variant="h4">Pesticides</Typography>
      {/* </Box> */}
      <CustomPieChart
        data={pieDataPesticide}
        header="Pesticide Land Chart"
        style={{ margin: 0 }}
        helper_text={`Each slice represents number of ${
          category === "trees" ? "Trees" : "Land used"
        }`}
        measurement={`${pesticide_pie_sum} km2`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataPesticide}
        header="Pesticide Crop Chart(Organic Purchased)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${pesticides_bar_sum1}`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataPesticide2}
        header="Pesticide Crop Chart(Organic Self Made)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${pesticides_bar_sum2}`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataPesticide3}
        header="Pesticide Crop Chart(Chemical Based)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${pesticides_bar_sum3}`}
      />
      {/* </Box> */}
      {/* <Box width="48%"> */}
      <CustomBarChart
        data={barDataPesticide4}
        header="Pesticide Crop Chart(None)"
        helper_text="Each bar represents number of farmers"
        measurement={`Total - ${pesticides_bar_sum4}`}
      />
      {/* </Box> */}
    </Stack>
  );
}
