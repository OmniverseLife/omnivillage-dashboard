import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomPieChart from "../customPieChart/customPieChart";
import { Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getSellingChannelData } from "../../../functions/dashboard";
import Loading from "../loading";
import { useSearchParams } from "react-router-dom";

function SellingChannel() {
  const [searchParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["selling_channel"],
    queryFn: () => getSellingChannelData(searchParams.get("village")),
  });

  const sellingChannel = {
    labels: ["Local Market", "Agent", "Ecommerce", "Export", "None"],
    datasets: [
      {
        label: "Selling Channel",
        data: [
          data?.local_market,
          data?.agent,
          data?.ecommerce,
          data?.export,
          data?.none,
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Selling Channel"
        data={sellingChannel}
        measurement={`Total ${Object.values(data || {}).reduce(
          (prev, current) => prev + current,
          0
        )}`}
      />
    </Stack>
  );
}

export default SellingChannel;
