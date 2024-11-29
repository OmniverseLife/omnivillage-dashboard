import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const addModeratorToVillage = async (body) => {
    const res = await axiosInstance.put(
        endpoints.village.add_moderator_to_village,
        body
    );
    return res.data;
};
