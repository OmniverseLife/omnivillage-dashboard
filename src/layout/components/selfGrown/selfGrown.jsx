import { Box, Stack } from "@mui/material";
import React from "react";
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

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

function SelfGrown({ type_id, weight_unit }) {
  const { data: self_grown = [], isSelfGrownLoading } = useQuery({
    queryKey: ["self grown", type_id],
    queryFn: () => getSelfGrownByTagsData(type_id),
  });
  const { data: self_consumed = [], isSelfConsumedLoading } = useQuery({
    queryKey: ["self consumed", type_id],
    queryFn: () => getSelfConsumedData(type_id),
  });

  const selfGrownData = {
    labels: self_grown
      .map((_item) => _item.name)
      .sort((a, b) => a.localeCompare(b)),
    datasets: [
      {
        label: "Self Grown",
        data: self_grown.map((_item) =>
          weightConverter(weight_unit, _item.output)
        ),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const selfConsumedData = {
    labels: self_consumed
      .map((_item) => _item.name)
      .sort((a, b) => a.localeCompare(b)),
    datasets: [
      {
        label: "Self Consumed",
        data: self_consumed.map((_item) =>
          weightConverter(weight_unit, _item.output)
        ),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    // <Box width={"100%"}>
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      flexWrap={"wrap"}
      width={"100%"}
    >
      <Loading isLoading={isSelfConsumedLoading || isSelfGrownLoading} />
      <CustomBarChart header="Self Grown" data={selfGrownData} />
      <CustomBarChart header="Self Consumed" data={selfConsumedData} />
    </Stack>
    // </Box>
  );
}

export default SelfGrown;
