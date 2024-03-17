import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import BifurcatedChart from "../../components/bifurcatedChart/bifurcatedChart";
import LandChart from "../../components/landChart/landChart";
import SellingChannel from "../../components/sellingChannel/sellingChannel";
import StorageFacility from "../../components/storageFacility/storageFacility";
import { useQuery } from "@tanstack/react-query";
import { fetchLabels, getAllCrops } from "../../../functions/others";
import { fetchTagWiseCrops } from "../../../functions/consumption";
import Loading from "../../components/loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";
import SoilHealth from "../../components/SoilHealth/SoilHealth";
import IncomeExpnditure from "../../components/incomeExpenditure/IncomeExpnditure";
import ProcessingInformation from "../../components/processingInformation/processingInformation";
import {
  getCategoryWiseCropNames,
  getProductNames,
} from "../../../functions/dashboard";
import HarvestedProducts from "../../components/harvestedProducts/harvestedProducts";
import Wrapper from "../../components/wrapper/wrapper";
import OrganicInorganic from "../../components/organicInorganic/organicInorganic";
import OtherInformations from "../../components/otherInformations/otherInformations";

export const backgroundColor = [
  "rgba(255, 99, 132, 0.35)",
  "rgba(54, 162, 235, 0.35)",
  "rgba(255, 206, 86, 0.35)",
  "rgba(75, 192, 192, 0.35)",
  "rgba(153, 102, 255, 0.35)",
  "rgba(255, 159, 64, 0.35)",
];
export const borderColor = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];

