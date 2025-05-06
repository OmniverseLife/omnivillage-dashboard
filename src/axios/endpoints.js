export const endpoints = {
  admin: {
    login: "/admin/login",
    forgot_password: "/admin/forgot-password",
    change_password: "/admin/change-password",
  },
  demographic: {
    maritalStatus: "/demographic-dashboard/marital-status",
    dietPattern: "/demographic-dashboard/diet-pattern",
    bmiDistribution: "/demographic-dashboard/bmi-distribution",
    chronicDiseasePrevalence:
      "/demographic-dashboard/chronic-disease-prevalence",
    incomeRange: "/demographic-dashboard/income-range",
    motorDisability: "/demographic-dashboard/motor-disability",
    populationSnapshot: "/demographic-dashboard/population-snapshot",
    languageHeatmap: "/demographic-dashboard/language-heatmap",
  },
  landholding: {
    parcelData: "/landholding-dashboard/parcel-data",
    parcelSize: "/landholding-dashboard/parcel-size",
    locationSplit: "/landholding-dashboard/location-split",
    utilisationSplit: "/landholding-dashboard/utilisation-split",
    usagePurpose: "/landholding-dashboard/usage-purpose",
    landIdleSankey: "/landholding-dashboard/land-idle-sankey",
  },
  user: {
    list_all: "/user/list-all",
    download: "/user/download-pdf",
    delete_user: "/user/delete_individual_user",
  },
  labels: {
    get_all: "/consumption_type",
  },
  cultivation: {
    crops: "/crop/get_all",
    add_crop: "/crop/add_crop",
    bulk_upload: "/crop/bulk-upload",
    edit_crop: "/crop/edit_crop",
    delete_crop: "/crop",
    get_all: "/cultivation/get_all",
    delete: "/cultivation/delete_cultivation",
  },
  trees: {
    crops: "/tree_crop/get_all",
    add_crop: "/tree_crop/add_tree_crop",
    bulk_upload: "/tree_crop/bulk-upload",
    edit_crop: "/tree_crop/edit_tree_crop",
    delete_crop: "/tree_crop",
    get_all: "/trees/get_all",
    delete: "/trees/delete_tree",
  },
  fishery: {
    crops: "/fishery_crop/get_all",
    add_crop: "/fishery_crop/add_fishery_crop",
    bulk_upload: "/fishery_crop/bulk-upload",
    edit_crop: "/fishery_crop/edit_fishery_crop",
    delete_crop: "/fishery_crop",
    get_all: "/fishery/get_all",
    delete: "/fishery/delete_fishery",
  },
  poultry: {
    crops: "/poultry_crop/get_all",
    add_crop: "/poultry_crop/add_poultry_crop",
    bulk_upload: "/poultry_crop/bulk-upload",
    edit_crop: "/poultry_crop/edit_poultry_crop",
    delete_crop: "/poultry_crop",
    get_all: "/poultry/get_all",
    delete: "/poultry/delete_poultry",
  },
  hunting: {
    crops: "/hunting_crop/get_all",
    add_crop: "/hunting_crop/add_hunting_crop",
    bulk_upload: "/hunting_crop/bulk-upload",
    edit_crop: "/hunting_crop/edit_hunting_crop",
    delete_crop: "/hunting_crop",
    get_all: "/hunting/get_all",
    delete: "/hunting/delete_hunting",
  },

  consumption: {
    dashboard: "/consumption_crop/dashboard",
    crops: "/consumption_crop/get_all",
    add_crop: "/consumption_crop/add_crop",
    bulk_upload: "/consumption_crop/bulk-upload",
    edit_crop: "/consumption_crop/edit_crop",
    delete_crop: "/consumption_crop",
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
      land_used_cultivation: "/dashboard/land_used_cultivation",
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
      crop_based_product_names: "/dashboard/crop_based_product_names",
      harvested_products: "/dashboard/harvested_products",
      category_wise_crops: "/dashboard/category_wise_crops",
      other_information_tree_fish_poultry_charts_all:
        "/dashboard/other_information_tree_fish_poultry_charts_all",
      organic_inorganic: "/dashboard/organic-inorganic",
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
    add_village: "/villages/add_village",
    edit_village: "/villages/edit_village",
    delete_village: "/villages/delete_village",
    feeds: "/feeds/get-all",
    add_feed: "/feeds/add-feed",
    edit_feed: "/feeds/edit-feed",
    delete_feed: "/feeds/delete-feed",
    fishFeeds: "/fish_feeds/get-all",
    addFishFeed: "/fish_feeds/add-fish-feed",
    editFishFeed: "/fish_feeds/edit-fish-feed",
    deleteFishFeed: "/fish_feeds/delete-fish-feed",
    get_all_crops: "/dashboard/all-crops",
  },

  moderator: {
    list_all: "/moderator/list-all",
    list_all_approved: "/moderator/list-all-approved",
    change_status: "/moderator/change-status",
  },

  village: {
    add_moderator_to_village: "/villages/add-moderator-to-village",
  },

  dropdowns: {
    demographic: {
      get: "/demographic_dropdown/get-all",
      add: "/demographic_dropdown/add_demographic_dropdown",
      edit: "/demographic_dropdown/edit_demographic_dropdown",
      delete: "/demographic_dropdown/delete_demographic_dropdown",
    },
    energy: {
      get: "/energy-dropdown/get-all",
      add: "/energy-dropdown/add-energy-dropdown",
      edit: "/energy-dropdown/edit-energy-dropdown",
      delete: "/energy-dropdown/delete-energy-dropdown",
    },
    housing: {
      get: "/housing-dropdown/get-all",
      add: "/housing-dropdown/add-housing-dropdown",
      edit: "/housing-dropdown/edit-housing-dropdown",
      delete: "/housing-dropdown/delete-housing-dropdown",
    },
    landholding: {
      get: "/landholding-dropdown/get-all",
      add: "/landholding-dropdown/add-landholding-dropdown",
      edit: "/landholding-dropdown/edit-landholding-dropdown",
      delete: "/landholding-dropdown/delete-landholding-dropdown",
    },
    mobility: {
      get: "/mobility-dropdown/get-all",
      add: "/mobility-dropdown/add-mobility-dropdown",
      edit: "/mobility-dropdown/edit-mobility-dropdown",
      delete: "/mobility-dropdown/delete-mobility-dropdown",
    },
    water: {
      get: "/water-dropdown/get-all",
      add: "/water-dropdown/add-water-dropdown",
      edit: "/water-dropdown/edit-water-dropdown",
      delete: "/water-dropdown/delete-water-dropdown",
    },
    forestry: {
      get: "/forestry-dropdown/get-all",
      add: "/forestry-dropdown/add-forestry-dropdown",
      edit: "/forestry-dropdown/edit-forestry-dropdown",
      delete: "/forestry-dropdown/delete-forestry-dropdown",
    },
    other_personal_household_items_dropdown: {
      get: "/other-personal-household-items-dropdown/get-all",
      add: "/other-personal-household-items-dropdown/add-personal-household-dropdown",
      edit: "/other-personal-household-items-dropdown/edit-personal-household-dropdown",
      delete:
        "/other-personal-household-items-dropdown/delete-personal-household-dropdown",
    },
    business: {
      get: "/business-dropdown/get-all",
      add: "/business-dropdown/add-business-dropdown",
      edit: "/business-dropdown/edit-business-dropdown",
      delete: "/business-dropdown/delete-business-dropdown",
    },
  },

  moderator_dropdown: {
    business: "/business-officer-dropdown",
    community: "/community-officer-dropdown",
    demographic: "/demographic-officer-dropdown",
    energy: "/energy-officer-dropdown",
    forestry: "/forestry-officer-dropdown",
    landholding: "/landholding-officer-dropdown",
    mobility: "/mobility-officer-dropdown",
    water: "/water-officer-dropdown",
  },
};
