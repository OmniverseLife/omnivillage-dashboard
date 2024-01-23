import { Stack } from "@mui/material";
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

function SelfGrown({ type_id }) {
  const { data: self_grown, isSelfGrownLoading } = useQuery({
    queryKey: ["self grown", type_id],
    queryFn: () => getSelfGrownByTagsData(type_id),
  });
  const { data: self_consumed, isSelfConsumedLoading } = useQuery({
    queryKey: ["self consumed", type_id],
    queryFn: () => getSelfConsumedData(type_id),
  });

  const selfGrownData = {
    labels: ["Almonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Self Grown",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const selfConsumedData = {
    labels: ["Almonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Self Consumed",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isSelfConsumedLoading || isSelfGrownLoading} />
      <CustomPieChart header="Self Grown" data={selfGrownData} />
      <CustomPieChart header="Self Consumed" data={selfConsumedData} />
    </Stack>
  );
}

export default SelfGrown;
