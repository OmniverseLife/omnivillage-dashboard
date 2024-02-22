import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import DoneIcon from "@mui/icons-material/Done";
import Loading from "../loading";
import { useQuery } from "@tanstack/react-query";
import { fetchFoodBalance } from "../../../functions/dashboard";
import { useSearchParams } from "react-router-dom";

function DeficitCrops({ parentLoading, tag }) {
  const [rows, setRows] = useState([]);
  const [searchParams] = useSearchParams();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["food_balance", tag],
    queryFn: () => fetchFoodBalance(tag, searchParams.get("village")),
    initialData: [],
  });

  useEffect(() => {
    if (!isLoading) {
      setRows(
        data
          .filter((_item) => _item.ideal_consumption - _item.self_consumed > 0)
          .map((_item, index) => {
            return {
              id: index + 1,
              row_id: _item._id,
              name: _item.crop_name,
              deficitAmount: _item.ideal_consumption - _item.self_consumed,
              locallySuitable: "",
              landNeeded:
                _item.type === "cultivation"
                  ? `${(
                      (_item.ideal_consumption - _item.self_consumed) /
                      _item.yeild
                    ).toFixed(2)} km`
                  : `${Math.round(
                      (_item.ideal_consumption - _item.self_consumed) /
                        _item.yeild
                    )} ${_item.crop_name}`,
              marketPrice: "",
              economicGain: "",
            };
          })
      );
    }
  }, [data, isLoading]);

  const yesChecked = (row_id) => {
    const row_data = rows.map((_row) => {
      if (_row.row_id === row_id) {
        _row.locallySuitable = "Yes";
      }
      return _row;
    });
    setRows(row_data);
  };

  const noChecked = (row_id) => {
    const row_data = rows.map((_row) => {
      if (_row.row_id === row_id) {
        _row.locallySuitable = "No";
      }
      return _row;
    });
    setRows(row_data);
  };

  const storeMarketPrice = (row_id, value) => {
    const row_data = rows.map((_row) => {
      if (_row.row_id === row_id) {
        _row.marketPrice = value;
      }
      return _row;
    });
    setRows(row_data);
  };

  // const rows = [
  //   {
  //     id: 1,
  //     name: "Carrot",
  //     deficitAmount: "12 kg",
  //     locallySuitable: "Yes",
  //     landNeeded: "20 km",
  //     marketPrice: "50",
  //     economicGain: "100",
  //   },
  //   {
  //     id: 2,
  //     name: "Apple",
  //     deficitAmount: "10 kg",
  //     locallySuitable: "No",
  //     landNeeded: "10 km",
  //     marketPrice: "10",

  //     economicGain: "50",
  //   },
  //   {
  //     id: 3,
  //     name: "Banana",
  //     deficitAmount: "5 kg",
  //     locallySuitable: "Yes",
  //     landNeeded: "20 km",
  //     marketPrice: "50",

  //     economicGain: "100",
  //   },
  //   {
  //     id: 4,
  //     name: "Guava",
  //     deficitAmount: "12 kg",
  //     locallySuitable: "No",
  //     landNeeded: "2 km",
  //     marketPrice: "50",

  //     economicGain: "100",
  //   },
  //   {
  //     id: 5,
  //     name: "Carrot",
  //     deficitAmount: "12 kg",
  //     locallySuitable: "Yes",
  //     landNeeded: "20 km",
  //     marketPrice: "50",

  //     economicGain: "100",
  //   },
  //   {
  //     id: 6,
  //     name: "Orange",
  //     deficitAmount: "15 kg",
  //     locallySuitable: "Yes",
  //     landNeeded: "10 km",
  //     marketPrice: "50",

  //     economicGain: "100",
  //   },
  //   {
  //     id: 7,
  //     name: "Carrot",
  //     deficitAmount: "12 kg",
  //     locallySuitable: "No",
  //     landNeeded: "20 km",
  //     marketPrice: "50",

  //     economicGain: "100",
  //   },
  //   {
  //     id: 8,
  //     name: "Apple",
  //     deficitAmount: "12 kg",
  //     locallySuitable: "No",
  //     landNeeded: "20 km",
  //     marketPrice: "50",

  //     economicGain: "100",
  //   },
  // ];

  const columns = [
    { field: "id", headerName: "S.NO", width: 100 },
    {
      field: "row_id",
      headerName: "Row Id",
      width: 100,
    },
    { field: "name", headerName: "Crop Name", width: 180 },
    {
      field: "deficitAmount",
      headerName: "Deficit Amount",
      width: 180,
      renderCell: (params) => `${params.row.deficitAmount} kg`,
    },
    {
      field: "locallySuitable",
      headerName: "Locally Suitable",
      width: 180,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        return (
          <div>
            <FormControl>
              <RadioGroup
                style={{ flexDirection: "row" }}
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue=""
                name="radio-buttons-group"
              >
                <FormControlLabel
                  value="Yes"
                  onChange={() => yesChecked(params.row.row_id)}
                  control={
                    <Radio
                      checkedIcon={<DoneIcon />}
                      checked={params.row.locallySuitable === "Yes"}
                    />
                  }
                  label="Yes"
                />
                <FormControlLabel
                  value="No"
                  onChange={() => noChecked(params.row.row_id)}
                  control={
                    <Radio
                      checkedIcon={<DoneIcon />}
                      checked={params.row.locallySuitable === "No"}
                    />
                  }
                  label="No"
                />
              </RadioGroup>
            </FormControl>
          </div>
        );
      },
    },
    {
      field: "landNeeded",
      headerName: "Extra Land Needed",
      width: 220,
      renderCell: (params) => {
        return params.row.locallySuitable === "Yes"
          ? params.row.landNeeded
          : "-";
      },
    },
    {
      field: "marketPrice",
      headerName: "Market Price",
      width: 180,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        return params.row.locallySuitable === "Yes" ? (
          <div>
            <TextField
              id="outlined-basic"
              label="Enter Price"
              variant="standard"
              size="small"
              style={{ border: "none", color: "#ccc" }}
              type="number"
              onKeyDown={(e) => {
                if (
                  e.key === "e" ||
                  e.key === "E" ||
                  e.key === "-" ||
                  e.key === "+"
                ) {
                  e.preventDefault();
                }
              }}
              value={params.row.marketPrice}
              onChange={(e) =>
                storeMarketPrice(params.row.row_id, e.target.value)
              }
              onFocus={(e) =>
                e.target.addEventListener("wheel", (e) => e.preventDefault(), {
                  passive: false,
                })
              }
            />
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      field: "economicGain",
      headerName: "Economic Gain",
      width: 180,
      renderCell: (params) => {
        return params.row.locallySuitable === "Yes"
          ? (params.row.deficitAmount * params.row.marketPrice).toFixed(2)
          : "-";
      },
    },
  ];

  return (
    <>
      <Loading isLoading={parentLoading || isLoading || isFetching} />
      <DataGrid
        style={{ boxShadow: "none" }}
        rows={rows}
        columns={columns}
        initialState={{
          columns: {
            columnVisibilityModel: {
              row_id: false,
            },
          },
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />
    </>
  );
}

export default DeficitCrops;
