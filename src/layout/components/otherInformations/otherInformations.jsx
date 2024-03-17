import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getOtherInformationsAll } from "../../../functions/dashboard";
import { useSearchParams } from "react-router-dom";
import Loading from "../loading";
import { DataGrid } from "@mui/x-data-grid";

export default function OtherInformations() {
  const [searchParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["other-informations"],
    queryFn: () => getOtherInformationsAll(searchParams.get("village")),
  });

  const treeColumns = [
    { field: "id", headerName: "S.NO", width: 100 },
    {
      field: "_id",
      headerName: "Row Id",
      width: 100,
    },
    { field: "crop_name", headerName: "Tree Name", width: 250 },
    { field: "count", headerName: "Total Number of Trees", width: 250 },
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
    { field: "crop_name", headerName: "Tree Name", width: 200 },
    { field: "count", headerName: "Total Number of Poultries", width: 200 },
    { field: "average_age", headerName: "Average Age", width: 200 },
    { field: "feed", headerName: "Feed", width: 200 },
    { field: "feed_quantity", headerName: "Feed Quantity", width: 200 },
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
    { field: "crop_name", headerName: "Tree Name", width: 250 },
    { field: "count", headerName: "Total Number of Fishes", width: 250 },
    { field: "feed", headerName: "Feed", width: 250 },
    { field: "feed_quantity", headerName: "Feed Quantity", width: 250 },
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
    { field: "crop_name", headerName: "Tree Name", width: 300 },
    { field: "count", headerName: "Total Number of Fishes", width: 300 },
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
    { field: "crop_name", headerName: "Tree Name", width: 300 },
    { field: "count", headerName: "Total Number of LiveStocks", width: 300 },
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
      <Typography variant="h5" sx={{ marginBottom: "20px" }}>
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
        pageSizeOptions={[5, 10]}
      />
      <Typography variant="h5" sx={{ marginTop: "30px", marginBottom: "20px" }}>
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
        pageSizeOptions={[5, 10]}
      />
      <Typography variant="h5" sx={{ marginTop: "30px", marginBottom: "20px" }}>
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
        pageSizeOptions={[5, 10]}
      />
      <Typography variant="h5" sx={{ marginTop: "30px", marginBottom: "20px" }}>
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
        pageSizeOptions={[5, 10]}
      />
      <Typography variant="h5" sx={{ marginTop: "30px", marginBottom: "20px" }}>
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
        pageSizeOptions={[5, 10]}
      />
    </Box>
  );
}
