import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import {
  getBifurcatedCropData,
  getBifurcatedLabelData,
} from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

const BifurcatedChart = ({ crop_id, type_id, weight_unit, crops }) => {
  const { data: bifurcated_data_label, isBifurcatedDataLabelLoading } =
    useQuery({
      queryKey: ["bifurcated_data", type_id],
      queryFn: () => getBifurcatedLabelData(type_id),
    });

  const { data: bifurcated_data_crop, isBifurcatedDataCropLoading } = useQuery({
    queryKey: ["bifurcated_data_crop", crop_id],
    queryFn: () => getBifurcatedCropData(crop_id),
    enabled: Boolean(crop_id),
  });

  const singleCropInfo = {
    labels: [
      "Sold To Neighbour",
      "Self Consumed",
      "Sold To Market",
      "Fed To Livestock",
      "Wastage",
    ],
    datasets: [
      {
        label: `${
          crops?.find((_crop) => _crop._id === crop_id)?.name
        } Information`,
        data: [
          weightConverter(
            weight_unit,
            bifurcated_data_crop?.sold_to_neighbour ?? 0
          ),
          weightConverter(
            weight_unit,
            bifurcated_data_crop?.self_consumed ?? 0
          ),
          weightConverter(
            weight_unit,
            bifurcated_data_crop?.sold_to_market ?? 0
          ),
          weightConverter(
            weight_unit,
            bifurcated_data_crop?.fed_to_livestock ?? 0
          ),
          weightConverter(weight_unit, bifurcated_data_crop?.wastage ?? 0),
        ],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const cropData = {
    labels: bifurcated_data_label?.output.map((_item) => _item.crop_name) || [],
    datasets: [
      {
        label: "Quantity Produced",
        data:
          bifurcated_data_label?.output.map((_item) =>
            weightConverter(weight_unit, _item.output)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const soilHealthStable = {
    labels:
      bifurcated_data_label?.soil_health_stable.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Soil Health (Stable)",
        data:
          bifurcated_data_label?.soil_health_stable.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const soilHealthDecreasing = {
    labels:
      bifurcated_data_label?.soil_health_decreasing_yeild.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Soil Health (Decreasing Yeild)",
        data:
          bifurcated_data_label?.soil_health_decreasing_yeild.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const selfConsumed = {
    labels:
      bifurcated_data_label?.self_consumed.map((_item) => _item.crop_name) ||
      [],
    datasets: [
      {
        label: "Self Consumed",
        data:
          bifurcated_data_label?.self_consumed.map((_item) =>
            weightConverter(weight_unit, _item.self_consumed)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const soldToNeighbours = {
    labels:
      bifurcated_data_label?.sold_to_neighbour.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Sold To Neighbours",
        data:
          bifurcated_data_label?.sold_to_neighbour.map((_item) =>
            weightConverter(weight_unit, _item.sold_to_neighbour)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const soldToMarket = {
    labels:
      bifurcated_data_label?.sold_to_market.map((_item) => _item.crop_name) ||
      [],
    datasets: [
      {
        label: "Sold To Market",
        data:
          bifurcated_data_label?.sold_to_market.map((_item) =>
            weightConverter(weight_unit, _item.sold_to_market)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const fedToLiveStock = {
    labels:
      bifurcated_data_label?.fed_to_livestock.map((_item) => _item.crop_name) ||
      [],
    datasets: [
      {
        label: "Fed To Live Stock",
        data:
          bifurcated_data_label?.fed_to_livestock.map((_item) =>
            weightConverter(weight_unit, _item.fed_to_livestock)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const wastage = {
    labels:
      bifurcated_data_label?.wastage.map((_item) => _item.crop_name) || [],
    datasets: [
      {
        label: "Wastage",
        data:
          bifurcated_data_label?.wastage.map((_item) =>
            weightConverter(weight_unit, _item.wastage)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  // const processing = {
  //   labels: bifurcated_data_label?.wastage.map((_item) => _item.crop_name) ||
  //   [],
  //   datasets: [
  //     {
  //       label: "Processing",
  //       data: bifurcated_data_label?.wastage.map(
  //         (_item) => _item.wastage
  //       ) || [],
  //       backgroundColor: backgroundColor,
  //       borderColor: borderColor,
  //       borderWidth: 1,
  //     },
  //   ],
  // };
  const Organiclabels = [
    "Grains & Nuts",
    "Vegetables",
    "Herbs",
    "Legumes",
    "Fruits",
    "Dairy",
    "Meat",
    "Spices & Condiments",
    "DaiTea/Coffeery",
    "Oils",
    "Processed Food & Beverages",
    "Alcohol/Tobacco",
  ];

  const fertilizerData = {
    labels: Organiclabels,
    datasets: [
      {
        label: "Fertilizer A",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Fertilizer B",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };
  const OrganicPesticides = [
    "Grains & Nuts",
    "Vegetables",
    "Herbs",
    "Legumes",
    "Fruits",
    "Dairy",
    "Meat",
    "Spices & Condiments",
    "DaiTea/Coffeery",
    "Oils",
    "Processed Food & Beverages",
    "Alcohol/Tobacco",
  ];

  const pesticideData = {
    labels: OrganicPesticides,
    datasets: [
      {
        label: "Pesticide A",
        data: [40, 80, 60, 30, 20, 50, 70, 90, 35, 25, 20, 65],
        backgroundColor: backgroundColor[2],
      },
      {
        label: "Pesticide B",
        data: [20, 60, 90, 30, 70, 10, 20, 40, 35, 75, 20, 35],
        backgroundColor: backgroundColor[1],
      },
    ],
  };

  const fertilizerChemicalBasedCrops = {
    labels:
      bifurcated_data_label?.fertilizer_used_chemical_based.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Chemical Based",
        data:
          bifurcated_data_label?.fertilizer_used_chemical_based.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const fertilizerOrganicSelfMadeCrops = {
    labels:
      bifurcated_data_label?.fertilizer_used_organic_self_made.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Organic Self Made",
        data:
          bifurcated_data_label?.fertilizer_used_organic_self_made.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const fertilizerOrganicPurchasedCrops = {
    labels:
      bifurcated_data_label?.fertilizer_used_organic_purchased.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Organic Self Made",
        data:
          bifurcated_data_label?.fertilizer_used_organic_purchased.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const fertilizerNoneCrops = {
    labels:
      bifurcated_data_label?.fertilizer_used_none.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "None",
        data:
          bifurcated_data_label?.fertilizer_used_none.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  const pesticideChemicalBasedCrops = {
    labels:
      bifurcated_data_label?.pesticide_used_chemical_based.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Chemical Based",
        data:
          bifurcated_data_label?.pesticide_used_chemical_based.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const pesticideOrganicSelfMadeCrops = {
    labels:
      bifurcated_data_label?.pesticide_used_organic_self_made.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Organic Self Made",
        data:
          bifurcated_data_label?.pesticide_used_organic_self_made.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const pesticideOrganicPurchasedCrops = {
    labels:
      bifurcated_data_label?.pesticide_used_organic_purchased.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "Organic Self Made",
        data:
          bifurcated_data_label?.pesticide_used_organic_purchased.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const pesticideNoneCrops = {
    labels:
      bifurcated_data_label?.pesticide_used_none.map(
        (_item) => _item.crop_name
      ) || [],
    datasets: [
      {
        label: "None",
        data:
          bifurcated_data_label?.pesticide_used_none.map(
            (_item) => _item.count
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  const incomeByCrops = {
    labels: bifurcated_data_label?.income.map((_item) => _item.crop_name) || [],
    datasets: [
      {
        label: "Income Generated",
        data:
          bifurcated_data_label?.income.map((_item) =>
            Math.round(_item.income)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
  const expenditureByCrops = {
    labels:
      bifurcated_data_label?.expenditure.map((_item) => _item.crop_name) || [],
    datasets: [
      {
        label: "Expenditure",
        data:
          bifurcated_data_label?.expenditure.map((_item) =>
            Math.round(_item.expenditure)
          ) || [],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  // Sums of each section

  const single_crop_sum = Object.values(bifurcated_data_crop || {}).reduce(
    (prev, current) => prev + weightConverter(weight_unit, current),
    0
  );

  const quantity_produced_sum = bifurcated_data_label?.output.reduce(
    (prev, current) => prev + weightConverter(weight_unit, current.output),
    0
  );

  const soil_health_stable_sum =
    bifurcated_data_label?.soil_health_stable.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const soil_health_decreasing_yeild_sum =
    bifurcated_data_label?.soil_health_decreasing_yeild.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const self_consumed_sum = bifurcated_data_label?.self_consumed.reduce(
    (prev, current) =>
      prev + weightConverter(weight_unit, current.self_consumed),
    0
  );

  const sold_to_neighbour_sum = bifurcated_data_label?.sold_to_neighbour.reduce(
    (prev, current) =>
      prev + weightConverter(weight_unit, current.sold_to_neighbour),
    0
  );

  const sold_to_market_sum = bifurcated_data_label?.sold_to_market.reduce(
    (prev, current) =>
      prev + weightConverter(weight_unit, current.sold_to_market),
    0
  );

  const fed_to_livestock_sum = bifurcated_data_label?.fed_to_livestock.reduce(
    (prev, current) =>
      prev + weightConverter(weight_unit, current.fed_to_livestock),
    0
  );

  const wastage_sum = bifurcated_data_label?.wastage.reduce(
    (prev, current) => prev + weightConverter(weight_unit, current.wastage),
    0
  );

  const fertilizer_used_chemical_based_sum =
    bifurcated_data_label?.fertilizer_used_chemical_based.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const fertilizer_used_organic_self_made_sum =
    bifurcated_data_label?.fertilizer_used_organic_self_made.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const fertilizer_used_organic_purchased_sum =
    bifurcated_data_label?.fertilizer_used_organic_purchased.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const fertilizer_used_none_sum =
    bifurcated_data_label?.fertilizer_used_none.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const pesticide_used_chemical_based_sum =
    bifurcated_data_label?.pesticide_used_chemical_based.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const pesticide_used_organic_self_made_sum =
    bifurcated_data_label?.pesticide_used_organic_self_made.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const pesticide_used_organic_purchased_sum =
    bifurcated_data_label?.pesticide_used_organic_purchased.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const pesticide_used_none_sum =
    bifurcated_data_label?.pesticide_used_none.reduce(
      (prev, current) => prev + current.count,
      0
    );

  const income_sum = bifurcated_data_label?.income.reduce(
    (prev, current) => prev + Math.round(current.income),
    0
  );

  const expenditure_sum = bifurcated_data_label?.expenditure.reduce(
    (prev, current) => prev + Math.round(current.expenditure),
    0
  );

  return (
    <Stack direction={"row"} justifyContent={"space-between"} flexWrap={"wrap"}>
      <Loading
        isLoading={isBifurcatedDataCropLoading || isBifurcatedDataLabelLoading}
      />
      {crop_id ? (
        <CustomPieChart
          header={`${crops
            ?.find((_crop) => _crop._id === crop_id)
            ?.name.toUpperCase()} Information`}
          data={singleCropInfo}
          measurement={`${single_crop_sum} ${weight_unit}`}
        />
      ) : (
        <>
          <CustomPieChart
            header="Quantity Produced"
            data={cropData}
            measurement={`${quantity_produced_sum} ${weight_unit}`}
          />
          {/* <CustomPieChart
            header="Self Consumed"
            data={selfConsumed}
            measurement={"100km"}
          /> */}
          <CustomPieChart
            header="Soil Health (Stable)"
            data={soilHealthStable}
            measurement={soil_health_stable_sum}
          />
          <CustomPieChart
            header="Soil Health (Decreasing Yeild)"
            data={soilHealthDecreasing}
            measurement={soil_health_decreasing_yeild_sum}
          />
          <CustomPieChart
            header="Self Consumed"
            data={selfConsumed}
            measurement={`${self_consumed_sum} ${weight_unit}`}
          />
          <CustomPieChart
            header="Sold To Neighbours"
            data={soldToNeighbours}
            measurement={`${sold_to_neighbour_sum} ${weight_unit}`}
          />
          <CustomPieChart
            header="Sold To Market"
            data={soldToMarket}
            measurement={`${sold_to_market_sum} ${weight_unit}`}
          />
          <CustomPieChart
            header="Fed To Live Stock"
            data={fedToLiveStock}
            measurement={`${fed_to_livestock_sum} ${weight_unit}`}
          />
          <CustomPieChart
            header="Wastage"
            data={wastage}
            measurement={`${wastage_sum} ${weight_unit}`}
          />
          <CustomPieChart
            header="Income By Crops"
            data={incomeByCrops}
            measurement={`${income_sum} USD`}
          />
          <CustomPieChart
            header="Expenditure By Crops"
            data={expenditureByCrops}
            measurement={`${expenditure_sum} USD`}
          />
          {/* <CustomPieChart
            header="Processing"
            data={processing}
            measurement={"Count 100"}
          /> */}
          {/* <CustomBarChart header="Organic Fertilizer" data={fertilizerData} /> */}
          <CustomPieChart
            header="Fertilizer - Chemical Based"
            data={fertilizerChemicalBasedCrops}
            measurement={fertilizer_used_chemical_based_sum}
          />
          <CustomPieChart
            header="Fertilizer - Organic Purchased"
            data={fertilizerOrganicPurchasedCrops}
            measurement={fertilizer_used_organic_purchased_sum}
          />
          <CustomPieChart
            header="Fertilizer - Organic Self Made"
            data={fertilizerOrganicSelfMadeCrops}
            measurement={fertilizer_used_organic_self_made_sum}
          />
          <CustomPieChart
            header="Fertilizer - None"
            data={fertilizerNoneCrops}
            measurement={fertilizer_used_none_sum}
          />
          {/* <CustomBarChart header="Organic Pesticides" data={pesticideData} /> */}
          <CustomPieChart
            header="Pesticide - Chemical Based"
            data={pesticideChemicalBasedCrops}
            measurement={pesticide_used_chemical_based_sum}
          />
          <CustomPieChart
            header="Pesticide - Organic Purchased"
            data={pesticideOrganicPurchasedCrops}
            measurement={pesticide_used_organic_purchased_sum}
          />
          <CustomPieChart
            header="Pesticide - Organic Self Made"
            data={pesticideOrganicSelfMadeCrops}
            measurement={pesticide_used_organic_self_made_sum}
          />
          <CustomPieChart
            header="Pesticide - None"
            data={pesticideNoneCrops}
            measurement={pesticide_used_none_sum}
          />
        </>
      )}
    </Stack>
  );
};
export default BifurcatedChart;
