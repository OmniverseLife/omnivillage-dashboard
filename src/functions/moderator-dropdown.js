import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const getModeratorDropdownValues = async (type) => {
    const res = await axiosInstance.get(
        `${endpoints.moderator_dropdown[type]}/get-all`
    );
    return res.data;
};

export const addModeratorDropdownValues = async (body) => {
    const res = await axiosInstance.post(
        endpoints.moderator_dropdown[body.dropdown_type],
        body
    );
    return res.data;
};

export const editModeratorDropdownValues = async (body) => {
    const res = await axiosInstance.put(
        endpoints.moderator_dropdown[body.dropdown_type],
        body
    );
    return res.data;
};

export const deleteModeratorDropdownValues = async (body) => {
    const res = await axiosInstance.delete(
        endpoints.moderator_dropdown[body.dropdown_type],
        {
            params: { id: body.id },
        }
    );
    return res.data;
};
