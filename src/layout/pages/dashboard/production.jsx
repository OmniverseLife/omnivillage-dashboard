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
import IncomeSaleChart from "../../components/SoilHealth/SoilHealth";
import LandChart from "../../components/landChart/landChart";
import SellingChannel from "../../components/sellingChannel/sellingChannel";
import StorageFacility from "../../components/storageFacility/storageFacility";
import { useQuery } from "@tanstack/react-query";
import { fetchLabels } from "../../../functions/others";
import { fetchTagWiseCrops } from "../../../functions/consumption";
import Loading from "../../components/loading";
import convert from "convert-units";
import { useSearchParams } from "react-router-dom";
import SoilHealth from "../../components/SoilHealth/SoilHealth";

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

  const { data: labels = [], isLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  const { data: crops = [], isCropsLoading } = useQuery({
    queryKey: ["crops", searchParams.get("label")],
    queryFn: () => fetchTagWiseCrops(searchParams.get("label")),
    enabled: Boolean(searchParams.get("label")),
  });

  useEffect(() => {
    if (!searchParams.get("option")) {
      searchParams.set("option", "land-use");
      setSearchParams(searchParams);
    }
  }, []);

  return (
    <Stack className="container">
      <Loading isLoading={isLoading || isCropsLoading} />
      <Stack direction={"row"} gap={3} marginBottom={3} flexWrap={"wrap"}>
        <FormControl>
          <InputLabel id="demo-simple-select-label">
            Production Information
          </InputLabel>
          <Select
            size="small"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={searchParams.get("option")}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => {
              searchParams.set("label", "");
              searchParams.set("crop", "");
              searchParams.set("option", e.target.value);
              setSearchParams(searchParams);
            }}
          >
            <MenuItem value="land-use">Land Use</MenuItem>
            <MenuItem value="output-utilisation">Output & Utilisation</MenuItem>
            <MenuItem value="soil-health">Soil Health</MenuItem>
            <MenuItem value="selling-channel">Selling Channel</MenuItem>
            <MenuItem value="storage-facility">Storage Facility</MenuItem>
          </Select>
        </FormControl>
        {searchParams.get("option") === "output-utilisation" ||
        searchParams.get("option") === "soil-health" ? (
          <FormControl size="small">
            <InputLabel id="demo-simple-select-label">Tags</InputLabel>
            <Select
              label="Tags"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
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
        {(searchParams.get("option") === "output-utilisation" ||
          searchParams.get("option") === "soil-health") && (
          <FormControl size="small">
            <InputLabel id="demo-simple-select-label">Name</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
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
        {searchParams.get("option") === "land-use" ? (
          <FormControl style={{ marginLeft: "auto" }}>
            <InputLabel id="demo-simple-select-label">Area</InputLabel>
            <Select
              size="small"
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
          <FormControl style={{ marginLeft: "auto" }}>
            <InputLabel id="demo-simple-select-label">Weight</InputLabel>
            <Select
              size="small"
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
      ) : // <></>
      searchParams.get("option") === "output-utilisation" ? (
        <BifurcatedChart weight_unit={selectedWeight} crops={crops} />
      ) : searchParams.get("option") === "soil-health" ? (
        <SoilHealth />
      ) : searchParams.get("option") === "selling-channel" ? (
        <SellingChannel />
      ) : searchParams.get("option") === "storage-facility" ? (
        <StorageFacility weight_unit={selectedWeight} />
      ) : null}
    </Stack>
  );
}

export default Production;
