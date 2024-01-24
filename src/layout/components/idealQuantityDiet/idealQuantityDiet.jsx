import { Stack } from "@mui/material";
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

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function IdealQuantityDiet({ type_id, weight_unit }) {
  const { data: ideal_consumption_bar = [], isIdealConsumptionBarLoading } =
    useQuery({
      queryKey: ["ideal_consumption_bar"],
      queryFn: getIdealConsumptionByLabelData,
    });

  const {
    data: ideal_consumption_expected = [],
    isIdealConsumptionCropLoading,
    isFetching,
  } = useQuery({
    queryKey: ["ideal_consumption_expected", type_id],
    queryFn: () => getIdealConsumptionExpectedData(type_id),
  });

  const tags = ideal_consumption_bar.map((_item) => _item.label_name);

  const tagsData = {
    labels: tags,
    datasets: [
      {
        label: "Ideal Quantity To Be Consumed",
        data: ideal_consumption_bar.map((_item) =>
          weightConverter(weight_unit, _item.ideal_consumption)
        ),
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Current Consumed Quantity",
        data: ideal_consumption_bar.map((_item) =>
          weightConverter(weight_unit, _item.total_consumed)
        ),
        backgroundColor: backgroundColor[1],
      },
    ],
  };

  const labels = ideal_consumption_expected.map((_item) => _item.crop_name);

  const quantityToBeConsumed = {
    labels: labels,
    datasets: [
      {
        label: "Ideal Quantity To Be Consumed",
        data: ideal_consumption_expected.map((_item) =>
          weightConverter(weight_unit, _item.ideal_consumption)
        ),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const currentlyQuantityConsumed = {
    labels: labels,
    datasets: [
      {
        label: "Currently Quantity Consumed",
        data: ideal_consumption_expected.map((_item) =>
          weightConverter(weight_unit, _item.total_consumed)
        ),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading
        isLoading={
          isIdealConsumptionBarLoading ||
          isIdealConsumptionCropLoading ||
          isFetching
        }
      />
      <CustomBarChart
        header="Ideal Quantity Consumption (Tags)"
        data={tagsData}
      />
      <CustomPieChart
        header="Ideal Quantity To Be Consumed"
        data={quantityToBeConsumed}
      />
      <CustomPieChart
        header="Current Consumed Quantity"
        data={currentlyQuantityConsumed}
      />
    </Stack>
  );
}

export default IdealQuantityDiet;
