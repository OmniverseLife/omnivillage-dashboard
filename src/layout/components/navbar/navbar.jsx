import React from "react";
import "./navbar.css";
import { useLocation } from "react-router-dom";
import profile from "../../../assets/profile.png";
export default function Navbar() {
  const location = useLocation();
  const paths = location.pathname.split("/");
  console.log(paths);
  paths.shift();

  return (
    <div className="navbar">
      <div className="navbar-items">
        <h3 style={{ textTransform: "capitalize" }}>
          {paths[paths.length - 1]}
        </h3>
        <div className="profile">
          <span>
            <img src={profile} alt="" />
          </span>
          <div>
            <p>John Doe</p>
            <span>Production Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
}
