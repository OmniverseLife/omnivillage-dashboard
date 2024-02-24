export const endpoints = {
  user: {
    list_all: "/user/list-all",
  },
  labels: {
    get_all: "/consumption_type",
  },
  cultivation: {
    crops: "/crop/get_all",
    add_crop: "/crop/add_crop",
    edit_crop: "/crop/edit_crop",
    delete_crop: "/crop",
    get_all: "/cultivation/get_all",
    delete: "/cultivation/delete_cultivation",
  },
  trees: {
    crops: "/tree_crop/get_all",
    add_crop: "/tree_crop/add_tree_crop",
    edit_crop: "/tree_crop/edit_tree_crop",
    delete_crop: "/tree_crop",
    get_all: "/trees/get_all",
    delete: "/trees/delete_tree",
  },
  fishery: {
    crops: "/fishery_crop/get_all",
    add_crop: "/fishery_crop/add_fishery_crop",
    edit_crop: "/fishery_crop/edit_fishery_crop",
    delete_crop: "/fishery_crop",
    get_all: "/fishery/get_all",
    delete: "/fishery/delete_fishery",
  },
  poultry: {
    crops: "/poultry_crop/get_all",
    add_crop: "/poultry_crop/add_poultry_crop",
    edit_crop: "/poultry_crop/edit_poultry_crop",
    delete_crop: "/poultry_crop",
    get_all: "/poultry/get_all",
    delete: "/poultry/delete_poultry",
  },
  hunting: {
    crops: "/hunting_crop/get_all",
    add_crop: "/hunting_crop/add_hunting_crop",
    edit_crop: "/hunting_crop/edit_hunting_crop",
    delete_crop: "/hunting_crop",
    get_all: "/hunting/get_all",
    delete: "/hunting/delete_hunting",
  },

  consumption: {
    dashboard: "/consumption_crop/dashboard",
  },
  grains: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28381f75fd724a743b3",
    // delete: "/consumption/delete_hunting",
  },
  // vegetables: {
  //   get_all:
  //     "/consumption/get_all?consumption_type_id=6506e28381f75fd724a743b3",
  //   // delete: "/consumption/delete_hunting",
  // },
  herbs: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28381f75fd724a743b3",
    // delete: "/consumption/delete_hunting",
  },
  legumes: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28381f75fd724a743b9",
    // delete: "/consumption/delete_hunting",
  },
  fruits_vegetables: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28381f75fd724a743bb",
    // delete: "/consumption/delete_hunting",
  },
  dairy: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28381f75fd724a743bd",
    // delete: "/consumption/delete_hunting",
  },
  meat: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28381f75fd724a743bf",
    // delete: "/consumption/delete_hunting",
  },
  sauce: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28481f75fd724a743c3",
    // delete: "/consumption/delete_hunting",
  },
  tea: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28481f75fd724a743c5",
    // delete: "/consumption/delete_hunting",
  },
  oils: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28481f75fd724a743c7",
    // delete: "/consumption/delete_hunting",
  },
  processedFoods: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28481f75fd724a743c9",
    // delete: "/consumption/delete_hunting",
  },
  alcohol: {
    get_all:
      "/consumption/get_all?consumption_type_id=6506e28481f75fd724a743cb",
    // delete: "/consumption/delete_hunting",
  },

  dashboard: {
    production: {
      land_allocation_category_data: "/dashboard/land_allocation_category_data",
      land_used_category_data: "/dashboard/land_used_category_data",
      bifurcated_chart_label: "/dashboard/bifurcated_chart_label",
      bifurcated_chart_crop: "/dashboard/bifurcated_chart_crop",
      utilization_chart: "/dashboard/utilization_chart",
      income_expenditure: "/dashboard/income_expenditure",
      selling_channel_data: "/dashboard/selling_channel_data",
      storage_data: "/dashboard/storage_data",
      other_informations:
        "/dashboard/other_information_tree_fish_poultry_charts",
      processing_method: "/dashboard/processing_method",
      soil_health: "/dashboard/soil-health",
    },
    consumption: {
      consumption_from_production: "/dashboard/consumption_from_production",
      self_grown_by_tag: "/dashboard/self_grown_by_tag",
      self_consumed_data: "/dashboard/self_consumed_data",
      purchased_from_neighbours_consumed:
        "/dashboard/purchased_from_neighbours_consumed",
      purchased_from_market_consumed:
        "/dashboard/purchased_from_market_consumed",
      ideal_consumption_by_label: "/dashboard/ideal_consumption_by_label",
      ideal_consumption_expected: "/dashboard/ideal_consumption_expected",
    },
    food_balance: "/dashboard/food-balance",
    deficiet_chart: "/dashboard/deficiet_chart",
  },
  others: {
    villages: "/villages",
  },
};
