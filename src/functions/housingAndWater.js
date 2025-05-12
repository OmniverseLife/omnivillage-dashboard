import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

// Generic fetch helper
const fetchData = async (endpoint, params = {}) => {
  try {
    const res = await axiosInstance.get(endpoint, { params });
    return res?.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * HOUSING DASHBOARD SERVICES
 */

export const getRenovationUrgency = (village, country) =>
  fetchData(endpoints.housing.renovationUrgency, { village, country });

export const getHousingType = (village, country) =>
  fetchData(endpoints.housing.housingType, { village, country });

export const getUnitFloorData = (village, country) =>
  fetchData(endpoints.housing.unitFloorData, { village, country });

export const getBuiltRenovated = (village, country) =>
  fetchData(endpoints.housing.builtRenovated, { village, country });

export const getAmenities = (village, country) =>
  fetchData(endpoints.housing.amenities, { village, country });

export const getAmenitiesHeatmap = (village, country) =>
  fetchData(endpoints.housing.amenitiesHeatmap, { village, country });

export const getEquipmentData = (village, country) =>
  fetchData(endpoints.housing.equipmentData, { village, country });

export const getExpansionDemand = (village, country) =>
  fetchData(endpoints.housing.expansionDemand, { village, country });

export const getRenovationDemand = (village, country) =>
  fetchData(endpoints.housing.renovationDemand, { village, country });

/**
 * WATER DASHBOARD SERVICES
 */

export const getWaterConsumption = (village, country) =>
  fetchData(endpoints.water.waterConsumption, { village, country });

export const getWaterSources = (village, country) =>
  fetchData(endpoints.water.waterSources, { village, country });

export const getSourceQuality = (village, country) =>
  fetchData(endpoints.water.sourceQuality, { village, country });

export const getSourceExpense = (village, country) =>
  fetchData(endpoints.water.sourceExpense, { village, country });

export const getHarvestingCapacity = (village, country) =>
  fetchData(endpoints.water.harvestingCapacity, { village, country });

export const getWasteDisposal = (village, country) =>
  fetchData(endpoints.water.wasteDisposal, { village, country });

export const getWasteRecycle = (village, country) =>
  fetchData(endpoints.water.wasteRecycle, { village, country });

export const getWasteScarcity = (village, country) =>
  fetchData(endpoints.water.wasteScarcity, { village, country });

export const getWasteMeter = (village, country) =>
  fetchData(endpoints.water.wasteMeter, { village, country });
