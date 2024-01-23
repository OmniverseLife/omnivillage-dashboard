import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { backgroundColor } from "./production";
import CustomBarChart from "../../components/customBarChart/customBarChart";
import ConsumptionFromProduction from "../../components/consumptionFromProduction/consumptionFromProduction";
import SelfGrown from "../../components/selfGrown/selfGrown";
import PurchasedNeighbour from "../../components/purchasedNeighbour/purchasedNeighbour";
import PurchasedOutside from "../../components/purchasedOutside/purchasedOutside";
import IdealQuantityDiet from "../../components/idealQuantityDiet/idealQuantityDiet";
import { useQuery } from "@tanstack/react-query";
import { fetchLabels } from "../../../functions/others";
import Loading from "../../components/loading";
import { fetchTagWiseCrops } from "../../../functions/consumption";
import convert from "convert-units";

function Consumption() {
  const [selectedOption, setselectedOption] = useState(
    "consumption-production"
  );
  const [selectedTag, setselectedTag] = useState("");
  const [selectedCrop, setselectedCrop] = useState("");
  const [selectedWeight, setselectedWeight] = useState("kg");

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
    setselectedCrop(crops[0]?._id ?? "");
  }, [labels, crops]);

  const renderItems = () => {
    switch (selectedOption) {
      case "consumption-production":
        return (
          <ConsumptionFromProduction
            type_id={selectedTag}
            crop_id={selectedCrop}
          />
        );
      case "self-grown":
        return <SelfGrown type_id={selectedTag} weight_unit={selectedWeight} />;
      case "purchased-neighbours":
        return (
          <PurchasedNeighbour
            type_id={selectedTag}
            weight_unit={selectedWeight}
          />
        );
      case "purchased-outside":
        return (
          <PurchasedOutside
            type_id={selectedTag}
            weight_unit={selectedWeight}
          />
        );
      case "ideal-diet":
        return (
          <IdealQuantityDiet
            type_id={selectedTag}
            weight_unit={selectedWeight}
          />
        );
    }
  };
  return (
    <Stack className="container">
      <Loading isLoading={isLoading || isCropsLoading} />
      <Stack direction={"row"} spacing={3} marginBottom={3}>
        <FormControl size="small">
          <InputLabel id="demo-simple-select-label">
            Consumption Information
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedOption}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => {
              setselectedTag(labels[0]._id);
              setselectedCrop(crops[0]._id);
              setselectedOption(e.target.value);
            }}
          >
            <MenuItem value="consumption-production">
              Consumption From Production
            </MenuItem>
            <MenuItem value="self-grown">Self Grown & Consumed</MenuItem>
            <MenuItem value="purchased-neighbours">
              Purchased From Neighbours
            </MenuItem>
            <MenuItem value="purchased-outside">
              Purchased From Outside
            </MenuItem>
            <MenuItem value="ideal-diet">Ideal Quantity Healthy Diet</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel id="demo-simple-select-label">Tags</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedTag}
            style={{ width: 300 }}
            label="Production Information"
            onChange={(e) => setselectedTag(e.target.value)}
          >
            {labels.map((_label) => {
              return (
                <MenuItem value={_label._id} key={_label._id}>
                  {_label.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {selectedOption === "consumption-production" && (
          <FormControl size="small">
            <InputLabel id="demo-simple-select-label">Crops</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedCrop}
              style={{ width: 200 }}
              label="Production Information"
              onChange={(e) => setselectedCrop(e.target.value)}
            >
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

        <FormControl size="small" style={{ marginLeft: "auto" }}>
          <InputLabel id="demo-simple-select-label">Weight</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedWeight}
            style={{ width: 200 }}
            label="Production Information"
            onChange={(e) => setselectedWeight(e.target.value)}
          >
            {convert()
              .list("mass")
              .map((_unit) => (
                <MenuItem value={_unit.abbr} key={_unit.abbr}>
                  {_unit.plural}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Stack>
      {renderItems()}
    </Stack>
  );
}

export default Consumption;
