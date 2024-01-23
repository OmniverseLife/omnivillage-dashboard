import { endpoints } from "../axios/endpoints";
import axiosInstance from "../axios/axiosInstance";

export const getLandAllocationData = async () => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.land_allocation_category_data
  );
  return res?.data;
};

export const getLandUsedData = async () => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.land_used_category_data
  );
  return res?.data;
};

export const getBifurcatedLabelData = async (type_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.bifurcated_chart_label,
    {
      params: {
        type_id,
      },
    }
  );
  return res?.data;
};

export const getBifurcatedCropData = async (crop_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.bifurcated_chart_crop,
    {
      params: { crop_id },
    }
  );
  return res?.data;
};

export const getIncomeExpenditureData = async () => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.income_expenditure
  );
  return res?.data;
};

export const getSellingChannelData = async () => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.selling_channel_data
  );
  return res?.data;
};

export const getStorageData = async () => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.storage_data
  );
  return res?.data;
};

export const getUtilizationData = async () => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.utilization_chart
  );
  return res?.data;
};

export const getConsumptionFromProductionData = async (type_id, crop_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.consumption_from_production,
    {
      params: {
        type_id,
        crop_id,
      },
    }
  );
  return res?.data;
};

export const getSelfGrownByTagsData = async (type_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.self_grown_by_tag,
    {
      params: {
        type_id,
      },
    }
  );
  return res?.data;
};

export const getSelfConsumedData = async (type_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.self_consumed_data,
    {
      params: {
        type_id,
      },
    }
  );
  return res?.data;
};

export const getPurchasedFromNeighboursData = async (type_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.purchased_from_neighbours_consumed,
    {
      params: {
        type_id,
      },
    }
  );
  return res?.data;
};

export const getPurchasedFromMarketData = async (type_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.purchased_from_market_consumed,
    {
      params: {
        type_id,
      },
    }
  );
  return res?.data;
};

export const getIdealConsumptionByLabelData = async () => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.ideal_consumption_by_label
  );
  return res?.data;
};

export const getIdealConsumptionExpectedData = async (type_id) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.ideal_consumption_expected,
    {
      params: {
        type_id,
      },
    }
  );
  return res?.data;
};

export const fetchFoodBalance = async (tag) => {
  const res = await axiosInstance.get(endpoints.dashboard.food_balance, {
    params: {
      type_id: tag,
    },
  });
  return res?.data;
};
