import React, { useState } from "react";
import "./sidebar.css";
import { useLocation } from "react-router-dom";
import logo from "../../../assets/logo.png";
import barChart from "../../../assets/bar-chart.png";
import barChartInactive from "../../../assets/bar-chart-inactive.png";
import userInactive from "../../../assets/user-inactive.png";
import user from "../../../assets/user.png";
import settings from "../../../assets/settings.png";
import settingsInactive from "../../../assets/settings-inactive.png";
import logout from "../../../assets/shutdown.png";
import logoutInactive from "../../../assets/shutdown-inactive.png";

export default function Sidebar() {
  const location = useLocation();
  const paths = location.pathname.split("/");
  const [productionMenu, setproductionMenu] = useState(
    paths.includes("production") && true
  );
  const [consumtionMenu, setconsumtionMenu] = useState(
    paths.includes("consumption") && true
  );

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="" />
        <h1>OMNI VIlLAGE</h1>
      </div>
      <a
        href="/dashboard"
        className={paths.includes("dashboard") ? "link active" : "link"}
      >
        <i class="fa-solid fa-chart-line"></i>
        <p>Dashboard</p>
      </a>
      <a
        className={paths.includes("production") ? "link active" : "link"}
        onClick={() => setproductionMenu(!productionMenu)}
      >
        <i class="fa-solid fa-seedling"></i>
        <p>Production</p>
        <span>
          {productionMenu ? (
            <i class="fa-solid fa-minus"></i>
          ) : (
            <i class="fa-solid fa-plus"></i>
          )}
        </span>
      </a>
      {productionMenu && (
        <div className="menu">
          <a
            href="/production/menu1"
            className={paths.includes("menu1") ? "link active" : "link"}
          >
            Menu 1
          </a>
          <a
            href="/production/menu2"
            className={paths.includes("menu2") ? "link active" : "link"}
          >
            Menu 2
          </a>
          <a
            href="/production/menu3"
            className={paths.includes("menu3") ? "link active" : "link"}
          >
            Menu 3
          </a>
          <a
            href="/production/menu4"
            className={paths.includes("menu4") ? "link active" : "link"}
          >
            Menu 4
          </a>
          <a
            href="/production/menu5"
            className={paths.includes("menu5") ? "link active" : "link"}
          >
            Menu 5
          </a>
        </div>
      )}
      <a
        onClick={() => setconsumtionMenu(!consumtionMenu)}
        className={paths.includes("consumption") ? "link active" : "link"}
      >
        <i class="fa-solid fa-utensils"></i>
        <p>Consumption</p>
        <span>
          {consumtionMenu ? (
            <i class="fa-solid fa-minus"></i>
          ) : (
            <i class="fa-solid fa-plus"></i>
          )}
        </span>
      </a>
      {consumtionMenu && (
        <div className="menu">
          <a
            href="/consumption/menu1"
            className={paths.includes("menu1") ? "link active" : "link"}
          >
            Menu 1
          </a>
          <a
            href="/consumption/menu2"
            className={paths.includes("menu2") ? "link active" : "link"}
          >
            Menu 2
          </a>
          <a
            href="/consumption/menu3"
            className={paths.includes("menu3") ? "link active" : "link"}
          >
            Menu 3
          </a>
          <a
            href="/consumption/menu4"
            className={paths.includes("menu4") ? "link active" : "link"}
          >
            Menu 4
          </a>
          <a
            href="/consumption/menu5"
            className={paths.includes("menu5") ? "link active" : "link"}
          >
            Menu 5
          </a>
        </div>
      )}
      <a
        href="/users"
        className={paths.includes("users") ? "link active" : "link"}
      >
        <i class="fa-solid fa-user-group"></i>
        <p>Users</p>
      </a>
      <a
        href="/crops"
        className={paths.includes("crops") ? "link active" : "link"}
      >
        <i class="fa-solid fa-carrot"></i>
        <p>Crops</p>
      </a>
      <a
        href="/logout"
        style={{ marginTop: "auto" }}
        className={paths.includes("logout") ? "link active" : "link"}
      >
        <i class="fa-solid fa-power-off"></i>
        <p>Logout</p>
      </a>
      <a
        href="/settings"
        className={paths.includes("settings") ? "link active" : "link"}
      >
        <i class="fa-solid fa-gear"></i>
        <p>Settings</p>
      </a>
    </div>
  );
}
