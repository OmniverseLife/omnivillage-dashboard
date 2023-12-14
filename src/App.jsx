import { Suspense, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Sidebar from "./layout/components/sidebar/sidebar";
import Navbar from "./layout/components/navbar/navbar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Users from "./layout/pages/users/users";
import Crops from "./layout/pages/crops/crops";
import { routes } from "./routes/routes";
import { Toaster } from "sonner";
import Loading from "./layout/components/loading";

function App() {
  const location = useLocation();
  return (
    <div className="App">
      <Toaster richColors closeButton />
      <Sidebar />
      <div className="rightSide">
        <Navbar />
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
