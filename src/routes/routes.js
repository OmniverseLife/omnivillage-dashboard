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
    path: "/consumption/grains-nuts",
    Component: lazy(() => import("../layout/pages/consumption/grainsandnuts")),
  },
  {
    path: "/consumption/herbs",
    Component: lazy(() => import("../layout/pages/consumption/herbs")),
  },
  {
    path: "/consumption/legumes",
    Component: lazy(() => import("../layout/pages/consumption/legumes")),
  },
  // {
  //   path: "/consumption/sellingChannel",
  //   Component: lazy(() => import("../layout/pages/consumption/sellingChannel")),
  // },
  {
    path: "/consumption/fuits-vegetables",
    Component: lazy(() => import("../layout/pages/consumption/fruits")),
  },
  {
    path: "/consumption/dairy",
    Component: lazy(() => import("../layout/pages/consumption/dairy")),
  },
  {
    path: "/consumption/meat",
    Component: lazy(() => import("../layout/pages/consumption/meat")),
  },
  {
    path: "/consumption/spices",
    Component: lazy(() => import("../layout/pages/consumption/spices")),
  },
  {
    path: "/consumption/tea-coffee",
    Component: lazy(() => import("../layout/pages/consumption/tea")),
  },
  {
    path: "/consumption/oils",
    Component: lazy(() => import("../layout/pages/consumption/oils")),
  },
  {
    path: "/consumption/processed-foods",
    Component: lazy(() => import("../layout/pages/consumption/processedFoods")),
  },
  {
    path: "/consumption/alcohol",
    Component: lazy(() => import("../layout/pages/consumption/alcohol")),
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
