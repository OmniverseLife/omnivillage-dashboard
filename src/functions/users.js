import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchAllUsers = async () => {
  const res = await axiosInstance.get(endpoints.user.list_all);
  return res.data;
};

export const downloadUserData = async (user_id) => {
  console.log(user_id);
  const res = await axiosInstance.get(`${endpoints.user.download}`, {
    params: {
      user_id,
    },
  });
  return res.data;
};
