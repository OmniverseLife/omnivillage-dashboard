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
    queryKey: ["selling_channel", searchParams.getAll("village")],
    queryFn: () => getSellingChannelData(searchParams.getAll("village")),
  });

  const sellingChannel = [
    { name: "Local Market", y: data?.local_market },
    { name: "Agent", y: data?.agent },
    { name: "Ecommerce", y: data?.ecommerce },
    { name: "Export", y: data?.export },
    { name: "None", y: data?.none },
  ];

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
        helper_text="Each Slice represents number of farmers in each segment"
      />
    </Stack>
  );
}

export default SellingChannel;
