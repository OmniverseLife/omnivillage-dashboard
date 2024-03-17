import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import { fetchVillages } from "./functions/others";
import Loading from "./layout/components/loading";
import Navbar from "./layout/components/navbar/navbar";
import Sidebar from "./layout/components/sidebar/sidebar";
import { routes } from "./routes/routes";

function App() {
  const THEME = createTheme({
    typography: {
      fontFamily: `"Montserrat", "Helvetica", sans-serif`,
    },
  });

  return (
    <div className="App">
      <Toaster richColors closeButton />
      {/* <Sidebar />
      <div className="rightSide">
        <Navbar /> */}
      <Suspense fallback={<Loading />}>
        <ThemeProvider theme={THEME}>
          <Routes location={location}>
            <Route
              path="/"
              element={<Navigate to="/dashboard/production" replace={true} />}
            />
            <Route
              path="/production"
              element={<Navigate to="/production/cultivation" replace={true} />}
            />
            <Route
              path="/consumption"
              element={
                <Navigate to="/consumption/grains-nuts" replace={true} />
              }
            />
            <Route
              path="/dashboard"
              element={<Navigate to="/dashboard/production" replace={true} />}
            />
            <Route
              path="/crops"
              element={<Navigate to="/crops/cultivation" replace={true} />}
            />
            {routes.map((item, id) => (
              <Route
                exact
                path={item.path}
                element={<item.Component />}
                key={id}
              />
            ))}
          </Routes>
        </ThemeProvider>
      </Suspense>
      {/* </div> */}
    </div>
  );
}

export default App;
