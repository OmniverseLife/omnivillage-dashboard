import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import { fetchVillages } from "./functions/others";
import Loading from "./layout/components/loading";
import Navbar from "./layout/components/navbar/navbar";
import Sidebar from "./layout/components/sidebar/sidebar";
import { routes } from "./routes/routes";

function App() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [villages, setVillages] = useState([]);

  const { data = [], isLoading } = useQuery({
    queryKey: ["villages"],
    queryFn: fetchVillages,
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
    if (!searchParams.get("village") && !isLoading) {
      searchParams.set("village", data[0]?.name);
      setSearchParams(searchParams);
    }
  }, [data, isLoading, searchParams, setSearchParams]);

  const renderSelectGroup = (item) => {
    const items = item[1].map((p) => {
      return (
        <MenuItem
          key={p._id}
          value={p.name}
          sx={{ textTransform: "capitalize" }}
        >
          {p.name}
        </MenuItem>
      );
    });
    return [
      <ListSubheader key={item[0]} sx={{ textTransform: "uppercase" }}>
        {item[0]}
      </ListSubheader>,
      items,
    ];
  };

  return (
    <div className="App">
      <Toaster richColors closeButton />
      <Sidebar />
      <div className="rightSide">
        <Navbar />
        <Stack
          alignItems="center"
          // justifyContent="center"
          sx={{ marginBottom: "20px" }}
        >
          <FormControl size="small" sx={{ marginLeft: "auto" }}>
            <InputLabel id="demo-simple-select-label">Village</InputLabel>
            <Select
              label="Village"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              defaultValue={searchParams.get("village")}
              value={searchParams.get("village")}
              style={{ width: 200 }}
              onChange={(e) => {
                searchParams.set("village", e.target.value);
                setSearchParams(searchParams);
              }}
              sx={{ textTransform: "capitalize" }}
            >
              {Object.entries(villages).map((_data) =>
                renderSelectGroup(_data)
              )}
            </Select>
          </FormControl>
        </Stack>
        <Suspense fallback={<Loading />}>
          <Routes location={location}>
            {routes.map((item, id) => (
              <Route
                exact
                path={item.path}
                element={<item.Component />}
                key={id}
              />
            ))}
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
