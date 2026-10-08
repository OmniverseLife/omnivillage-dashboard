import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

// Where an account starts after signing in: a regional team on its own
// place's questionnaire. One whose place is gone has only Responses left.
// eslint-disable-next-line react-refresh/only-export-components
export const landingFor = (user) =>
  user?.role !== "regional"
    ? "/dashboard/production"
    : user.place?._id
    ? `/questionnaire/place/${user.place._id}`
    : "/questionnaire/responses";

export default function AuthProvider({ children, role, route }) {
  const navigate = useNavigate();
  const userrole =
    JSON.parse(localStorage.getItem("user") || "{}")?.role || "public";

  if (!userrole) {
    return <Navigate to="/login" />;
  }
  if (
    (route === "/login" || route === "/forgot-password") &&
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
