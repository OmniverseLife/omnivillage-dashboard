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
import IncomeSaleChart from "../../components/incomeSaleChart/incomeSaleChart";
import LandChart from "../../components/landChart/landChart";
import SellingChannel from "../../components/sellingChannel/sellingChannel";
import StorageFacility from "../../components/storageFacility/storageFacility";
import UtilityChart from "../../components/utilityChart/utilityChart";
import { useQuery } from "@tanstack/react-query";
import { fetchLabels } from "../../../functions/others";
import { fetchTagWiseCrops } from "../../../functions/consumption";
import Loading from "../../components/loading";

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
  const [selectedOption, setselectedOption] = useState("land-chart");
  const [selectedTag, setselectedTag] = useState("");
  const [selectedCrop, setselectedCrop] = useState("");
  const [selectedWeight, setselectedWeight] = useState("kg");
  const [selectedArea, setselectedArea] = useState("km");

  const { data: labels = [], isLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  const { data: crops = [], isCropsLoading } = useQuery({
    queryKey: ["crops", selectedTag],
    queryFn: () => fetchTagWiseCrops(selectedTag),
    enabled: Boolean(selectedTag),
  });

  useEffect(() => {
    setselectedTag(labels[0]?._id ?? "");
  }, [labels]);

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
            value={selectedOption}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => {
              setselectedTag(labels[0]._id);
              setselectedCrop("");
              setselectedOption(e.target.value);
            }}
          >
            <MenuItem value="land-chart">Land Chart</MenuItem>
            <MenuItem value="bifurcated">Bifurcated Chart By Tags</MenuItem>
            <MenuItem value="utility">Utilisation Chart</MenuItem>
            <MenuItem value="income-chart">Income & Expenditure Chart</MenuItem>
            <MenuItem value="selling-channel">Selling Channel</MenuItem>
            <MenuItem value="storage-facility">Storage Facility</MenuItem>
          </Select>
        </FormControl>
        {selectedOption === "bifurcated" ? (
          <FormControl>
            <InputLabel id="demo-simple-select-label">Tags</InputLabel>
            <Select
              size="small"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedTag}
              style={{ width: 300 }}
              label="Tags"
              onChange={(e) => setselectedTag(e.target.value)}
            >
              {labels.map((_label) => (
                <MenuItem value={_label._id} key={_label._id}>
                  {_label.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
        {selectedOption === "bifurcated" && (
          <FormControl size="small">
            <InputLabel id="demo-simple-select-label">Crops</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedCrop}
              style={{ width: 200 }}
              label="Crops"
              onChange={(e) => setselectedCrop(e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              {crops.map((_crop) => (
                <MenuItem value={_crop._id} key={_crop._id}>
                  {_crop.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {selectedOption === "bifurcated" || selectedOption === "land-chart" ? (
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
              <MenuItem value="km">Kilometer</MenuItem>
              <MenuItem value="hectare">Hectare</MenuItem>
            </Select>
          </FormControl>
        ) : null}
        {selectedOption === "bifurcated" ? (
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
              <MenuItem value="tonne">Tonne</MenuItem>
              <MenuItem value="kg">Kilogram</MenuItem>
              <MenuItem value="g">Gram</MenuItem>
              <MenuItem value="mg">Miligram</MenuItem>
              <MenuItem value="stone">Stone</MenuItem>
              <MenuItem value="pound">Pound</MenuItem>
              <MenuItem value="ounce">Ounce</MenuItem>
            </Select>
          </FormControl>
        ) : null}
      </Stack>
      {selectedOption === "land-chart" ? (
        <LandChart />
      ) : selectedOption === "bifurcated" ? (
        <BifurcatedChart type_id={selectedTag} crop_id={selectedCrop} />
      ) : selectedOption === "income-chart" ? (
        <IncomeSaleChart />
      ) : selectedOption === "selling-channel" ? (
        <SellingChannel />
      ) : selectedOption === "storage-facility" ? (
        <StorageFacility />
      ) : selectedOption === "utility" ? (
        <UtilityChart />
      ) : null}
    </Stack>
  );
}

export default Production;
