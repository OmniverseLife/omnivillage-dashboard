import { Box, Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import { getPurchasedFromNeighboursData } from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function PurchasedNeighbour({ type_id, weight_unit }) {
  const [searchParams] = useSearchParams();
  const { data: purchased_from_neighbour = [], isLoading } = useQuery({
    queryKey: [
      "purchased from neighbour",
      type_id,
      searchParams.get("village"),
    ],
    queryFn: () =>
      getPurchasedFromNeighboursData(type_id, searchParams.get("village")),
  });

  const data = {
    xAxis: purchased_from_neighbour.map((_item) => _item.name),
    dataset: [
      {
        name: "Purchased From Neighbours",
        data: purchased_from_neighbour.map((_item) =>
          weightConverter(weight_unit, _item.output)
        ),
      },
    ],
  };

  const purchased_from_neighbour_sum = purchased_from_neighbour.reduce(
    (prev, current) => prev + weightConverter(weight_unit, current.output),
    0
  );

  return (
    <Box width="48%">
      <Loading isLoading={isLoading} />
      <CustomBarChart
        header="Purchased From Neighbours"
        data={data}
        style={{ width: "100%" }}
        measurement={`${purchased_from_neighbour_sum} kgs`}
        helper_text="Each bar represents how much crop is purchased from neighbours"
      />
    </Box>
  );
}

export default PurchasedNeighbour;
