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

export const addVillage = async (body) => {
  const res = await axiosInstance.post(endpoints.others.add_village, body);
  return res?.data;
};

export const editVillage = async (body) => {
  const res = await axiosInstance.post(endpoints.others.edit_village, body);
  return res?.data;
};

export const deleteVillage = async (village_id) => {
  const res = await axiosInstance.delete(
    endpoints.others.delete_village + `/${village_id}`
  );
  return res.data;
};

export const fetchFeeds = async () => {
  const res = await axiosInstance.get(endpoints.others.feeds);
  return res?.data;
};

export const addFeed = async (body) => {
  const res = await axiosInstance.post(endpoints.others.add_feed, body);
  return res?.data;
};

export const editFeed = async (body) => {
  const res = await axiosInstance.post(endpoints.others.edit_feed, body);
  return res?.data;
};

export const deleteFeed = async (feed_id) => {
  const res = await axiosInstance.delete(
    endpoints.others.delete_feed + `/${feed_id}`
  );
  return res.data;
};

export const fetchFishFeeds = async () => {
  const res = await axiosInstance.get(endpoints.others.fishFeeds);
  return res?.data;
};

export const addFishFeed = async (body) => {
  const res = await axiosInstance.post(endpoints.others.addFishFeed, body);
  return res?.data;
};

export const editFishFeed = async (body) => {
  const res = await axiosInstance.post(endpoints.others.editFishFeed, body);
  return res?.data;
};

export const deleteFishFeed = async (feed_id) => {
  const res = await axiosInstance.delete(
    endpoints.others.deleteFishFeed + `/${feed_id}`
  );
  return res.data;
};

export const getAllCrops = async (country) => {
  const res = await axiosInstance.get(endpoints.others.get_all_crops, {
    params: {
      country,
    },
  });
  return res.data;
};
