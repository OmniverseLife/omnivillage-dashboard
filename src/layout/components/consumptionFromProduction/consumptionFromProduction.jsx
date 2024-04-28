import { Box, Stack } from "@mui/material";
import React, { useState } from "react";
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
  const [summary_data, setSummaryData] = useState({
    self_grown_sum: 0,
    self_consumed_sum: 0,
    purchased_from_market_sum: 0,
    purchased_from_neighbour_sum: 0,
  });

  const { data: consumptionFromProduction, isLoading } = useQuery({
    queryKey: [
      "consumption-from-production",
      crop_id,
      type_id,
      searchParams.getAll("village"),
    ],
    queryFn: () =>
      getConsumptionFromProductionData(
        type_id,
        crop_id,
        searchParams.getAll("village")
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
    // {
    //   name: "Self Consumed",
    //   y:
    //     weightConverter(
    //       weight_unit,
    //       consumptionFromProduction?.self_consumed
    //     ) || 0,
    // },
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

  const crop_wise_sum = data.reduce((prev, current) => prev + current.y, 0);

  const summary_chart = [
    {
      name: "Self Grown",
      y: summary_data.self_grown_sum,
    },
    {
      name: "Purchased From Neighbours",
      y: summary_data.purchased_from_neighbour_sum,
    },
    {
      name: "Purshased From Outside",
      y: summary_data.purchased_from_market_sum,
    },
    // {
    //   name: "Self Consumed",
    //   y: summary_data.self_consumed_sum,
    // },
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
          measurement={`${crop_wise_sum} kgs`}
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
          <CustomPieChart
            header="Summary"
            data={summary_chart}
            measurement={`${summary_data.self_consumed_sum} kgs`}
            helper_text={`Each slice represents the amount ${
              searchParams.get("tag-name")
                ? `of ${searchParams.get("tag-name")} `
                : ""
            }procured from different sources${
              searchParams.get("tag-name") ? "" : " (for consumption)"
            }`}
          />
          <IdealQuantityDiet type_id={type_id} weight_unit={weight_unit} />
          <SelfGrown
            type_id={type_id}
            weight_unit={weight_unit}
            setSummary={setSummaryData}
          />
          <PurchasedNeighbour
            type_id={type_id}
            weight_unit={weight_unit}
            setSummary={setSummaryData}
          />
          <PurchasedOutside
            type_id={type_id}
            weight_unit={weight_unit}
            setSummary={setSummaryData}
          />
        </Stack>
      )}
    </Stack>
  );
}

export default ConsumptionFromProduction;
