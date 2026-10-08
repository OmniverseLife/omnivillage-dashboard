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
  Link,
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
import AuthProvider, {
  landingFor,
} from "./layout/components/AuthProvider/AuthProvider";

// App does not render again after login, so the stored user is read when the
// redirect itself renders, not when the routes below are declared.
function Landing() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return <Navigate to={landingFor(user)} replace={true} />;
}

// The Master editor took the place of the Categories and Questions pages.
// Their addresses still work, and a link to one page's questions
// (?categoryId=) opens that page in the editor.
function ToMaster() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("categoryId");
  return (
    <Navigate
      to={`/questionnaire/master${category ? `?category=${category}` : ""}`}
      replace={true}
    />
  );
}

// An address that is not a page — and /404, where an account is sent from a
// page that is not for its role — used to leave the screen empty.
function NotFound() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      sx={{ minHeight: "100vh", width: "100%", color: "#1f2933" }}
    >
      <h2 style={{ margin: 0 }}>Page not found</h2>
      <p style={{ margin: 0 }}>
        This page does not exist, or it is not for your account.
      </p>
      <Link to="/" style={{ color: "#0080ff" }}>
        Go to your start page
      </Link>
    </Stack>
  );
}

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
                <AuthProvider role="admin,viewer,regional" route="/">
                  <Landing />
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

            {[
              "/questionnaire",
              "/questionnaire/categories",
              "/questionnaire/questions",
            ].map((path) => (
              <Route
                key={path}
                path={path}
                element={
                  <AuthProvider role="admin" route={path}>
                    <ToMaster />
                  </AuthProvider>
                }
              />
            ))}

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </Suspense>
      {/* </div> */}
    </div>
  );
}

export default App;
