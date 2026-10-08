import axios from "axios";
import { endpoints } from "./endpoints";

// export const baseURL = `${process.env.REACT_APP_BASE_URL}/api`;
// export const mediaURL = `${process.env.REACT_APP_BASE_URL}/`;
export const baseURL = `${process.env.REACT_APP_TEST_URL}/api`;
export const mediaURL = `${process.env.REACT_APP_TEST_URL}/`;

const axiosInstance = axios.create({
    baseURL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// A 401 means the stored session is no longer good (expired token, deleted
// account), so it is dropped and the browser goes back to the login page.
// The login call is left out: its failure belongs to the form that made it.
let redirecting = false;
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            error.config?.url !== endpoints.admin.login
        ) {
            localStorage.clear();
            // Once, because a page's calls fail together; and never from the
            // login page itself, where a reload would only loop.
            if (!redirecting && window.location.pathname !== "/login") {
                redirecting = true;
                window.location.replace("/login");
            }
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
