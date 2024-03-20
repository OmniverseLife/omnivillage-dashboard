import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProcessingMethod } from "../../../functions/dashboard";
import moment from "moment";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../loading";
import CustomToolbar from "../CustomToolbar/CustomToolbar";

export default function ProcessingInformation({ category }) {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);

  const { data = { type: "", data: [] }, isLoading } = useQuery({
    queryKey: [
      "processing-information",
      category,
      searchParams.getAll("village"),
    ],
    queryFn: () =>
      getProcessingMethod(category, searchParams.getAll("village")),
  });

  useEffect(() => {
    if (!isLoading)
      setRows(
        data?.type === "cultivation"
          ? data?.data?.map((_cultivation, index) => ({
              id: index + 1,
              _id: _cultivation._id,
              crop_name: _cultivation.crop_name,
              description: _cultivation.processing_method,
              // date: moment(_cultivation.created_at).format("ll"),
            }))
          : data?.data?.map((_cultivation, index) => ({
              id: index + 1,
              _id: _cultivation._id,
              crop_name: _cultivation.crop_name.name,
              count: _cultivation.count,
              // date: moment(_cultivation.created_at).format("ll"),
            }))
      );
  }, [isLoading]);

  const columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "_id", headerName: "Crop ID", width: 200 },
    { field: "crop_name", headerName: "Crop", width: 250 },
    {
      field: data?.type === "cultivation" ? "description" : "count",
      headerName:
        data?.type === "cultivation"
          ? "Description"
          : "Number of farmers using processing method",
      width: 450,
    },
  ];

  return (
    <div>
      <Loading isLoading={isLoading} />
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        columnVisibilityModel={{
          _id: false,
        }}
        slots={{ toolbar: CustomToolbar }}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
}
