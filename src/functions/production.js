import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchCultivations = async () => {
  const res = await axiosInstance.get(endpoints.cultivation.get_all);
  return res.data;
};

export const fetchTrees = async () => {
  const res = await axiosInstance.get(endpoints.trees.get_all);
  return res.data;
};

export const fetchPoultry = async () => {
  const res = await axiosInstance.get(endpoints.poultry.get_all);
  return res.data;
};

export const fetchHunting = async () => {
  const res = await axiosInstance.get(endpoints.hunting.get_all);
  return res.data;
};

export const fetchFishery = async () => {
  const res = await axiosInstance.get(endpoints.fishery.get_all);
  return res.data;
};

export const deleteCultivation = async (id) => {
  const res = await axiosInstance.delete(
    `${endpoints.cultivation.delete}/${id}`
  );
  return res.data;
};

export const deleteTree = async (id) => {
  const res = await axiosInstance.delete(`${endpoints.trees.delete}/${id}`);
  return res.data;
};

export const deleteHunting = async (id) => {
  const res = await axiosInstance.delete(`${endpoints.hunting.delete}/${id}`);
  return res.data;
};

export const deleteFishery = async (id) => {
  const res = await axiosInstance.delete(`${endpoints.fishery.delete}/${id}`);
  return res.data;
};

export const deletePoultry = async (id) => {
  const res = await axiosInstance.delete(`${endpoints.poultry.delete}/${id}`);
  return res.data;
};
