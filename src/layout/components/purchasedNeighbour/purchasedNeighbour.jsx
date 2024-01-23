import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import { getPurchasedFromNeighboursData } from "../../../functions/dashboard";
import Loading from "../loading";
function PurchasedNeighbour({ type_id }) {
  const { data: purchased_from_neighbour, isLoading } = useQuery({
    queryKey: ["purchased from neighbour", type_id],
    queryFn: () => getPurchasedFromNeighboursData(type_id),
  });

  const data = {
    labels: ["Almonds", "Cashew Nuts", "Walnuts", "Raisins", "Dates", "Figs"],
    datasets: [
      {
        label: "Purchased From Neighbours",
        data: [10, 40, 20, 30, 25, 35],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart header="Purchased From Neighbours" data={data} />
    </Stack>
  );
}

export default PurchasedNeighbour;
