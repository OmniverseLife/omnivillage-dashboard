import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const fetchAllUsers = async () => {
    const res = await axiosInstance.get(endpoints.user.list_all);
    return res.data;
};

export const downloadUserData = async (user_id) => {
    const res = await axiosInstance.get(`${endpoints.user.download}`, {
        params: {
            user_id,
        },
    });
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await axiosInstance.delete(endpoints.user.delete_user, {
        params: { id },
    });
    return res.data;
};
