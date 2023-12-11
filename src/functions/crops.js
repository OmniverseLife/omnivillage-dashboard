import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchCultivationCrops = async () => {
  const res = await axiosInstance.get(endpoints.cultivation.crops);
  return res.data;
};

export const fetchTreeCrops = async () => {
  const res = await axiosInstance.get(endpoints.trees.crops);
  return res.data;
};

export const fetchPoultryCrops = async () => {
  const res = await axiosInstance.get(endpoints.poultry.crops);
  return res.data;
};

export const fetchFisheryCrops = async () => {
  const res = await axiosInstance.get(endpoints.fishery.crops);
  return res.data;
};

export const fetchHuntingCrops = async () => {
  const res = await axiosInstance.get(endpoints.hunting.crops);
  return res.data;
};

export const addCultivationCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.cultivation.add_crop, body);
  return res.data;
};

export const addTreeCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.trees.add_crop, body);
  return res.data;
};

export const addPoultryCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.poultry.add_crop, body);
  return res.data;
};

export const addFisheryCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.fishery.add_crop, body);
  return res.data;
};

export const addHuntingCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.hunting.add_crop, body);
  return res.data;
};

export const editCultivationCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.cultivation.edit_crop, body);
  return res.data;
};

export const editTreeCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.trees.edit_crop, body);
  return res.data;
};

export const editPoultryCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.poultry.edit_crop, body);
  return res.data;
};

export const editFisheryCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.fishery.edit_crop, body);
  return res.data;
};

export const editHuntingCrops = async (body) => {
  const res = await axiosInstance.post(endpoints.hunting.edit_crop, body);
  return res.data;
};

export const deleteCultivationCrops = async (id) => {
  const res = await axiosInstance.delete(
    `${endpoints.cultivation.delete_crop}/${id}`
  );
  return res.data;
};

export const deleteTreeCrops = async (id) => {
  const res = await axiosInstance.delete(
    `${endpoints.trees.delete_crop}/${id}`
  );
  return res.data;
};

export const deletePoultryCrops = async (id) => {
  const res = await axiosInstance.delete(
    `${endpoints.poultry.delete_crop}/${id}`
  );
  return res.data;
};

export const deleteFisheryCrops = async (id) => {
  const res = await axiosInstance.delete(
    `${endpoints.fishery.delete_crop}/${id}`
  );
  return res.data;
};

export const deleteHuntingCrops = async (id) => {
  const res = await axiosInstance.delete(
    `${endpoints.hunting.delete_crop}/${id}`
  );
  return res.data;
};
