import axiosInstance from "../axios/axiosInstance"; // Adjust path as needed
import { endpoints } from "../axios/endpoints"; // Ensure you have these paths defined

// Generic fetch handler
const fetchData = async (endpoint, params = {}) => {
  try {
    const res = await axiosInstance.get(endpoint, { params });
    return res?.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

// Landholding Dashboard API Calls

export const getParcelMapData = async () => {
  return fetchData(endpoints.landholding.parcelData);
};

export const getParcelSizeDistribution = async (village, country) => {
  return fetchData(endpoints.landholding.parcelSize, { village, country });
};

export const getLandUseDistribution = async (village, country) => {
  return fetchData(endpoints.landholding.locationSplit, { village, country });
};

export const getUtilisationStatus = async (village, country) => {
  return fetchData(endpoints.landholding.utilisationSplit, {village, country});
};

export const getUsagePurposeTreeMap = async (village, country) => {
  return fetchData(endpoints.landholding.usagePurpose,{village, country});
};

export const getIdleLandReasonSankey = async (village, country) => {
  return fetchData(endpoints.landholding.landIdleSankey, {village, country});
};