function Production() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWeight, setselectedWeight] = useState("kg");
  const [selectedArea, setselectedArea] = useState("km2");
  const [selectedCategory, setSelectedCategory] = useState("cultivation");

  const { data: labels = [], isLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  const { data: all_crops = [], isAllCropsLoading } = useQuery({
    queryKey: ["all-crops", searchParams.get("country")],
    queryFn: () => getAllCrops(searchParams.get("country")),
    enabled: searchParams.get("option") === "income-expenditure",
  });

  const { data: crops = [], isLoading: isCropsLoading } = useQuery({
    queryKey: ["crops", searchParams.get("label")],
    queryFn: () => fetchTagWiseCrops(searchParams.get("label")),
    enabled: Boolean(searchParams.get("label")),
  });

  const { data: crop_names, isLoading: isCropNamesLoading } = useQuery({
    queryKey: ["crop_names", selectedCategory],
    queryFn: () => getCategoryWiseCropNames(selectedCategory),
    enabled: selectedCategory === "trees" || selectedCategory === "poultry",
  });

  const { data: product_names, isLoading: isNamesLoading } = useQuery({
    queryKey: ["product_names", selectedCategory, searchParams.get("crop")],
    queryFn: () => getProductNames(selectedCategory, searchParams.get("crop")),
    enabled: Boolean(searchParams.get("crop")),
  });

  useEffect(() => {
    if (!searchParams.get("option")) {
      searchParams.set("option", "land-use");
      setSearchParams(searchParams);
    } else if (
      searchParams.get("option") === "harvested-products" &&
      selectedCategory !== "trees" &&
      selectedCategory !== "poultry"
    ) {
      setSelectedCategory("trees");
    }
  }, [searchParams, selectedCategory, setSearchParams]);

  useEffect(() => {
    if (searchParams.get("option") === "harvested-products") {
      if (searchParams.get("crop") && !isNamesLoading) {
        searchParams.set("product", product_names?.[0]?._id);
      } else if (!isCropNamesLoading) {
        searchParams.set("crop", crop_names?.[0]?._id);
      }
      setSearchParams(searchParams);
    }
  }, [
    searchParams,
    setSearchParams,
    product_names,
    crop_names,
    isNamesLoading,
    isCropNamesLoading,
    selectedCategory,
  ]);

  return (
    <Wrapper>
      <Stack className="container">
        <Loading
          isLoading={
            isLoading ||
            isCropsLoading ||
            isNamesLoading ||
            isCropNamesLoading ||
            isAllCropsLoading
          }
        />
        <Stack direction={"row"} gap={3} marginBottom={3} flexWrap={"wrap"}>
          <FormControl size="small">
            <InputLabel
              id="demo-simple-select-label"
              shrink={Boolean(searchParams.get("option"))}
            >
              Production Information
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={searchParams.get("option")}
              style={{ width: 300 }}
              notched={Boolean(searchParams.get("option"))}
              label="Production Information"
              onChange={(e) => {
                searchParams.set("label", "");
                searchParams.set("crop", "");
                searchParams.set("option", e.target.value);
                setSearchParams(searchParams);
              }}
            >
              <MenuItem value="land-use">Land Use</MenuItem>
              <MenuItem value="output-utilisation">
                Output & Utilisation
              </MenuItem>
              <MenuItem value="harvested-products">Harvested Products</MenuItem>
              <MenuItem value="soil-health">Soil Health</MenuItem>
              <MenuItem value="organic-inorganic">Organic/Inorganic</MenuItem>
              <MenuItem value="processing-information">
                Processing Information
              </MenuItem>
              <MenuItem value="income-expenditure">
                Income & Expenditure
              </MenuItem>
              <MenuItem value="selling-channel">Selling Channel</MenuItem>
              <MenuItem value="storage-facility">Storage Facility</MenuItem>
              <MenuItem value="other-informations">Other Informations</MenuItem>
            </Select>
          </FormControl>
          {searchParams.get("option") === "income-expenditure" ? (
            <FormControl size="small">
              <InputLabel
                id="demo-simple-select-label"
                shrink={Boolean(searchParams.get("crop"))}
              >
                Name
              </InputLabel>
              <Select
                label="Tags"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={searchParams.get("crop")}
                style={{ width: 300 }}
                notched={Boolean(searchParams.get("crop"))}
                onChange={(e) => {
                  searchParams.set("crop", e.target.value);
                  setSearchParams(searchParams);
                }}
              >
                <MenuItem value="">Select</MenuItem>
                {all_crops.map((_crop) => (
                  <MenuItem value={_crop._id} key={_crop._id}>
                    {_crop.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {searchParams.get("option") === "output-utilisation" ? (
            <FormControl size="small">
              <InputLabel
                id="demo-simple-select-label"
                shrink={Boolean(searchParams.get("label"))}
              >
                Tags
              </InputLabel>
              <Select
                label="Tags"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                notched={Boolean(searchParams.get("label"))}
                value={searchParams.get("label")}
                style={{ width: 300 }}
                onChange={(e) => {
                  searchParams.set("crop", "");
                  searchParams.set("label", e.target.value);
                  setSearchParams(searchParams);
                }}
              >
                <MenuItem value="">Select</MenuItem>
                {labels.map((_label) => (
                  <MenuItem value={_label._id} key={_label._id}>
                    {_label.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {searchParams.get("option") === "output-utilisation" && (
            <FormControl size="small">
              <InputLabel
                id="demo-simple-select-label"
                shrink={Boolean(searchParams.get("crop"))}
              >
                Name
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                notched={Boolean(searchParams.get("crop"))}
                value={searchParams.get("crop")}
                style={{ width: 200 }}
                label="Crops"
                onChange={(e) => {
                  searchParams.set("crop", e.target.value);
                  setSearchParams(searchParams);
                }}
              >
                <MenuItem value="">Select</MenuItem>
                {crops.map((_crop) => {
                  return (
                    <MenuItem value={_crop._id} key={_crop._id}>
                      {_crop.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
          {searchParams.get("option") === "processing-information" ||
          searchParams.get("option") === "harvested-products" ||
          searchParams.get("option") === "organic-inorganic" ? (
            <FormControl size="small">
              <InputLabel
                id="demo-simple-select-label"
                // shrink={Boolean(searchParams.get("category"))}
              >
                Category
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedCategory}
                // notched={Boolean(searchParams.get("category"))}
                style={{ width: 200 }}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {[
                  {
                    value: "cultivation",
                    name: "Cultivation",
                    type: 0,
                    organicOption: true,
                  },
                  {
                    value: "trees",
                    name: "Trees, Shrubs & Grasses",
                    type: 1,
                    organicOption: true,
                  },
                  {
                    value: "hunting",
                    name: "Hunting",
                    type: 0,
                    organicOption: false,
                  },
                  {
                    value: "fishery",
                    name: "Fishery",
                    type: 0,
                    organicOption: false,
                  },
                  {
                    value: "poultry",
                    name: "Poultry",
                    type: 1,
                    organicOption: false,
                  },
                ]
                  .filter(
                    (_item) =>
                      (searchParams.get("option") === "organic-inorganic" &&
                        _item.organicOption) ||
                      (searchParams.get("option") === "harvested-products" &&
                        _item.type === 1) ||
                      (_item.type === 0 &&
                        searchParams.get("option") === "processing-information")
                  )
                  .map((_item) => (
                    <MenuItem value={_item.value} key={_item.name}>
                      {_item.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : null}
          {searchParams.get("option") === "harvested-products" ? (
            <FormControl size="small">
              <InputLabel
                id="demo-simple-select-label"
                shrink={Boolean(searchParams.get("crop"))}
              >
                Names
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={searchParams.get("crop")}
                style={{ width: 200 }}
                label="Names"
                notched={Boolean(searchParams.get("crop"))}
                onChange={(e) => {
                  searchParams.set("crop", e.target.value);
                  setSearchParams(searchParams);
                }}
              >
                {crop_names?.map((_item) => (
                  <MenuItem value={_item._id} key={_item.name}>
                    {_item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {searchParams.get("option") === "harvested-products" ? (
            <FormControl size="small">
              <InputLabel
                id="demo-simple-select-label"
                shrink={Boolean(searchParams.get("product"))}
              >
                Products
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={searchParams.get("product")}
                style={{ width: 200 }}
                label="Products"
                notched={Boolean(searchParams.get("product"))}
                onChange={(e) => {
                  searchParams.set("product", e.target.value);
                  setSearchParams(searchParams);
                }}
              >
                {product_names?.map((_item) => (
                  <MenuItem value={_item._id} key={_item.name}>
                    {_item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {searchParams.get("option") === "land-use" ||
          searchParams.get("option") === "soil-health" ? (
            <FormControl size="small" style={{ marginLeft: "auto" }}>
              <InputLabel id="demo-simple-select-label">Area</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedArea}
                style={{ width: 200 }}
                label="Area"
                onChange={(e) => setselectedArea(e.target.value)}
              >
                {convert()
                  .list("area")
                  .map((_unit) => (
                    <MenuItem value={_unit.abbr} key={_unit.abbr}>
                      {_unit.singular}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : null}
          {searchParams.get("option") === "output-utilisation" ||
          searchParams.get("option") === "storage-facility" ? (
            <FormControl size="small" style={{ marginLeft: "auto" }}>
              <InputLabel id="demo-simple-select-label">Weight</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedWeight}
                style={{ width: 200 }}
                label="Weight"
                onChange={(e) => setselectedWeight(e.target.value)}
              >
                {convert()
                  .list("mass")
                  .map((_unit) => (
                    <MenuItem value={_unit.abbr} key={_unit.abbr}>
                      {_unit.singular}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : null}
        </Stack>
        {searchParams.get("option") === "land-use" ? (
          <LandChart land_unit={selectedArea} />
        ) : searchParams.get("option") === "income-expenditure" ? (
          <IncomeExpnditure />
        ) : searchParams.get("option") === "output-utilisation" ? (
          <BifurcatedChart weight_unit={selectedWeight} crops={crops} />
        ) : searchParams.get("option") === "processing-information" ? (
          <ProcessingInformation category={selectedCategory} />
        ) : searchParams.get("option") === "harvested-products" ? (
          <HarvestedProducts category={selectedCategory} />
        ) : searchParams.get("option") === "organic-inorganic" ? (
          <OrganicInorganic category={selectedCategory} />
        ) : searchParams.get("option") === "soil-health" ? (
          <SoilHealth land_unit={selectedArea} />
        ) : searchParams.get("option") === "selling-channel" ? (
          <SellingChannel />
        ) : searchParams.get("option") === "storage-facility" ? (
          <StorageFacility weight_unit={selectedWeight} />
        ) : searchParams.get("option") === "other-informations" ? (
          <OtherInformations />
        ) : null}
      </Stack>
    </Wrapper>
  );
}

export default Production;
