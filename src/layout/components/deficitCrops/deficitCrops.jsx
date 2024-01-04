import { DataGrid } from "@mui/x-data-grid";
import React from "react";

function DeficitCrops() {
  const rows = [
    {
      id: 1,
      name: "Carrot",
      deficitAmount: "12 kg",
      locallySuitable: "Yes",
      landNeeded: "20 km",
      economicGain: "100",
    },
    {
      id: 2,
      name: "Apple",
      deficitAmount: "10 kg",
      locallySuitable: "No",
      landNeeded: "10 km",
      economicGain: "50",
    },
    {
      id: 3,
      name: "Banana",
      deficitAmount: "5 kg",
      locallySuitable: "Yes",
      landNeeded: "20 km",
      economicGain: "100",
    },
    {
      id: 4,
      name: "Guava",
      deficitAmount: "12 kg",
      locallySuitable: "No",
      landNeeded: "2 km",
      economicGain: "100",
    },
    {
      id: 5,
      name: "Carrot",
      deficitAmount: "12 kg",
      locallySuitable: "Yes",
      landNeeded: "20 km",
      economicGain: "100",
    },
    {
      id: 6,
      name: "Orange",
      deficitAmount: "15 kg",
      locallySuitable: "Yes",
      landNeeded: "10 km",
      economicGain: "100",
    },
    {
      id: 7,
      name: "Carrot",
      deficitAmount: "12 kg",
      locallySuitable: "No",
      landNeeded: "20 km",
      economicGain: "100",
    },
    {
      id: 8,
      name: "Apple",
      deficitAmount: "12 kg",
      locallySuitable: "No",
      landNeeded: "20 km",
      economicGain: "100",
    },
  ];

  const columns = [
    { field: "id", headerName: "S.NO", width: 100 },
    { field: "name", headerName: "Crop Name", width: 180 },
    { field: "deficitAmount", headerName: "Deficit Amount", width: 180 },
    { field: "locallySuitable", headerName: "locally Suitable", width: 180 },
    {
      field: "landNeeded",
      headerName: "Extra Land Needed",
      width: 220,
    },
    {
      field: "economicGain",
      headerName: "Economic Gain",
      width: 180,
    },
  ];
  return (
    <DataGrid
      style={{ boxShadow: "none" }}
      rows={rows}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 },
        },
      }}
      // columnVisibilityModel={{
      //   totalLand: false,
      // }}
      pageSizeOptions={[5, 10]}
    />
  );
}

export default DeficitCrops;
