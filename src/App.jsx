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
import AuthProvider from "./layout/components/AuthProvider/AuthProvider";

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
              element={
                <AuthProvider role="admin,viewer" route="/">
                  <Navigate to="/dashboard/overview" replace={true} />
                </AuthProvider>
              }
            />

            <Route
              path="/production"
              element={
                <AuthProvider role="admin" route="/production">
                  <Navigate to="/production/cultivation" replace={true} />
                </AuthProvider>
              }
            />

            <Route
              path="/consumption"
              element={
                <AuthProvider role="admin" route="/consumption">
                  <Navigate to="/consumption/grains-nuts" replace={true} />
                </AuthProvider>
              }
            />

            <Route
              path="/dashboard"
              element={
                <AuthProvider role="admin,viewer" route="/dashboard">
                  <Navigate to="/dashboard/production" replace={true} />
                </AuthProvider>
              }
            />

            <Route
              path="/crops"
              element={
                <AuthProvider role="admin" route="/crops">
                  <Navigate to="/crops/cultivation" replace={true} />
                </AuthProvider>
              }
            />

            {routes.map((item, id) => (
              <Route
                exact
                path={item.path}
                element={
                  <AuthProvider
                    role={item.role}
                    route={item.path}
                    key={item.path}
                  >
                    <item.Component />
                  </AuthProvider>
                }
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
