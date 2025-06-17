import { lazy } from "react";

export const routes = [
  {
    path: "/users",
    Component: lazy(() => import("../layout/pages/users/users")),
    role: "admin",
  },
  // {
  //   path: "/crops/cultivation",
  //   Component: lazy(() => import("../layout/pages/crops/cultivation")),
  //   role: "admin",
  // },
  // {
  //   path: "/crops/fishery",
  //   Component: lazy(() => import("../layout/pages/crops/fishery")),
  //   role: "admin",
  // },
  // {
  //   path: "/crops/hunting",
  //   Component: lazy(() => import("../layout/pages/crops/hunting")),
  //   role: "admin",
  // },
  // {
  //   path: "/crops/poultry",
  //   Component: lazy(() => import("../layout/pages/crops/poultry")),
  //   role: "admin",
  // },
  // {
  //   path: "/crops/trees&shrubs",
  //   Component: lazy(() => import("../layout/pages/crops/treesShrubs")),
  //   role: "admin",
  // },
  {
    path: "/production/cultivation",
    Component: lazy(() => import("../layout/pages/production/cultivation")),
    role: "admin",
  },
  {
    path: "/production/fishery",
    Component: lazy(() => import("../layout/pages/production/fishery")),
    role: "admin",
  },
  {
    path: "/production/hunting",
    Component: lazy(() => import("../layout/pages/production/hunting")),
    role: "admin",
  },
  {
    path: "/production/poultry",
    Component: lazy(() => import("../layout/pages/production/poultry")),
    role: "admin",
  },
  {
    path: "/production/trees&shrubs",
    Component: lazy(() => import("../layout/pages/production/treesShrubs")),
    role: "admin",
  },
  {
    path: "/production/storage",
    Component: lazy(() => import("../layout/pages/production/storage")),
    role: "admin",
  },
  {
    path: "/consumption/grains-nuts",
    Component: lazy(() => import("../layout/pages/consumption/grainsandnuts")),
    role: "admin",
  },
  {
    path: "/consumption/herbs",
    Component: lazy(() => import("../layout/pages/consumption/herbs")),
    role: "admin",
  },
  {
    path: "/consumption/legumes",
    Component: lazy(() => import("../layout/pages/consumption/legumes")),
    role: "admin",
  },
  // {
  //   path: "/consumption/sellingChannel",
  //   Component: lazy(() => import("../layout/pages/consumption/sellingChannel")),
  // },
  {
    path: "/consumption/fuits-vegetables",
    Component: lazy(() => import("../layout/pages/consumption/fruits")),
    role: "admin",
  },
  {
    path: "/consumption/dairy",
    Component: lazy(() => import("../layout/pages/consumption/dairy")),
    role: "admin",
  },
  {
    path: "/consumption/meat",
    Component: lazy(() => import("../layout/pages/consumption/meat")),
    role: "admin",
  },
  {
    path: "/consumption/spices",
    Component: lazy(() => import("../layout/pages/consumption/spices")),
    role: "admin",
  },
  {
    path: "/consumption/tea-coffee",
    Component: lazy(() => import("../layout/pages/consumption/tea")),
    role: "admin",
  },
  {
    path: "/consumption/oils",
    Component: lazy(() => import("../layout/pages/consumption/oils")),
    role: "admin",
  },
  {
    path: "/consumption/processed-foods",
    Component: lazy(() => import("../layout/pages/consumption/processedFoods")),
    role: "admin",
  },
  {
    path: "/consumption/alcohol",
    Component: lazy(() => import("../layout/pages/consumption/alcohol")),
    role: "admin",
  },
  {
    path: "/dashboard/production",
    Component: lazy(() => import("../layout/pages/dashboard/production")),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/consumption",
    Component: lazy(() => import("../layout/pages/dashboard/consumption")),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/food-balance",
    Component: lazy(() => import("../layout/pages/dashboard/foodBalance")),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/demographics",
    Component: lazy(() =>
      import("../layout/pages/dashboard/Demographics/Dashboard")
    ),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/landholdings",
    Component: lazy(() =>
      import("../layout/pages/dashboard/Landholdings/Dashboard")
    ),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/housing",
    Component: lazy(() =>
      import("../layout/pages/dashboard/Housing/Dashboard")
    ),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/water",
    Component: lazy(() => import("../layout/pages/dashboard/Water/Dashboard")),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/energy",
    Component: lazy(() => import("../layout/pages/dashboard/Energy/Dashboard")),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/forestry",
    Component: lazy(() =>
      import("../layout/pages/dashboard/Forestry/Dashboard")
    ),
    role: "viewer,admin",
  },
  {
    path: "/chat",
    Component: lazy(() =>
      import("../layout/pages/chat/Chat")
    ),
    role: "viewer,admin",
  },
  {
    path: "/overview",
    Component: lazy(() =>
      import("../layout/pages/OverviewPage")
    ),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/mobility",
    Component: lazy(() =>
      import("../layout/pages/dashboard/Mobility/Dashboard")
    ),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/personal",
    Component: lazy(() =>
      import("../layout/pages/dashboard/Personal/Dashboard")
    ),
    role: "viewer,admin",
  },
  {
    path: "/dashboard/business",
    Component: lazy(() =>
      import("../layout/pages/dashboard/Business/Dashboard")
    ),
    role: "viewer,admin",
  },
  {
    path: "/login",
    Component: lazy(() => import("../layout/pages/login/login")),
    role: "public",
  },
  {
    path: "/forgot-password",
    Component: lazy(() => import("../layout/pages/login/forgotPassword")),
    role: "public",
  },
  {
    path: "/settings",
    Component: lazy(() => import("../layout/pages/settings/settings")),
    role: "admin",
  },
  {
    path: "/dropdowns",
    Component: lazy(() => import("../layout/pages/Dropdowns")),
    role: "admin",
  },
  {
    path: "/moderator-dropdowns",
    Component: lazy(() => import("../layout/pages/ModeratorDropdown")),
    role: "admin",
  },
  {
    path: "/moderators",
    Component: lazy(() => import("../layout/pages/moderator/moderator")),
    role: "admin",
  },
  {
    path: "/assign-moderator-to-village",
    Component: lazy(() =>
      import("../layout/pages/assign-moderator-to-villages")
    ),
    role: "admin",
  },
];
