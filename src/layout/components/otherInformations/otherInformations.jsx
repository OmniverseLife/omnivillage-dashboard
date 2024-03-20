import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getOtherInformationsAll } from "../../../functions/dashboard";
import { useSearchParams } from "react-router-dom";
import Loading from "../loading";
import { DataGrid } from "@mui/x-data-grid";
import CustomToolbar from "../CustomToolbar/CustomToolbar";

export default function OtherInformations() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("tree");

  const { data, isLoading } = useQuery({
    queryKey: ["other-informations", searchParams.getAll("village")],
    queryFn: () => getOtherInformationsAll(searchParams.getAll("village")),
  });

  const treeColumns = [
    { field: "id", headerName: "S.NO", width: 100 },
    {
      field: "_id",
      headerName: "Row Id",
      width: 100,
    },
    { field: "crop_name", headerName: "Name", width: 250 },
    { field: "count", headerName: "Total Number", width: 250 },
    { field: "avg_age", headerName: "Average Age", width: 250 },
    // { field: "crop_name", headerName: "Tree Name", width: 180 },
  ];

  const treeRows =
    data?.tree?.map((_tree, index) => ({
      id: index + 1,
      ..._tree,
    })) || [];

  const poultryColumns = [
    { field: "id", headerName: "S.NO", width: 100 },
    {
      field: "_id",
      headerName: "Row Id",
      width: 100,
    },
    { field: "crop_name", headerName: "Name", width: 200 },
    { field: "count", headerName: "Total Number", width: 200 },
    { field: "average_age", headerName: "Average Age", width: 200 },
    { field: "feed", headerName: "Feed", width: 200 },
    {
      field: "feed_quantity",
      headerName: "Feed Quantity",
      width: 200,
      renderCell: (params) => {
        return params.value + " kgs";
      },
    },
    // { field: "crop_name", headerName: "Tree Name", width: 180 },
  ];

  const poultryRows =
    data?.poultry?.map((_tree, index) => ({
      id: index + 1,
      ..._tree,
    })) || [];

  const pondFishColumns = [
    { field: "id", headerName: "S.NO", width: 100 },
    {
      field: "_id",
      headerName: "Row Id",
      width: 100,
    },
    { field: "crop_name", headerName: "Name", width: 250 },
    { field: "count", headerName: "Total Number", width: 250 },
    { field: "feed", headerName: "Feed", width: 250 },
    {
      field: "feed_quantity",
      headerName: "Feed Quantity",
      width: 250,
      renderCell: (params) => {
        return params.value + " kgs";
      },
    },
    // { field: "crop_name", headerName: "Tree Name", width: 180 },
  ];

  const pondFishRows =
    data?.fish_from_pond?.map((_tree, index) => ({
      id: index + 1,
      ..._tree,
    })) || [];

  const fishColumns = [
    { field: "id", headerName: "S.NO", width: 100 },
    {
      field: "_id",
      headerName: "Row Id",
      width: 100,
    },
    { field: "crop_name", headerName: "Name", width: 300 },
    { field: "count", headerName: "Total Number", width: 300 },
    // { field: "crop_name", headerName: "Tree Name", width: 180 },
  ];

  const fishRows =
    data?.fish_from_river?.map((_tree, index) => ({
      id: index + 1,
      ..._tree,
    })) || [];

  const huntingColumns = [
    { field: "id", headerName: "S.NO", width: 100 },
    {
      field: "_id",
      headerName: "Row Id",
      width: 100,
    },
    { field: "crop_name", headerName: "Name", width: 300 },
    { field: "count", headerName: "Total Number", width: 300 },
    // { field: "crop_name", headerName: "Tree Name", width: 180 },
  ];

  const huntingRows =
    data?.huntings?.map((_tree, index) => ({
      id: index + 1,
      ..._tree,
    })) || [];

  return (
    <Box>
      <Loading isLoading={isLoading} />
      <FormControl size="small">
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Category"
          sx={{ width: "250px" }}
        >
          <MenuItem value="tree">Trees</MenuItem>
          <MenuItem value="poultry">Poultry</MenuItem>
          <MenuItem value="fish_from_pond">Fish from Ponds</MenuItem>
          <MenuItem value="fish_from_river">Fish from River</MenuItem>
          <MenuItem value="hunting">Hunting</MenuItem>
        </Select>
      </FormControl>
      {category === "tree" ? (
        <>
          <Typography
            variant="h5"
            sx={{ marginTop: "30px", marginBottom: "20px" }}
          >
            Trees
          </Typography>
          <DataGrid
            rows={treeRows}
            columns={treeColumns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  _id: false,
                },
              },
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            slots={{ toolbar: CustomToolbar }}
            pageSizeOptions={[5, 10]}
          />
        </>
      ) : category === "poultry" ? (
        <>
          <Typography
            variant="h5"
            sx={{ marginTop: "30px", marginBottom: "20px" }}
          >
            Poultry
          </Typography>
          <DataGrid
            rows={poultryRows}
            columns={poultryColumns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  _id: false,
                },
              },
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            slots={{ toolbar: CustomToolbar }}
            pageSizeOptions={[5, 10]}
          />
        </>
      ) : category === "fish_from_pond" ? (
        <>
          <Typography
            variant="h5"
            sx={{ marginTop: "30px", marginBottom: "20px" }}
          >
            Fish from Ponds
          </Typography>
          <DataGrid
            rows={pondFishRows}
            columns={pondFishColumns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  _id: false,
                },
              },
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            slots={{ toolbar: CustomToolbar }}
            pageSizeOptions={[5, 10]}
          />
        </>
      ) : category === "fish_from_river" ? (
        <>
          <Typography
            variant="h5"
            sx={{ marginTop: "30px", marginBottom: "20px" }}
          >
            Fish from Rivers
          </Typography>
          <DataGrid
            rows={fishRows}
            columns={fishColumns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  _id: false,
                },
              },
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            slots={{ toolbar: CustomToolbar }}
            pageSizeOptions={[5, 10]}
          />
        </>
      ) : category === "hunting" ? (
        <>
          <Typography
            variant="h5"
            sx={{ marginTop: "30px", marginBottom: "20px" }}
          >
            Hunting
          </Typography>
          <DataGrid
            rows={huntingRows}
            columns={huntingColumns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  _id: false,
                },
              },
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            slots={{ toolbar: CustomToolbar }}
            pageSizeOptions={[5, 10]}
          />
        </>
      ) : null}
    </Box>
  );
}
