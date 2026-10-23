import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

const { places, team } = endpoints;

/* ---------------- places ---------------- */

/**
 * Countries, regions and villages as ONE list, already in tree order. `stats`
 * adds what the Locations table shows beside each place (village count, where
 * its languages and team come from). `diff`, sent with `stats`, adds how each
 * place's published questionnaire differs from the Master. The server reads
 * the whole questionnaire for that, and only for a super admin, so it is
 * asked for by the two screens that show it and by nothing else.
 */
export const fetchPlaces = async ({ stats = false, diff = false } = {}) => {
    const res = await axiosInstance.get(places.list, {
        params: { stats: stats ? 1 : undefined, diff: diff ? 1 : undefined },
    });
    return res.data;
};

export const addPlace = async (body) => {
    const res = await axiosInstance.post(places.list, body);
    return res.data;
};

export const editPlace = async ({ place_id, ...body }) => {
    const res = await axiosInstance.put(`${places.list}/${place_id}`, body);
    return res.data;
};

export const deletePlace = async (id) => {
    const res = await axiosInstance.delete(`${places.list}/${id}`);
    return res.data;
};

/* ---------------- team (dashboard accounts) ---------------- */

export const fetchTeam = async () => {
    const res = await axiosInstance.get(team.list);
    return res.data;
};

export const assignTeam = async (body) => {
    const res = await axiosInstance.put(team.assign, body);
    return res.data;
};

export const resendTeamPassword = async (id) => {
    const res = await axiosInstance.post(`${team.list}/${id}/resend`);
    return res.data;
};

export const removeTeamMember = async (id) => {
    const res = await axiosInstance.delete(`${team.list}/${id}`);
    return res.data;
};
