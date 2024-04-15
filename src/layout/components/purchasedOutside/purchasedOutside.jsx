import { Box, Stack } from "@mui/material";
import React, { useEffect } from "react";
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

function PurchasedOutside({ type_id, weight_unit, setSummary }) {
  const [searchParams] = useSearchParams();

  const { data: purchased_from_market = [], isLoading } = useQuery({
    queryKey: [
      "purchased from market",
      type_id,
      searchParams.getAll("village"),
    ],
    queryFn: () =>
      getPurchasedFromMarketData(type_id, searchParams.getAll("village")),
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

  const purchased_from_market_sum = purchased_from_market.reduce(
    (prev, current) => prev + weightConverter(weight_unit, current.output),
    0
  );

  useEffect(() => {
    setSummary((prev) => ({
      ...prev,
      purchased_from_market_sum,
    }));
  }, [purchased_from_market_sum, setSummary]);

  return (
    <Box width="100%">
      <Loading isLoading={isLoading} />
      <CustomBarChart
        header="Purchased From Outside"
        data={data}
        style={{ width: "100%" }}
        measurement={`${purchased_from_market_sum} kgs`}
        helper_text="The amount of crop purchased from outside"
      />
    </Box>
  );
}

export default PurchasedOutside;
