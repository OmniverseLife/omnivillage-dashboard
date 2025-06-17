import React, { useState } from "react";
import "./sidebar.css";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import logo from "../../../assets/logo.png";

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const paths = location.pathname.split("/");
  const [searchParams] = useSearchParams();

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
        <h1>OMNI VILLAGE</h1>
      </div>
      <Link
        to="/chat"
        className={paths.includes("chat") ? "link active" : "link"}
      >
        <i className="fa-solid fa-robot"></i>
        <p>Omni Bot</p>
      </Link>
      {/* <Link
        to="/overview"
        className={paths.includes("overview") ? "link active" : "link"}
      >
        <i className="fa-solid fa-tachometer-alt"></i>
        <p>Overview</p>
      </Link> */}
      <Link
        // to="/dashboard"
        onClick={() => setdashboardMenu(!dashboardMenu)}
        className={paths.includes("dashboard") ? "link active" : "link"}
      >
        <i className="fa-solid fa-chart-line"></i>
        <p>Dashboard</p>
        <span>
          {dashboardMenu ? (
            <i className="fa-solid fa-minus"></i>
          ) : (
            <i className="fa-solid fa-plus"></i>
          )}
        </span>
      </Link>
      {dashboardMenu && (
        <div className="menu">
          <Link
            to="/overview"
            className={paths.includes("overview") ? "link active" : "link"}
          >
            <p>Overview</p>
          </Link>
          <Link
            to={`/dashboard/production`}
            className={paths.includes("production") ? "link active" : "link"}
          >
           Food (Production)
          </Link>
          <Link
            to={`/dashboard/consumption`}
            className={paths.includes("consumption") ? "link active" : "link"}
          >
            Food (Consumption)
          </Link>
          {/* <Link
            to={`/dashboard/food-balance`}
            className={paths.includes("food-balance") ? "link active" : "link"}
          >
            Food Balance
          </Link> */}
          <Link
            to={`/dashboard/demographics`}
            className={paths.includes("demographics") ? "link active" : "link"}
          >
            Demographics
          </Link>
          <Link
            to={`/dashboard/landholdings`}
            className={paths.includes("landholdings") ? "link active" : "link"}
          >
            Landholdings
          </Link>
          <Link
            to={`/dashboard/water`}
            className={paths.includes("water") ? "link active" : "link"}
          >
            Water
          </Link>
          <Link
            to={`/dashboard/housing`}
            className={paths.includes("housing") ? "link active" : "link"}
          >
            Housing
          </Link>
          <Link
            to={`/dashboard/energy`}
            className={paths.includes("energy") ? "link active" : "link"}
          >
            Energy & Fuel
          </Link>
          <Link
            to={`/dashboard/forestry`}
            className={paths.includes("forestry") ? "link active" : "link"}
          >
            Forestry and Timber
          </Link>
          <Link
            to={`/dashboard/mobility`}
            className={paths.includes("mobility") ? "link active" : "link"}
          >
            Mobility
          </Link>
          <Link
            to={`/dashboard/personal`}
            className={paths.includes("personal") ? "link active" : "link"}
          >
            Other Personal & Household items
          </Link>
          <Link
            to={`/dashboard/business`}
            className={paths.includes("business") ? "link active" : "link"}
          >
            Business & Commercial Establishments/ Organizations
          </Link>
        </div>
      )}
      {role === "admin" && (
        <>
          {/* <Link
            className={
              paths.includes("production") && !paths.includes("dashboard")
                ? "link active"
                : "link"
            }
            onClick={() => setproductionMenu(!productionMenu)}
            // to="/production"
          >
            <i className="fa-solid fa-seedling"></i>
            <p>Production</p>
            <span>
              {productionMenu ? (
                <i className="fa-solid fa-minus"></i>
              ) : (
                <i className="fa-solid fa-plus"></i>
              )}
            </span>
          </Link> */}
          {productionMenu && (
            <div className="menu">
              <Link
                to="/production/cultivation"
                className={
                  paths.includes("cultivation") ? "link active" : "link"
                }
              >
                Cultivation
              </Link>
              <Link
                to="/production/trees&shrubs"
                className={
                  paths.includes("trees&shrubs") ? "link active" : "link"
                }
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
          {/* <Link
            onClick={() => setconsumtionMenu(!consumtionMenu)}
            className={
              paths.includes("consumption") && !paths.includes("dashboard")
                ? "link active"
                : "link"
            }
          >
            <i className="fa-solid fa-utensils"></i>
            <p>Consumption</p>
            <span>
              {consumtionMenu ? (
                <i className="fa-solid fa-minus"></i>
              ) : (
                <i className="fa-solid fa-plus"></i>
              )}
            </span>
          </Link> */}
          {consumtionMenu && (
            <div className="menu">
              <Link
                to="/consumption/grains-nuts"
                className={
                  paths.includes("grains-nuts") ? "link active" : "link"
                }
              >
                Grains & Nuts
              </Link>
              {/* <Link
            to="/consumption/herbs"
            className={paths.includes("herbs") ? "link active" : "link"}
          >
            Herbs
          </Link> */}
              <Link
                to="/consumption/legumes"
                className={paths.includes("legumes") ? "link active" : "link"}
              >
                Legumes
              </Link>
              <Link
                to="/consumption/fuits-vegetables"
                className={
                  paths.includes("fuits-vegetables") ? "link active" : "link"
                }
              >
                Fruits & Vegetables
              </Link>
              <Link
                to="/consumption/dairy"
                className={paths.includes("dairy") ? "link active" : "link"}
              >
                Dairy
              </Link>
              <Link
                to="/consumption/meat"
                className={paths.includes("meat") ? "link active" : "link"}
              >
                Meat
              </Link>
              <Link
                to="/consumption/spices"
                className={paths.includes("spices") ? "link active" : "link"}
              >
                Sauces
              </Link>
              <Link
                to="/consumption/tea-coffee"
                className={
                  paths.includes("tea-coffee") ? "link active" : "link"
                }
              >
                Tea/Coffee
              </Link>
              <Link
                to="/consumption/oils"
                className={paths.includes("oils") ? "link active" : "link"}
              >
                Oils
              </Link>
              <Link
                to="/consumption/processed-foods"
                className={
                  paths.includes("processed-foods") ? "link active" : "link"
                }
              >
                Processed Foods
              </Link>
              <Link
                to="/consumption/alcohol"
                className={paths.includes("alcohol") ? "link active" : "link"}
              >
                Tobacco & Alcohol
              </Link>
            </div>
          )}
          {/* <Link
            to="/users"
            className={paths.includes("users") ? "link active" : "link"}
          >
            <i className="fa-solid fa-user-group"></i>
            <p>Users</p>
          </Link> */}
          <Link
            to="/moderators"
            className={paths.includes("moderators") ? "link active" : "link"}
          >
            <i className="fa-solid fa-gear"></i>
            <p>Moderators</p>
          </Link>
          <Link
            to="/assign-moderator-to-village"
            className={
              paths.includes("assign-moderator-to-village")
                ? "link active"
                : "link"
            }
          >
            <i className="fa-solid fa-gear"></i>
            <p>Assign</p>
          </Link>
          <Link
            to="/settings"
            className={paths.includes("settings") ? "link active" : "link"}
          >
            <i className="fa-solid fa-gear"></i>
            <p>Settings</p>
          </Link>
          <Link
            to="/dropdowns"
            className={paths.includes("dropdowns") ? "link active" : "link"}
          >
            <i className="fa-solid fa-gear"></i>
            <p>Dropdowns</p>
          </Link>
          <Link
            to="/moderator-dropdowns"
            className={paths.includes("dropdowns") ? "link active" : "link"}
          >
            <i className="fa-solid fa-gear"></i>
            <p>Moderator Dropdowns</p>
          </Link>
        </>
      )}
      <Link
        to="/login"
        onClick={() => {
          localStorage.clear();
        }}
        style={{ marginTop: "auto" }}
        className="link"
      >
        <i className="fa-solid fa-power-off"></i>
        <p>Logout</p>
      </Link>
    </div>
  );
}
