import axios from "axios";

export const baseURL = `${process.env.REACT_APP_BASE_URL}/api`;
export const mediaURL = `${process.env.REACT_APP_BASE_URL}/`;
// export const baseURL = `${process.env.REACT_APP_TEST_URL}/api`;
// export const mediaURL = `${process.env.REACT_APP_TEST_URL}/uploads`;

const axiosInstance = axios.create({
  baseURL,
});

export default axiosInstance;
