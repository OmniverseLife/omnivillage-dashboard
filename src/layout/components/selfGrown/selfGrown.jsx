import { Box, Stack } from "@mui/material";
import React, { useEffect } from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import {
  getSelfConsumedData,
  getSelfGrownByTagsData,
} from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function SelfGrown({ type_id, weight_unit, setSummary }) {
  const [searchParams] = useSearchParams();
  const { data: self_grown = [], isSelfGrownLoading } = useQuery({
    queryKey: ["self grown", type_id, searchParams.getAll("village")],
    queryFn: () =>
      getSelfGrownByTagsData(type_id, searchParams.getAll("village")),
  });
  const { data: self_consumed = [], isSelfConsumedLoading } = useQuery({
    queryKey: ["self consumed", type_id, searchParams.getAll("village")],
    queryFn: () => getSelfConsumedData(type_id, searchParams.getAll("village")),
  });

  const selfGrownData = {
    xAxis: self_grown
      .map((_item) => _item.name)
      .sort((a, b) => a.localeCompare(b)),
    dataset: [
      {
        name: "Self Grown",
        data: self_grown.map((_item) =>
          weightConverter(weight_unit, _item.output)
        ),
      },
    ],
  };

  const self_grown_sum = self_grown.reduce(
    (prev, current) => prev + weightConverter(weight_unit, current.output),
    0
  );

  const selfConsumedData = {
    xAxis: self_consumed
      .map((_item) => _item.name)
      .sort((a, b) => a.localeCompare(b)),
    dataset: [
      {
        name: "Self Consumed",
        data: self_consumed.map((_item) =>
          weightConverter(weight_unit, _item.output)
        ),
      },
    ],
  };

  const self_consumed_sum = self_consumed.reduce(
    (prev, current) => prev + weightConverter(weight_unit, current.output),
    0
  );

  useEffect(() => {
    setSummary((prev) => ({
      ...prev,
      self_grown_sum,
      self_consumed_sum,
    }));
  }, [self_consumed_sum, self_grown_sum, setSummary]);

  return (
    // <Box width={"100%"}>
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      flexWrap={"wrap"}
      // gap={2}
      width={"100%"}
    >
      <Loading isLoading={isSelfConsumedLoading || isSelfGrownLoading} />
      <Box width="48%">
        <CustomBarChart
          header="Self Grown"
          data={selfGrownData}
          measurement={`${self_grown_sum} kgs`}
          helper_text="Each bar represents how much crop is self grown"
        />
      </Box>
      <Box width="48%">
        <CustomBarChart
          header="Self Consumed"
          data={selfConsumedData}
          measurement={`${self_consumed_sum} kgs`}
          helper_text="Each bar represents how much crop is self consumed"
        />
      </Box>
    </Stack>
    // </Box>
  );
}

export default SelfGrown;
