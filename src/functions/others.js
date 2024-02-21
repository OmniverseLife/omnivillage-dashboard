import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchLabels = async () => {
  const res = await axiosInstance.get(endpoints.labels.get_all);
  return res.data;
};

export const fetchVillages = async () => {
  const res = await axiosInstance.get(endpoints.others.villages);
  return res?.data;
};
