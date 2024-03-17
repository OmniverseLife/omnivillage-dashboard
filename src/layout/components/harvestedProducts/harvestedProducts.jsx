import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { getHarvestedProducts } from "../../../functions/dashboard";
import Loading from "../loading";
import { DataGrid } from "@mui/x-data-grid";
import CustomPieChart from "../customPieChart/customPieChart";

export default function HarvestedProducts({ category }) {
  const [searchParams] = useSearchParams();
  const { data, isLoading } = useQuery({
    queryKey: [
      "harvested-products",
      category,
      searchParams.get("village"),
      searchParams.get("product"),
      searchParams.get("crop"),
    ],
    queryFn: () => getHarvestedProducts(category, searchParams.get("product")),
  });

  const product_data = [
    {
      name: "Self Consumed",
      y: data?.self_consumed,
    },
    {
      name: "Fed to Livestock",
      y: data?.fed_to_livestock,
    },
    {
      name: "Sold to Neighbours",
      y: data?.sold_to_neighbours,
    },
    {
      name: "Sold for Industrial Use",
      y: data?.sold_to_industrial_use,
    },
    {
      name: "Wastage",
      y: data?.wastage,
    },
    {
      name: "Others",
      y: data?.other,
    },
  ];

  return (
    <div>
      <Loading isLoading={isLoading} />
      <CustomPieChart
        header="Harvested Product"
        measurement={""}
        helper_text="Each slice represents data in weights"
        data={product_data}
      />
    </div>
  );
}
