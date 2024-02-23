import { Box, Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import {
  getIdealConsumptionByLabelData,
  getIdealConsumptionExpectedData,
} from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function IdealQuantityDiet({ type_id, weight_unit }) {
  const [searchParams] = useSearchParams();

  const { data: ideal_consumption_bar = [], isIdealConsumptionBarLoading } =
    useQuery({
      queryKey: ["ideal_consumption_bar", searchParams.get("village")],
      queryFn: () =>
        getIdealConsumptionByLabelData(searchParams.get("village")),
    });

  // const {
  //   data: ideal_consumption_expected = [],
  //   isIdealConsumptionCropLoading,
  //   isFetching,
  // } = useQuery({
  //   queryKey: ["ideal_consumption_expected", type_id],
  //   queryFn: () => getIdealConsumptionExpectedData(type_id),
  // });

  const tags = ideal_consumption_bar.map((_item) => _item.label_name);

  const tagsData = {
    xAxis: tags,
    dataset: [
      {
        name: "Ideal Quantity To Be Consumed",
        data: ideal_consumption_bar.map((_item) =>
          weightConverter(weight_unit, _item.ideal_consumption)
        ),
      },
      {
        name: "Current Consumed Quantity",
        data: ideal_consumption_bar.map((_item) =>
          weightConverter(weight_unit, _item.total_consumed)
        ),
      },
    ],
  };

  // const labels = ideal_consumption_expected.map((_item) => _item.crop_name);

  // const quantityToBeConsumed = {
  //   labels: labels,
  //   datasets: [
  //     {
  //       label: "Ideal Quantity To Be Consumed",
  //       data: ideal_consumption_expected.map((_item) =>
  //         weightConverter(weight_unit, _item.ideal_consumption)
  //       ),
  //       backgroundColor: backgroundColor,
  //       borderColor: borderColor,
  //       borderWidth: 1,
  //     },
  //   ],
  // };
  // const currentlyQuantityConsumed = {
  //   labels: labels,
  //   datasets: [
  //     {
  //       label: "Currently Quantity Consumed",
  //       data: ideal_consumption_expected.map((_item) =>
  //         weightConverter(weight_unit, _item.total_consumed)
  //       ),
  //       backgroundColor: backgroundColor,
  //       borderColor: borderColor,
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      flexWrap={"wrap"}
      rowGap={5}
      width="48%"
    >
      <Loading
        isLoading={
          isIdealConsumptionBarLoading
          // isIdealConsumptionCropLoading ||
          // isFetching
        }
      />
      <Box width="100%">
        <CustomBarChart
          header="Ideal Quantity Consumption (Tags)"
          data={tagsData}
          // style={{ width: "100%" }}
        />
      </Box>
      {/* <CustomPieChart
        header="Ideal Quantity To Be Consumed"
        data={quantityToBeConsumed}
      />
      <CustomPieChart
        header="Current Consumed Quantity"
        data={currentlyQuantityConsumed}
      /> */}
    </Stack>
  );
}

export default IdealQuantityDiet;
