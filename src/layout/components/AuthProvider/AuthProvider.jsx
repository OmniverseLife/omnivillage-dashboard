import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Where an account starts after signing in: a regional team on its own
// place's questionnaire. One whose place is gone has only Responses left.
// eslint-disable-next-line react-refresh/only-export-components
export const landingFor = (user) =>
  user?.role !== "regional"
    ? "/dashboard/overview"
    : user.place?._id
    ? `/questionnaire/place/${user.place._id}`
    : "/questionnaire/responses";

export default function AuthProvider({ children, role, route }) {
  const location = useLocation();
  // A stored session this dashboard cannot read (not JSON, or a role it has
  // no pages for) is no session: the login form must stay reachable.
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem("user") || "{}")?.role;
  } catch (unreadable) {
    stored = null;
  }
  const userrole = ["admin", "viewer", "regional"].includes(stored)
    ? stored
    : "public";

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
    // Where they were going is kept for the sign-in page: a link to a file
    // (the exports are full of them) is often opened by someone signed out.
    // In the address, not in the router's state: App hands <Routes> the
    // browser's own location, which carries no state.
    const next = location.pathname + location.search;
    return (
      <Navigate
        to={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
      />
    );
  }
  if (role?.includes(userrole)) {
    return children;
  }
  if (!role?.includes(userrole)) {
    return <Navigate to="/404" replace />;
  }

  return;
}
