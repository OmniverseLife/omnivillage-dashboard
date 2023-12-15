import { lazy } from "react";

export const routes = [
  {
    path: "/users",
    Component: lazy(() => import("../layout/pages/users/users")),
  },
  {
    path: "/crops/cultivation",
    Component: lazy(() => import("../layout/pages/crops/cultivation")),
  },
  {
    path: "/crops/fishery",
    Component: lazy(() => import("../layout/pages/crops/fishery")),
  },
  {
    path: "/crops/hunting",
    Component: lazy(() => import("../layout/pages/crops/hunting")),
  },
  {
    path: "/crops/poultry",
    Component: lazy(() => import("../layout/pages/crops/poultry")),
  },
  {
    path: "/crops/trees&shrubs",
    Component: lazy(() => import("../layout/pages/crops/treesShrubs")),
  },
  {
    path: "/production/cultivation",
    Component: lazy(() => import("../layout/pages/production/cultivation")),
  },
  {
    path: "/production/fishery",
    Component: lazy(() => import("../layout/pages/production/fishery")),
  },
  {
    path: "/production/hunting",
    Component: lazy(() => import("../layout/pages/production/hunting")),
  },
  {
    path: "/production/poultry",
    Component: lazy(() => import("../layout/pages/production/poultry")),
  },
  {
    path: "/production/trees&shrubs",
    Component: lazy(() => import("../layout/pages/production/treesShrubs")),
  },
  {
    path: "/production/storage",
    Component: lazy(() => import("../layout/pages/production/storage")),
  },
  {
    path: "/production/sellingChannel",
    Component: lazy(() => import("../layout/pages/production/sellingChannel")),
  },
  {
    path: "/dashboard/production",
    Component: lazy(() => import("../layout/pages/dashboard/production")),
  },
  {
    path: "/dashboard/consumption",
    Component: lazy(() => import("../layout/pages/dashboard/consumption")),
  },
  {
    path: "/dashboard/food-balance",
    Component: lazy(() => import("../layout/pages/dashboard/foodBalance")),
  },
];
