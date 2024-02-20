import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import { getConsumptionFromProductionData } from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";
import SelfGrown from "../selfGrown/selfGrown";
import PurchasedNeighbour from "../purchasedNeighbour/purchasedNeighbour";
import PurchasedOutside from "../purchasedOutside/purchasedOutside";
import IdealQuantityDiet from "../idealQuantityDiet/idealQuantityDiet";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function ConsumptionFromProduction({ crop_id, type_id, weight_unit }) {
  const { data: consumptionFromProduction, isLoading } = useQuery({
    queryKey: ["consumption-from-production", crop_id],
    queryFn: () => getConsumptionFromProductionData(type_id, crop_id),
    enabled: !!crop_id && !!type_id,
    // placeholderData: {
    //   self_grown: 0,
    //   self_consumed: 0,
    //   purchased_from_neighbours: 0,
    //   purchased_from_market: 0,
    // },
  });

  const data = {
    labels: [
      "Self Grown",
      "Self Consumed",
      "Purchased From Neighbours",
      "Purshased From Outside",
    ],
    datasets: [
      {
        label: "Consumption From Production",
        data: isLoading
          ? [0, 0, 0, 0]
          : [
              weightConverter(
                weight_unit,
                consumptionFromProduction?.self_grown
              ),
              weightConverter(
                weight_unit,
                consumptionFromProduction?.self_consumed
              ),
              weightConverter(
                weight_unit,
                consumptionFromProduction?.purchased_from_neighbours
              ),
              weightConverter(
                weight_unit,
                consumptionFromProduction?.purchased_from_market
              ),
            ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Stack
      direction={"row"}
      justifyContent={"center"}
      flexWrap={"wrap"}
      gap={"20px"}
    >
      <Loading isLoading={isLoading} />
      {crop_id ? (
        <CustomPieChart header="Individual Crop Consumption" data={data} />
      ) : (
        <>
          <SelfGrown type_id={type_id} weight_unit={weight_unit} />
          <PurchasedNeighbour type_id={type_id} weight_unit={weight_unit} />
          <PurchasedOutside type_id={type_id} weight_unit={weight_unit} />
          <IdealQuantityDiet type_id={type_id} weight_unit={weight_unit} />
        </>
      )}
    </Stack>
  );
}

export default ConsumptionFromProduction;
