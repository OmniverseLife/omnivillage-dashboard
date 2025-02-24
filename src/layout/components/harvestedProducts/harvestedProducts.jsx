import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { getHarvestedProducts } from "../../../functions/dashboard";
import Loading from "../loading";
import { DataGrid } from "@mui/x-data-grid";
import convert from "convert-units";
import CustomPieChart from "../customPieChart/customPieChart";

const weightConverter = (unit, value) => {
    return Math.round(convert(value).from("kg").to(unit));
};

export default function HarvestedProducts({ category, weight_unit }) {
    const [searchParams] = useSearchParams();
    const { data, isLoading } = useQuery({
        queryKey: [
            "harvested-products",
            category,
            searchParams.get("product"),
            searchParams.get("crop"),
        ],
        queryFn: () =>
            getHarvestedProducts(category, searchParams.get("product")),
        enabled:
            Boolean(searchParams.get("product")) &&
            searchParams.get("product") !== "undefined",
    });

    const product_data = [
        {
            name: "Self Consumed",
            y: weightConverter(weight_unit, data?.self_consumed),
        },
        {
            name: "Fed to Livestock",
            y: weightConverter(weight_unit, data?.fed_to_livestock),
        },
        {
            name: "Sold to Neighbours",
            y: weightConverter(weight_unit, data?.sold_to_neighbours),
        },
        {
            name: "Sold for Industrial Use",
            y: weightConverter(weight_unit, data?.sold_for_industrial_use),
        },
        {
            name: "Wastage",
            y: weightConverter(weight_unit, data?.wastage),
        },
        {
            name: "Others",
            y: weightConverter(weight_unit, data?.other),
        },
    ];

    const total = product_data.reduce(
        (prev, current) => prev + (current.y || 0),
        0
    );

    return (
        <div>
            <Loading isLoading={isLoading} />
            <CustomPieChart
                header="Harvested Product"
                measurement={`Total quantity: ${total} ${weight_unit}`}
                helper_text={`Each slice represents data in weights (${weight_unit})`}
                data={product_data}
            />
        </div>
    );
}
