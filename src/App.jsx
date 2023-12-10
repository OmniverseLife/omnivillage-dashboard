import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Sidebar from "./layout/components/sidebar/sidebar";
import Navbar from "./layout/components/navbar/navbar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Users from "./layout/pages/users/users";
import Crops from "./layout/pages/crops/crops";
import { routes } from "./routes/routes";

function App() {
  const location = useLocation();
  return (
    <div className="App">
      <Sidebar />
      <div className="rightSide">
        <Navbar />
        <Routes location={location}>
          {/* <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route exact path="/users" element={<Users />} />
          <Route exact path="/crops" element={<Crops />} /> */}
          {routes.map((item, id) => (
            <Route exact path={item.path} element={<item.Component />} />
          ))}
        </Routes>
      </div>
    </div>
  );
}

export default App;
