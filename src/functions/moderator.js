import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const getAllModerators = async () => {
    const res = await axiosInstance.get(endpoints.moderator.list_all);
    return res.data;
};

export const getAllApprovedModerators = async () => {
    const res = await axiosInstance.get(endpoints.moderator.list_all_approved);
    return res.data;
};

export const changeModeratorStatus = async (body) => {
    const res = await axiosInstance.put(
        endpoints.moderator.change_status,
        body
    );
    return res.data;
};
