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
    delete: "hunting/delete_hunting",
  },
};
