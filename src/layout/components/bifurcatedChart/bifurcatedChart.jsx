import { Stack } from "@mui/material";
import React from "react";
import CustomPieChart from "../customPieChart/customPieChart";
import { backgroundColor, borderColor } from "../../pages/dashboard/production";
import CustomBarChart from "../customBarChart/customBarChart";
import { useQuery } from "@tanstack/react-query";
import {
  getBifurcatedCropData,
  getBifurcatedLabelData,
  getOtherInformations,
  getProcessingMethod,
} from "../../../functions/dashboard";
import Loading from "../loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";

const weightConverter = (unit, value) => {
  return Math.round(convert(value).from("kg").to(unit));
};

const BifurcatedChart = ({ weight_unit, crops }) => {
  const [searchParams] = useSearchParams();

  const crop_id = searchParams.get("crop");
  const type_id = searchParams.get("label");

  const {
    data: bifurcated_data_label,
    isLoading: isBifurcatedDataLabelLoading,
    isFetching: isBifurcatedDataLabelFetching,
  } = useQuery({
    queryKey: ["bifurcated_data", type_id],
    queryFn: () => getBifurcatedLabelData(type_id, searchParams.get("village")),
  });

  const {
    data: bifurcated_data_crop,
    isLoading: isBifurcatedDataCropLoading,
    isFetching: isBifurcatedDataCropFetching,
  } = useQuery({
    queryKey: ["bifurcated_data_crop", crop_id],
    queryFn: () => getBifurcatedCropData(crop_id, searchParams.get("village")),
    enabled: Boolean(crop_id),
  });

  const {
    data: processing_methods,
    isLoading: isProcessingMethodLoading,
    isFetching: isProcessingMethodFetching,
  } = useQuery({
    queryKey: ["processing_method", crop_id],
    queryFn: () => getProcessingMethod(crop_id, searchParams.get("village")),
    enabled: Boolean(crop_id),
  });

  const {
    data: other_informations,
    isLoading: is_other_info_loading,
    isFetching: is_other_info_fetching,
  } = useQuery({
    queryKey: ["other_informations", crop_id],
    queryFn: () => getOtherInformations(crop_id, searchParams.get("village")),
    enabled: Boolean(crop_id),
  });

  const singleCropInfo = [
    {
      name: "Sold To Neighbour",
      y: weightConverter(
        weight_unit,
        bifurcated_data_crop?.sold_to_neighbour ?? 0
      ),
    },
    {
      name: "Self Consumed",
      y: weightConverter(weight_unit, bifurcated_data_crop?.self_consumed ?? 0),
    },
    {
      name: "Sold To Market",
      y: weightConverter(
        weight_unit,
        bifurcated_data_crop?.sold_to_market ?? 0
      ),
    },

    {
      name: "Fed To Livestock",
      y: weightConverter(
        weight_unit,
        bifurcated_data_crop?.fed_to_livestock ?? 0
      ),
    },
    {
      name: "Wastage",
      y: weightConverter(weight_unit, bifurcated_data_crop?.wastage ?? 0),
    },
  ];

  const singleCropIncomeInfo = {
    xAxis: ["Income", "Expenditure"],
    dataset: [
      {
        name: crops?.find((_crop) => _crop._id === crop_id)?.name.toUpperCase(),
        data: [bifurcated_data_crop?.income, bifurcated_data_crop?.expenditure],
      },
    ],
  };

  const cropFertilizers = {
    xAxis: ["Organic Purchased", "Organic Self Made", "Chemical Based", "None"],
    dataset: [
      {
        name: crops?.find((_crop) => _crop._id === crop_id)?.name.toUpperCase(),
        data: [
          bifurcated_data_crop?.fertilizer_used?.organic_purchased,
          bifurcated_data_crop?.fertilizer_used?.organic_self_made,
          bifurcated_data_crop?.fertilizer_used?.chemical_based,
          bifurcated_data_crop?.fertilizer_used?.none,
        ],
      },
    ],
  };

  const cropPesticides = {
    xAxis: ["Organic Purchased", "Organic Self Made", "Chemical Based", "None"],
    dataset: [
      {
        name: crops?.find((_crop) => _crop._id === crop_id)?.name.toUpperCase(),
        data: [
          bifurcated_data_crop?.pesticide_used?.organic_purchased,
          bifurcated_data_crop?.pesticide_used?.organic_self_made,
          bifurcated_data_crop?.pesticide_used?.chemical_based,
          bifurcated_data_crop?.pesticide_used?.none,
        ],
      },
    ],
  };

  const cropAvgAgeTrees = {
    xAxis: [
      "0 to 5 years",
      "5 to 10 years",
      "10 to 20 years",
      "20 to 30 years",
      "30 to 50 years",
      "50 to 70 years",
      "Above 70",
    ],
    dataset: [
      {
        name: crops?.find((_crop) => _crop._id === crop_id)?.name.toUpperCase(),
        data: [
          other_informations?.data?.["0 to 5 years"] || 0,
          other_informations?.data?.["5 to 10 years"] || 0,
          other_informations?.data?.["10 to 20 years"] || 0,
          other_informations?.data?.["20 to 30 years"] || 0,
          other_informations?.data?.["30 to 50 years"] || 0,
          other_informations?.data?.["50 to 70 years"] || 0,
          other_informations?.data?.["Above 70"] || 0,
        ],
      },
    ],
  };

  const processing_method_rows = processing_methods?.map(
    (_processing_method, index) => ({
      id: index + 1,
      crop_name: _processing_method.crop_name,
      user: `${_processing_method.user_first_name} ${_processing_method.user_last_name}`,
      processing_method: _processing_method.processing_method,
    })
  );

  const processing_method_columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "crop_name", headerName: "Crop Name", width: 150 },
    { field: "user", headerName: "User's Name", width: 200 },
    { field: "processing_method", headerName: "Description", width: 200 },
  ];

  const product_rows = other_informations?.products?.map((_product, index) => ({
    id: index + 1,
    product_name: _product.name,
  }));

  const product_columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "product_name", headerName: "Product Name", width: 200 },
  ];

  const cropData = {
    xAxis: bifurcated_data_label?.output.map((_item) => _item.name) || [],
    dataset: [
      {
        name: "Quantity Produced",
        data:
          bifurcated_data_label?.output.map((_item) =>
            weightConverter(weight_unit, _item.output)
          ) || [],
      },
    ],
  };

  const selfConsumed = {
    xAxis:
      bifurcated_data_label?.self_consumed.map((_item) => _item.name) || [],
    dataset: [
      {
        label: "Self Consumed",
        data:
          bifurcated_data_label?.self_consumed.map((_item) =>
            weightConverter(weight_unit, _item.self_consumed)
          ) || [],
      },
    ],
  };

  const soldToNeighbours = {
    xAxis:
      bifurcated_data_label?.sold_to_neighbour.map((_item) => _item.name) || [],
    dataset: [
      {
        label: "Sold To Neighbours",
        data:
          bifurcated_data_label?.sold_to_neighbour.map((_item) =>
            weightConverter(weight_unit, _item.sold_to_neighbour)
          ) || [],
      },
    ],
  };

  const soldToMarket = {
    xAxis:
      bifurcated_data_label?.sold_to_market.map((_item) => _item.name) || [],
    dataset: [
      {
        label: "Sold To Market",
        data:
          bifurcated_data_label?.sold_to_market.map((_item) =>
            weightConverter(weight_unit, _item.sold_to_market)
          ) || [],
      },
    ],
  };

  const fedToLiveStock = {
    xAxis:
      bifurcated_data_label?.fed_to_livestock.map((_item) => _item.name) || [],
    dataset: [
      {
        label: "Fed To Live Stock",
        data:
          bifurcated_data_label?.fed_to_livestock.map((_item) =>
            weightConverter(weight_unit, _item.fed_to_livestock)
          ) || [],
      },
    ],
  };

  const wastage = {
    xAxis: bifurcated_data_label?.wastage.map((_item) => _item.name) || [],
    dataset: [
      {
        label: "Wastage",
        data:
          bifurcated_data_label?.wastage.map((_item) =>
            weightConverter(weight_unit, _item.wastage)
          ) || [],
      },
    ],
  };

  const incomeByCrops = {
    xAxis: bifurcated_data_label?.income.map((_item) => _item.name) || [],
    dataset: [
      {
        label: "Income Generated",
        data:
          bifurcated_data_label?.income.map((_item) =>
            Math.round(_item.income)
          ) || [],
      },
    ],
  };
  const expenditureByCrops = {
    xAxis: bifurcated_data_label?.expenditure.map((_item) => _item.name) || [],
    dataset: [
      {
        label: "Expenditure",
        data:
          bifurcated_data_label?.expenditure.map((_item) =>
            Math.round(_item.expenditure)
          ) || [],
      },
    ],
  };

  // Sums of each section

  const single_crop_sum = Object.values(bifurcated_data_crop || {}).reduce(
    (prev, current) => {
      if (typeof current === "number")
        return prev + weightConverter(weight_unit, current);
      return prev;
    },
    0
  );

  const quantity_produced_sum = bifurcated_data_label?.output.reduce(
    (prev, current) => prev + weightConverter(weight_unit, current.output),
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

  const income_sum = bifurcated_data_label?.income.reduce(
    (prev, current) => prev + Math.round(current.income),
    0
  );

  const expenditure_sum = bifurcated_data_label?.expenditure.reduce(
    (prev, current) => prev + Math.round(current.expenditure),
    0
  );

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      flexWrap={"wrap"}
      rowGap={5}
    >
      <Loading
        isLoading={
          is_other_info_fetching ||
          isBifurcatedDataLabelLoading ||
          isBifurcatedDataLabelFetching ||
          is_other_info_loading ||
          isBifurcatedDataCropLoading ||
          isBifurcatedDataCropFetching ||
          isProcessingMethodLoading ||
          isProcessingMethodFetching
        }
      />
      {crop_id ? (
        <>
          <CustomPieChart
            header={`${crops
              ?.find((_crop) => _crop._id === crop_id)
              ?.name.toUpperCase()} Information`}
            data={singleCropInfo}
            measurement={`${single_crop_sum} ${weight_unit}`}
          />
          <div
            style={{
              width: "48%",
              fontFamily: "inherit",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #4b465c1f",
              padding: "15px 30px",
              alignItems: "center",
            }}
          >
            <h3>Important Information</h3>
            <div style={{ width: "100%", marginTop: 40 }}>
              <p style={{ marginBottom: 20 }}>
                <strong
                  style={{
                    fontWeight: "500",
                    marginRight: 10,
                  }}
                >
                  Area Allocated:
                </strong>{" "}
                {bifurcated_data_crop?.area_allocated || "-"} km<sup>2</sup>
              </p>
              <p>
                <strong style={{ fontWeight: "500", marginRight: 10 }}>
                  Average Number
                  <br />
                  (Planted/Hunted/Domesticated):
                </strong>{" "}
                {bifurcated_data_crop?.avg_number || "-"}
              </p>
              {!other_informations?.type ? (
                other_informations?.crop_type?.includes("fish") ? (
                  <p>
                    <strong>
                      Total Number of Fishes from{" "}
                      {other_informations?.crop_type?.includes("river")
                        ? "river"
                        : "pond"}
                      :{" "}
                    </strong>
                    {other_informations?.data?.[0]?.count}
                  </p>
                ) : other_informations?.crop_type === "hunting" ? (
                  <p>
                    <strong>Total Number of Huntings: </strong>
                    {other_informations?.data?.[0]?.count}
                  </p>
                ) : other_informations?.crop_type === "poultry" ? (
                  <>
                    <p>
                      <strong>Total Number of poultries: </strong>
                      {other_informations?.data?.[0]?.count}
                    </p>
                    <p>
                      <strong>Average age of poultries: </strong>
                      {other_informations?.data?.[0]?.average} years
                    </p>
                  </>
                ) : null
              ) : null}
              <p>
                <strong>Average yeild: </strong>
                {bifurcated_data_crop?.yeild || "-"}
              </p>
              {/* <p>
                <strong>Expenditure Incurred:</strong>{" "}
                {bifurcated_data_crop?.expenditure || "-"}
              </p>
              <p>
                <strong>Income From Sale:</strong>{" "}
                {bifurcated_data_crop?.income || "-"}
              </p> */}
            </div>
          </div>
          <CustomBarChart
            header="Income & Expenditure"
            data={singleCropIncomeInfo}
          />
          {other_informations?.type === "chart" && (
            <CustomBarChart
              header="Average age of trees"
              data={cropAvgAgeTrees}
              helper_text="Each bar represents number of crops"
            />
          )}
          <CustomBarChart header="Fertilizers" data={cropFertilizers} />
          <CustomBarChart header="Pesticides" data={cropPesticides} />
          {processing_methods?.length && (
            <div style={{ width: "100%" }}>
              <h4 style={{ marginBottom: 10 }}>Processing Method</h4>
              <DataGrid
                rows={processing_method_rows}
                columns={processing_method_columns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10]}
              />
            </div>
          )}
          {other_informations?.products?.length && (
            <div style={{ width: "100%" }}>
              <h4 style={{ marginBottom: 10 }}>Products</h4>
              <DataGrid
                rows={product_rows}
                columns={product_columns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10]}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <CustomBarChart
            header="Quantity Produced"
            data={cropData}
            measurement={`${quantity_produced_sum} ${weight_unit}`}
          />
          <CustomBarChart
            header="Self Consumed"
            data={selfConsumed}
            measurement={`${self_consumed_sum} ${weight_unit}`}
          />
          <CustomBarChart
            header="Sold To Neighbours"
            data={soldToNeighbours}
            measurement={`${sold_to_neighbour_sum} ${weight_unit}`}
          />
          <CustomBarChart
            header="Sold To Market"
            data={soldToMarket}
            measurement={`${sold_to_market_sum} ${weight_unit}`}
          />
          <CustomBarChart
            header="Fed To Live Stock"
            data={fedToLiveStock}
            measurement={`${fed_to_livestock_sum} ${weight_unit}`}
          />
          <CustomBarChart
            header="Wastage"
            data={wastage}
            measurement={`${wastage_sum} ${weight_unit}`}
          />
          <CustomBarChart
            header="Income By Crops"
            data={incomeByCrops}
            measurement={`${income_sum} USD`}
          />
          <CustomBarChart
            header="Expenditure By Crops"
            data={expenditureByCrops}
            measurement={`${expenditure_sum} USD`}
          />
        </>
      )}
    </Stack>
  );
};
export default BifurcatedChart;
