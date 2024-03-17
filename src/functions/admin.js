import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const login = async (body) => {
  const res = await axiosInstance.post(endpoints.admin.login, body);
  return res.data;
};

export const forgot_password = async (body) => {
  const res = await axiosInstance.post(endpoints.admin.forgot_password, body);
  return res.data;
};

export const change_password = async (body) => {
  const res = await axiosInstance.post(endpoints.admin.change_password, body);
  return res.data;
};
