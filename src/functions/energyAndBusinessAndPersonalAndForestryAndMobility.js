import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

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

// ========== ENERGY ==========
export const getGridAccess = (country, village) =>
  fetchData(endpoints.energy.gridAccess, { country, village });
export const getKwhConsumption = (country, village) =>
  fetchData(endpoints.energy.kwhConsumption, { country, village });
export const getSpendVsConsumption = (country, village) =>
  fetchData(endpoints.energy.spendVsConsumption, { country, village });
export const getFuelType = (country, village) =>
  fetchData(endpoints.energy.fuelType, { country, village });
export const getOtherFuels = (country, village) =>
  fetchData(endpoints.energy.otherFuels, { country, village });
export const getMicroGridUsage = (country, village) =>
  fetchData(endpoints.energy.microGridUsage, { country, village });
export const getRenewableShare = (country, village) =>
  fetchData(endpoints.energy.renewableShare, { country, village });
export const getEnergyPerCapita = (country, village) =>
  fetchData(endpoints.energy.energyPerCapita, { country, village });

// ========== MOBILITY ==========
export const getVehicleTypeDistribution = (country, village) =>
  fetchData(endpoints.mobility.vehicleTypeDistribution, { country, village });
export const getTravelDistanceSplit = (country, village) =>
  fetchData(endpoints.mobility.travelDistanceSplit, { country, village });
export const getUsagePurpose = (country, village) =>
  fetchData(endpoints.mobility.usagePurpose, { country, village });
export const getUsageFrequency = (country, village) =>
  fetchData(endpoints.mobility.usageFrequency, { country, village });
export const getVehicleRequirement = (country, village) =>
  fetchData(endpoints.mobility.vehicleRequirement, { country, village });
export const getVehicleUrgency = (country, village) =>
  fetchData(endpoints.mobility.vehicleUrgency, { country, village });
export const getVehiclePerHousehold = (country, village) =>
  fetchData(endpoints.mobility.vehiclePerHousehold, { country, village });
export const getMobilityGap = (country, village) =>
  fetchData(endpoints.mobility.mobilityGap, { country, village });

// ========== FORESTRY ==========
export const getForestAreaByVillage = (country, village) =>
  fetchData(endpoints.forestry.forestAreaByVillage, { country, village });
export const getTimberSplit = (country, village) =>
  fetchData(endpoints.forestry.timberSplit, { country, village });
export const getOtherProduce = (country, village) =>
  fetchData(endpoints.forestry.otherProduce, { country, village });
export const getTimberRequirement = (country, village) =>
  fetchData(endpoints.forestry.timberRequirement, { country, village });
export const getPurposeCloud = (country, village) =>
  fetchData(endpoints.forestry.purposeCloud, { country, village });
export const getTimberNeedHarvested = (country, village) =>
  fetchData(endpoints.forestry.timberNeedHarvested, { country, village });

// ========== PERSONAL ==========
export const getPersonalExpense = (country, village) =>
  fetchData(endpoints.personal.personalExpense, { country, village });
export const getLocalStacked = (country, village) =>
  fetchData(endpoints.personal.localStacked, { country, village });
export const getLocalMarket = (country, village) =>
  fetchData(endpoints.personal.localMarket, { country, village });
export const getLocalProduceShare = (country, village) =>
  fetchData(endpoints.personal.localProduceShare, { country, village });

// ========== COMMERCIAL ==========
export const getBusinessTypeDistribution = (country, village) =>
  fetchData(endpoints.commercial.businessTypeDistribution, {
    country,
    village,
  });
export const getBusinessStarted = (country, village) =>
  fetchData(endpoints.commercial.businessStarted, { country, village });
export const getLegalStructure = (country, village) =>
  fetchData(endpoints.commercial.legalStructure, { country, village });
export const getInvestmentIncome = (country, village) =>
  fetchData(endpoints.commercial.investmentIncome, { country, village });
export const getManpowerSource = (country, village) =>
  fetchData(endpoints.commercial.manpowerSource, { country, village });
export const getResourceConsumption = (country, village) =>
  fetchData(endpoints.commercial.resourceConsumption, { country, village });
export const getSupportNeed = (country, village) =>
  fetchData(endpoints.commercial.supportNeed, { country, village });
export const getBusinessDetails = (country, village) =>
  fetchData(endpoints.commercial.businessDetails, { country, village });
