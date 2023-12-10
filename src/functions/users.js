import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchAllUsers = async () => {
  const res = await axiosInstance.get(endpoints.user.list_all);
  return res.data;
};
