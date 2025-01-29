import { Stack } from "@mui/material";
import React from "react";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomAreaChart from "../customAreaChart/customAreaChart";
import CustomPieChart from "../customPieChart/customPieChart";
import { useQuery } from "@tanstack/react-query";
import {
    getIncomeExpenditureData,
    getSoilHealth,
} from "../../../functions/dashboard";
import Loading from "../loading";
import { useSearchParams } from "react-router-dom";
import convert from "convert-units";

const landConverter = (unit, value) => {
    return convert(value).from("km2").to(unit);
};

function SoilHealth({ land_unit }) {
    const [searchParams] = useSearchParams();

    const { data: { aggregate, crop_data } = [], isLoading } = useQuery({
        queryKey: ["soil_health", searchParams.getAll("village")],
        queryFn: () => getSoilHealth(searchParams.getAll("village")),
    });

    const soilHealthData = [
        {
            name: "Stable",
            y: landConverter(land_unit, aggregate?.soil_health?.stable),
        },
        {
            name: "Decreasing Yeild",
            y: landConverter(
                land_unit,
                aggregate?.soil_health?.decreasing_yeild
            ),
        },
    ];

    const soil_health_sum = Object.values(aggregate?.soil_health || {})?.reduce(
        (prev, _value) => prev + landConverter(land_unit, _value),
        0
    );

    console.log(aggregate);

    const crop_area_chart = {
        xAxis: crop_data?.map((_item) => _item.crop_name),
        dataset: [
            {
                name: "Stable",
                data: crop_data?.map((_item) =>
                    landConverter(land_unit, _item.stable)
                ),
                color: "#8579D1",
            },
            {
                name: "Decreasing Yeild",
                data: crop_data?.map((_item) =>
                    landConverter(land_unit, _item.decreasing_yeild)
                ),
                color: "#6CC3FC",
            },
        ],
    };

    return (
        <Stack
            direction={"row"}
            justifyContent={"space-between"}
            flexWrap={"wrap"}
        >
            <Loading isLoading={isLoading} />
            <CustomPieChart
                header="Soil Health"
                data={soilHealthData}
                helper_text={`Each slice represents ${
                    aggregate?.soil_health?.type !== "tree"
                        ? "amount of land"
                        : "number of crops"
                }`}
                measurement={`${soil_health_sum} ${land_unit}`}
            />
            <CustomAreaChart
                header="Soil health based on cultivated crop"
                data={crop_area_chart}
                helper_text="Each point represents land under cultivated crop"
                // style={{ width: "100%" }}
            />
        </Stack>
    );
}

export default SoilHealth;
