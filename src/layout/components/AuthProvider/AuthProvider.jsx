import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function AuthProvider({ children, role, route }) {
  const navigate = useNavigate();
  const userrole =
    JSON.parse(localStorage.getItem("user") || "{}")?.role || "public";

  if (!userrole) {
    return <Navigate to="/login" />;
  }
  if (
    (route === "/login" || route === "/forogt-password") &&
    userrole !== "public"
  ) {
    return <Navigate to="/" />;
  }
  if (
    route !== "/login" &&
    route !== "/forgot-password" &&
    userrole === "public"
  ) {
    return <Navigate to="/login" />;
  }
  if (role?.includes(userrole)) {
    return children;
  }
  if (!role?.includes(userrole)) {
    return <Navigate to="/404" />;
  }

  return;
}
