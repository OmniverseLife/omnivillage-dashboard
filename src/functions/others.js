import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchLabels = async () => {
  const res = await axiosInstance.get(endpoints.labels.get_all);
  return res.data;
};

export const fetchFoodBalance = async (tag) => {
  const res = await axiosInstance.get(endpoints.dashboard.food_balance, {
    params: {
      type_id: tag,
    },
  });
  return res?.data;
};
