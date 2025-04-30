import axios from "axios";

export const baseURL = `${process.env.REACT_APP_BASE_URL}/api`;
export const stagingUrl = `${process.env.REACT_APP_BASE_URL_STAGING}/api`;
export const mediaURL = `${process.env.REACT_APP_BASE_URL}/`;
// export const baseURL = `${process.env.REACT_APP_TEST_URL}/api`;
// export const mediaURL = `${process.env.REACT_APP_TEST_URL}/`;

const axiosInstance = axios.create({
  baseURL: stagingUrl,
});

export default axiosInstance;
