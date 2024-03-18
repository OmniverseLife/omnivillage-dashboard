import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import Navbar from "../navbar/navbar";
import { useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchVillages } from "../../../functions/others";
import Loading from "../../components/loading/index";

export default function Wrapper({ children }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [villages, setVillages] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState(
    typeof searchParams.get("village") === "string"
      ? searchParams.get("village")
      : [searchParams.get("village")]
  );
  const role = JSON.parse(localStorage.getItem("user"))?.role;

  const { data = [], isLoading } = useQuery({
    queryKey: ["villages"],
    queryFn: fetchVillages,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 300000,
  });

  useEffect(() => {
    if (!isLoading) {
      const _villages = {};
      data.forEach((_data) => {
        _villages[_data.country] = [...(_villages[_data.country] || []), _data];
      });
      setVillages(_villages);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (searchParams.get("village") === null && !isLoading) {
      searchParams.set("country", data[0]?.country);
      searchParams.set("village", data[0]?.name);
      setSearchParams(searchParams);
    }
  }, [data, isLoading, searchParams, setSearchParams]);

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "rgb(240, 240, 240)",
        padding: "15px",
        width: "100vw",
      }}
    >
      <Loading isLoading={isLoading} />
      <Sidebar role={role} />
      <div className="rightSide">
        <Navbar />
        {location.pathname.includes("dashboard") && (
          <Stack
            direction="row"
            alignItems="center"
            // justifyContent="center"
            sx={{ marginBottom: "20px" }}
          >
            <FormControl size="small" sx={{ marginLeft: "auto" }}>
              <InputLabel
                id="demo-simple-select-label"
                shrink={Boolean(searchParams.get("country"))}
              >
                Country
              </InputLabel>
              <Select
                label="Country"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                notched={Boolean(searchParams.get("country"))}
                value={searchParams.get("country")}
                style={{ width: 200 }}
                onChange={(e) => {
                  searchParams.set("country", e.target.value);
                  setSearchParams(searchParams);
                }}
                sx={{ textTransform: "capitalize" }}
              >
                {Object.keys(villages).map((_data) => (
                  <MenuItem
                    key={_data}
                    value={_data}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {_data}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ marginLeft: "10px" }}>
              <InputLabel
                id="demo-simple-select-label"
                shrink={Boolean(searchParams.get("village"))}
              >
                Village
              </InputLabel>
              <Select
                label="Village"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                notched={Boolean(searchParams.get("village"))}
                value={selectedVillages}
                style={{ width: 200 }}
                multiple
                onChange={({ target: { value } }) => {
                  const values = typeof value === "string" ? [value] : value;
                  values.forEach((_value) =>
                    searchParams.set("village", _value)
                  );
                  setSearchParams(searchParams);
                  setSelectedVillages(
                    typeof value === "string" ? [value] : value
                  );
                }}
                sx={{ textTransform: "capitalize" }}
              >
                {villages[searchParams.get("country")]?.map((_data) => (
                  <MenuItem
                    key={_data._id}
                    value={_data.name}
                    sx={{ textTransform: "capitalize" }}
                  >
                    <Checkbox
                      checked={Boolean(
                        selectedVillages.find((name) => name === _data.name)
                      )}
                    />
                    <ListItemText primary={_data.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}
        {!isLoading && children}
      </div>
    </Box>
  );
}
