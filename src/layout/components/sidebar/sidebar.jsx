import React, { useState } from "react";
import "./sidebar.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/logo.png";

export default function Sidebar() {
  const location = useLocation();
  const paths = location.pathname.split("/");
  const [productionMenu, setproductionMenu] = useState(
    paths.includes("production") && !paths.includes("dashboard") && true
  );
  const [consumtionMenu, setconsumtionMenu] = useState(
    paths.includes("consumption") && !paths.includes("dashboard") && true
  );
  const [cropsMenu, setcropsMenu] = useState(paths.includes("crops") && true);
  const [dashboardMenu, setdashboardMenu] = useState(
    paths.includes("dashboard") && true
  );

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="" />
        <h1>OMNI VIlLAGE</h1>
      </div>
      <Link
        // to="/dashboard"
        onClick={() => setdashboardMenu(!dashboardMenu)}
        className={paths.includes("dashboard") ? "link active" : "link"}
      >
        <i class="fa-solid fa-chart-line"></i>
        <p>Dashboard</p>
        <span>
          {dashboardMenu ? (
            <i class="fa-solid fa-minus"></i>
          ) : (
            <i class="fa-solid fa-plus"></i>
          )}
        </span>
      </Link>
      {dashboardMenu && (
        <div className="menu">
          <Link
            to="/dashboard/production"
            className={paths.includes("production") ? "link active" : "link"}
          >
            Production
          </Link>
          <Link
            to="/dashboard/consumption"
            className={paths.includes("consumption") ? "link active" : "link"}
          >
            Consumption
          </Link>
          <Link
            to="/dashboard/food-balance"
            className={paths.includes("food-balance") ? "link active" : "link"}
          >
            Food Balance
          </Link>
        </div>
      )}
      <Link
        className={
          paths.includes("production") && !paths.includes("dashboard")
            ? "link active"
            : "link"
        }
        onClick={() => setproductionMenu(!productionMenu)}
        // to="/production"
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
      </Link>
      {productionMenu && (
        <div className="menu">
          <Link
            to="/production/cultivation"
            className={paths.includes("cultivation") ? "link active" : "link"}
          >
            Cultivation
          </Link>
          <Link
            to="/production/trees&shrubs"
            className={paths.includes("trees&shrubs") ? "link active" : "link"}
          >
            Trees/Shrubs
          </Link>
          <Link
            to="/production/poultry"
            className={paths.includes("poultry") ? "link active" : "link"}
          >
            Poultry
          </Link>
          <Link
            to="/production/fishery"
            className={paths.includes("fishery") ? "link active" : "link"}
          >
            Fishery
          </Link>
          <Link
            to="/production/hunting"
            className={paths.includes("hunting") ? "link active" : "link"}
          >
            Hunting
          </Link>
          {/* <Link
            to="/production/storage"
            className={paths.includes("storage") ? "link active" : "link"}
          >
            Storage
          </Link>
          <Link
            to="/production/sellingChannel"
            className={
              paths.includes("sellingChannel") ? "link active" : "link"
            }
          >
            Selling Channel
          </Link> */}
        </div>
      )}
      <Link
        onClick={() => setconsumtionMenu(!consumtionMenu)}
        className={
          paths.includes("consumption") && !paths.includes("dashboard")
            ? "link active"
            : "link"
        }
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
      </Link>
      {consumtionMenu && (
        <div className="menu">
          <Link
            to="/consumption/menu1"
            className={paths.includes("menu1") ? "link active" : "link"}
          >
            Menu 1
          </Link>
          <Link
            to="/consumption/menu2"
            className={paths.includes("menu2") ? "link active" : "link"}
          >
            Menu 2
          </Link>
          <Link
            to="/consumption/menu3"
            className={paths.includes("menu3") ? "link active" : "link"}
          >
            Menu 3
          </Link>
          <Link
            to="/consumption/menu4"
            className={paths.includes("menu4") ? "link active" : "link"}
          >
            Menu 4
          </Link>
          <Link
            to="/consumption/menu5"
            className={paths.includes("menu5") ? "link active" : "link"}
          >
            Menu 5
          </Link>
        </div>
      )}
      <Link
        to="/users"
        className={paths.includes("users") ? "link active" : "link"}
      >
        <i class="fa-solid fa-user-group"></i>
        <p>Users</p>
      </Link>
      <a
        onClick={() => setcropsMenu(!cropsMenu)}
        className={paths.includes("crops") ? "link active" : "link"}
      >
        <i class="fa-solid fa-utensils"></i>
        <p>Crops</p>
        <span>
          {cropsMenu ? (
            <i class="fa-solid fa-minus"></i>
          ) : (
            <i class="fa-solid fa-plus"></i>
          )}
        </span>
      </a>
      {cropsMenu && (
        <div className="menu">
          <Link
            to="/crops/cultivation"
            className={paths.includes("cultivation") ? "link active" : "link"}
          >
            Cultivation
          </Link>
          <Link
            to="/crops/trees&shrubs"
            className={paths.includes("trees&shrubs") ? "link active" : "link"}
          >
            Trees/Shrubs
          </Link>
          <Link
            to="/crops/poultry"
            className={paths.includes("poultry") ? "link active" : "link"}
          >
            Poultry
          </Link>
          <Link
            to="/crops/fishery"
            className={paths.includes("fishery") ? "link active" : "link"}
          >
            Fishery
          </Link>
          <Link
            to="/crops/hunting"
            className={paths.includes("hunting") ? "link active" : "link"}
          >
            Hunting
          </Link>
        </div>
      )}
      <Link
        to="/logout"
        style={{ marginTop: "auto" }}
        className={paths.includes("logout") ? "link active" : "link"}
      >
        <i class="fa-solid fa-power-off"></i>
        <p>Logout</p>
      </Link>
      <Link
        to="/settings"
        className={paths.includes("settings") ? "link active" : "link"}
      >
        <i class="fa-solid fa-gear"></i>
        <p>Settings</p>
      </Link>
    </div>
  );
}
