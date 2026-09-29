import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

const { categories, questions, responses } = endpoints.questionnaire;

/* ---------------- categories ---------------- */

export const fetchCategories = async ({ tree = false, includeInactive = true } = {}) => {
    const res = await axiosInstance.get(categories.get, {
        params: { tree: tree ? "true" : undefined, includeInactive: includeInactive ? "true" : undefined },
    });
    return res.data;
};

export const addCategory = async (body) => {
    const res = await axiosInstance.post(categories.add, body);
    return res.data;
};

export const editCategory = async (body) => {
    const res = await axiosInstance.put(categories.edit, body);
    return res.data;
};

export const reparentCategory = async (body) => {
    const res = await axiosInstance.put(categories.reparent, body);
    return res.data;
};

export const reorderCategories = async (body) => {
    const res = await axiosInstance.put(categories.reorder, body);
    return res.data;
};

export const deleteCategory = async (id) => {
    const res = await axiosInstance.delete(categories.delete, { params: { id } });
    return res.data;
};

/* ---------------- questions ---------------- */

export const fetchQuestions = async (categoryId, includeInactive = true) => {
    const res = await axiosInstance.get(questions.get, {
        params: { categoryId, includeInactive: includeInactive ? "true" : undefined },
    });
    return res.data;
};

export const addQuestion = async (body) => {
    const res = await axiosInstance.post(questions.add, body);
    return res.data;
};

export const editQuestion = async (body) => {
    const res = await axiosInstance.put(questions.edit, body);
    return res.data;
};

export const replaceQuestion = async (body) => {
    const res = await axiosInstance.post(questions.replace, body);
    return res.data;
};

export const toggleQuestion = async (body) => {
    const res = await axiosInstance.put(questions.toggle, body);
    return res.data;
};

export const reorderQuestions = async (body) => {
    const res = await axiosInstance.put(questions.reorder, body);
    return res.data;
};

export const deleteQuestion = async (id) => {
    const res = await axiosInstance.delete(questions.delete, { params: { id } });
    return res.data;
};

/* ---------------- responses ---------------- */

/**
 * `params` is already in wire shape — `f` and `village` may each be arrays,
 * which axios serialises as repeated query params, matching the backend's
 * repeatable-filter contract.
 */
export const fetchResponses = async (params) => {
    const res = await axiosInstance.get(responses.list, { params });
    return res.data;
};

export const fetchResponseRows = async (params) => {
    const res = await axiosInstance.get(responses.rows, { params });
    return res.data;
};

export const fetchResponseStats = async (params) => {
    const res = await axiosInstance.get(responses.stats, { params });
    return res.data;
};
