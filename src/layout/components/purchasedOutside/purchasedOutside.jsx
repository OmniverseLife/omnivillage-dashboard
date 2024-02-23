import { Box, Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import { getPurchasedFromMarketData } from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function PurchasedOutside({ type_id, weight_unit }) {
  const [searchParams] = useSearchParams();

  const { data: purchased_from_market = [], isLoading } = useQuery({
    queryKey: ["purchased from market", type_id, searchParams.get("village")],
    queryFn: () =>
      getPurchasedFromMarketData(type_id, searchParams.get("village")),
  });

  const data = {
    xAxis: purchased_from_market.map((_item) => _item.name),
    dataset: [
      {
        name: "Purchased From Outside",
        data: purchased_from_market.map((_item) =>
          weightConverter(weight_unit, _item.output)
        ),
      },
    ],
  };

  return (
    <Box width="48%">
      <Loading isLoading={isLoading} />
      <CustomBarChart
        header="Purchased From Outside"
        data={data}
        style={{ width: "100%" }}
      />
    </Box>
  );
}

export default PurchasedOutside;
