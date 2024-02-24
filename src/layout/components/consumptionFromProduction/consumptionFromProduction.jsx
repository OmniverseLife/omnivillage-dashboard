import { Box, Stack } from "@mui/material";
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
import { useSearchParams } from "react-router-dom";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function ConsumptionFromProduction({ crop_id, type_id, weight_unit }) {
  const [searchParams] = useSearchParams();
  const { data: consumptionFromProduction, isLoading } = useQuery({
    queryKey: [
      "consumption-from-production",
      crop_id,
      type_id,
      searchParams.get("village"),
    ],
    queryFn: () =>
      getConsumptionFromProductionData(
        type_id,
        crop_id,
        searchParams.get("village")
      ),
    enabled: !!crop_id && !!type_id,
    // placeholderData: {
    //   self_grown: 0,
    //   self_consumed: 0,
    //   purchased_from_neighbours: 0,
    //   purchased_from_market: 0,
    // },
  });

  const data = [
    {
      name: "Self Grown",
      y:
        weightConverter(weight_unit, consumptionFromProduction?.self_grown) ||
        0,
    },
    {
      name: "Self Consumed",
      y:
        weightConverter(
          weight_unit,
          consumptionFromProduction?.self_consumed
        ) || 0,
    },
    {
      name: "Purchased From Neighbours",
      y:
        weightConverter(
          weight_unit,
          consumptionFromProduction?.purchased_from_neighbours
        ) || 0,
    },
    {
      name: "Purshased From Outside",
      y:
        weightConverter(
          weight_unit,
          consumptionFromProduction?.purchased_from_market
        ) || 0,
    },
  ];

  return (
    <Stack
      direction={"row"}
      justifyContent={"center"}
      flexWrap={"wrap"}
      gap={"20px"}
    >
      <Loading isLoading={isLoading} />
      {crop_id ? (
        <CustomPieChart
          header="Individual Crop Consumption"
          data={data}
          helper_text="Each slice represents amount of crop being consumed"
        />
      ) : (
        <Stack
          direction="row"
          flexWrap="wrap"
          width={"100%"}
          justifyContent="space-between"
          rowGap={5}
        >
          <SelfGrown type_id={type_id} weight_unit={weight_unit} />
          <PurchasedNeighbour type_id={type_id} weight_unit={weight_unit} />
          <PurchasedOutside type_id={type_id} weight_unit={weight_unit} />
          <IdealQuantityDiet type_id={type_id} weight_unit={weight_unit} />
        </Stack>
      )}
    </Stack>
  );
}

export default ConsumptionFromProduction;
