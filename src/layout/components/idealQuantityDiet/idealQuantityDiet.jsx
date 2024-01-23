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

function IdealQuantityDiet({ type_id, weight_unit }) {
  const { data: ideal_consumption_bar, isIdealConsumptionBarLoading } =
    useQuery({
      queryKey: ["ideal_consumption_bar", type_id],
      queryFn: () => getIdealConsumptionByLabelData(type_id),
    });

  const { data: ideal_consumption_expected, isIdealConsumptionCropLoading } =
    useQuery({
      queryKey: ["ideal_consumption_bar", type_id],
      queryFn: () => getIdealConsumptionExpectedData(type_id),
    });

  const tags = [
    "Grains & Nuts",
    "Vegetables",
    "Herbs",
    "Legumes",
    "Fruits",
    "Dairy",
    "Meat",
    "Spices & Condiments",
    "DaiTea/Coffeery",
    "Oils",
    "Processed Food & Beverages",
    "Alcohol/Tobacco",
  ];

  const tagsData = {
    labels: tags,
    datasets: [
      {
        label: "Ideal Quantity To Be Consumed",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Current Consumed Quantity",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const quantityToBeConsumed = {
    labels: ["Almonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Ideal Quantity To Be Consumed",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const currentlyQuantityConsumed = {
    labels: ["Almonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Currently Quantity Consumed",
        data: [10, 40, 20, 30, 25, 35],
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
          isIdealConsumptionBarLoading || isIdealConsumptionCropLoading
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
