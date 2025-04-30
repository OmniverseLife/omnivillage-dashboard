import axiosInstance from '../axios/axiosInstance'; // Import your axios instance
import { endpoints } from "../axios/endpoints";

// Helper function to handle API calls and error handling
const fetchData = async (endpoint, params = {}) => {
  try {
    const res = await axiosInstance.get(endpoint, { params });
    return res?.data; // Return the data, handle null/undefined response
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    //  Important:  Consider re-throwing the error or returning a specific error value.
    //  The caller of these functions needs to handle the error appropriately
    //  (e.g., showing a user-friendly message, retrying, etc.).
    throw error; //  Re-throw to be caught by the caller.
    //  OR:  return { error: true, message: 'Failed to fetch data' };
  }
};

// Define fetch functions for each route
export const getMaritalStatusByVillage = async (village) => {
  return fetchData(endpoints.demographic.maritalStatus, { village });
};

export const getDietShareByVillageAndOptionalGender = async (village, gender) => {
  return fetchData(endpoints.demographic.dietPattern, { village, gender });
};

export const getBMIDistributionByVillageAndOptionalGender = async (village, gender) => {
  return fetchData(endpoints.demographic.bmiDistribution, { village, gender });
};

export const getChronicDiseasePrevalence = async (village) => {
  return fetchData(endpoints.demographic.chronicDiseasePrevalence, { village });
};

export const getIncomeRangeByAgeAndOptionalGender = async (village, gender) => {
  return fetchData(endpoints.demographic.incomeRange, { village, gender });
};

export const getMotorDisabilityPrevalenceByVillageAndOptionalGender = async (village, gender) => {
  return fetchData(endpoints.demographic.motorDisability, { village, gender });
};

export const getVillagePopulationSnapshot = async (village) => {
  return fetchData(endpoints.demographic.populationSnapshot, { village });
};

export const getLanguageProficiencyHeatMap = async (village) => {
  return fetchData(endpoints.demographic.languageHeatmap, { village });
};
