import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

export const getDropdownValues = async (type) => {
    const res = await axiosInstance.get(endpoints.dropdowns[type].get);
    return res.data;
};

export const addDropdownValues = async (body) => {
    const res = await axiosInstance.post(
        endpoints.dropdowns[body.dropdown_type].add,
        body
    );
    return res.data;
};

export const editDropdownValues = async (body) => {
    const res = await axiosInstance.put(
        endpoints.dropdowns[body.dropdown_type].edit,
        body
    );
    return res.data;
};

export const deleteDropdownValues = async (body) => {
    const res = await axiosInstance.delete(
        endpoints.dropdowns[body.dropdown_type].delete,
        {
            params: { id: body.id },
        }
    );
    return res.data;
};
