import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchGrains = async () => {
  const res = await axiosInstance.get(endpoints.grains.get_all);
  return res.data;
};

export const fetchHerbs = async () => {
  const res = await axiosInstance.get(endpoints.herbs.get_all);
  return res.data;
};

export const fetchLegumes = async () => {
  const res = await axiosInstance.get(endpoints.legumes.get_all);
  return res.data;
};

export const fetchFruitsVegetables = async () => {
  const res = await axiosInstance.get(endpoints.fruits_vegetables.get_all);
  return res.data;
};

export const fetchDairy = async () => {
  const res = await axiosInstance.get(endpoints.dairy.get_all);
  return res.data;
};

export const fetchMeat = async () => {
  const res = await axiosInstance.get(endpoints.meat.get_all);
  return res.data;
};

export const fetchSauce = async () => {
  const res = await axiosInstance.get(endpoints.sauce.get_all);
  return res.data;
};

export const fetchTea = async () => {
  const res = await axiosInstance.get(endpoints.tea.get_all);
  return res.data;
};

export const fetchOils = async () => {
  const res = await axiosInstance.get(endpoints.oils.get_all);
  return res.data;
};

export const fetchProcessedFoods = async () => {
  const res = await axiosInstance.get(endpoints.processedFoods.get_all);
  return res.data;
};

export const fetchAlcohol = async () => {
  const res = await axiosInstance.get(endpoints.alcohol.get_all);
  return res.data;
};
