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
export const getGridAccess = () => fetchData(endpoints.energy.gridAccess);
export const getKwhConsumption = () =>
  fetchData(endpoints.energy.kwhConsumption);
export const getSpendVsConsumption = () =>
  fetchData(endpoints.energy.spendVsConsumption);
export const getFuelType = () => fetchData(endpoints.energy.fuelType);
export const getOtherFuels = () => fetchData(endpoints.energy.otherFuels);
export const getMicroGridUsage = () =>
  fetchData(endpoints.energy.microGridUsage);
export const getRenewableShare = () =>
  fetchData(endpoints.energy.renewableShare);
export const getEnergyPerCapita = () =>
  fetchData(endpoints.energy.energyPerCapita);

// ========== MOBILITY ==========
export const getVehicleTypeDistribution = () =>
  fetchData(endpoints.mobility.vehicleTypeDistribution);
export const getTravelDistanceSplit = () =>
  fetchData(endpoints.mobility.travelDistanceSplit);
export const getUsagePurpose = () => fetchData(endpoints.mobility.usagePurpose);
export const getUsageFrequency = () =>
  fetchData(endpoints.mobility.usageFrequency);
export const getVehicleRequirement = () =>
  fetchData(endpoints.mobility.vehicleRequirement);
export const getVehicleUrgency = () =>
  fetchData(endpoints.mobility.vehicleUrgency);
export const getVehiclePerHousehold = () =>
  fetchData(endpoints.mobility.vehiclePerHousehold);
export const getMobilityGap = () => fetchData(endpoints.mobility.mobilityGap);

// ========== FORESTRY ==========
export const getForestAreaByVillage = () =>
  fetchData(endpoints.forestry.forestAreaByVillage);
export const getTimberSplit = () => fetchData(endpoints.forestry.timberSplit);
export const getOtherProduce = () => fetchData(endpoints.forestry.otherProduce);
export const getTimberRequirement = () =>
  fetchData(endpoints.forestry.timberRequirement);
export const getPurposeCloud = () => fetchData(endpoints.forestry.purposeCloud);
export const getTimberNeedHarvested = () =>
  fetchData(endpoints.forestry.timberNeedHarvested);

// ========== PERSONAL ==========
export const getPersonalExpense = () =>
  fetchData(endpoints.personal.personalExpense);
export const getLocalStacked = () => fetchData(endpoints.personal.localStacked);
export const getLocalMarket = () => fetchData(endpoints.personal.localMarket);
export const getLocalProduceShare = () =>
  fetchData(endpoints.personal.localProduceShare);

// ========== COMMERCIAL ==========
export const getBusinessTypeDistribution = () =>
  fetchData(endpoints.commercial.businessTypeDistribution);
export const getBusinessStarted = () =>
  fetchData(endpoints.commercial.businessStarted);
export const getLegalStructure = () =>
  fetchData(endpoints.commercial.legalStructure);
export const getInvestmentIncome = () =>
  fetchData(endpoints.commercial.investmentIncome);
export const getManpowerSource = () =>
  fetchData(endpoints.commercial.manpowerSource);
export const getResourceConsumption = () =>
  fetchData(endpoints.commercial.resourceConsumption);
export const getSupportNeed = () => fetchData(endpoints.commercial.supportNeed);
export const getBusinessDetails = () =>
  fetchData(endpoints.commercial.businessDetails);
