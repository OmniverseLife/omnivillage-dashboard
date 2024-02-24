import { endpoints } from "../axios/endpoints";
import axiosInstance from "../axios/axiosInstance";

export const getLandAllocationData = async (village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.land_allocation_category_data,
    {
      params: {
        village,
      },
    }
  );
  return res?.data;
};

export const getLandUsedData = async (village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.land_used_category_data,
    {
      params: {
        village,
      },
    }
  );
  return res?.data;
};

export const getBifurcatedLabelData = async (type_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.bifurcated_chart_label,
    {
      params: {
        type_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getBifurcatedCropData = async (crop_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.bifurcated_chart_crop,
    {
      params: { crop_id, village },
    }
  );
  return res?.data;
};

export const getSoilHealth = async (crop_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.soil_health,
    {
      params: { crop_id, village },
    }
  );
  return res?.data;
};

export const getIncomeExpenditureData = async (village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.income_expenditure,
    {
      params: {
        village,
      },
    }
  );
  return res?.data;
};

export const getSellingChannelData = async (village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.selling_channel_data,
    {
      params: {
        village,
      },
    }
  );
  return res?.data;
};

export const getStorageData = async (village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.storage_data,
    {
      params: {
        village,
      },
    }
  );
  return res?.data;
};

export const getProcessingMethod = async (crop_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.processing_method,
    {
      params: {
        crop_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getOtherInformations = async (crop_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.production.other_informations,
    {
      params: {
        crop_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getConsumptionFromProductionData = async (
  type_id,
  crop_id,
  village
) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.consumption_from_production,
    {
      params: {
        type_id,
        crop_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getSelfGrownByTagsData = async (type_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.self_grown_by_tag,
    {
      params: {
        type_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getSelfConsumedData = async (type_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.self_consumed_data,
    {
      params: {
        type_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getPurchasedFromNeighboursData = async (type_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.purchased_from_neighbours_consumed,
    {
      params: {
        type_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getPurchasedFromMarketData = async (type_id, village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.purchased_from_market_consumed,
    {
      params: {
        type_id,
        village,
      },
    }
  );
  return res?.data;
};

export const getIdealConsumptionByLabelData = async (village) => {
  const res = await axiosInstance.get(
    endpoints.dashboard.consumption.ideal_consumption_by_label,
    {
      params: {
        village,
      },
    }
  );
  return res?.data;
};

export const getIdealConsumptionExpectedData = async (type_id, village) => {
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

export const fetchDeficietChart = async (village) => {
  const res = await axiosInstance.get(endpoints.dashboard.deficiet_chart, {
    params: {
      village,
    },
  });
  return res?.data;
};

export const fetchFoodBalance = async (tag, village) => {
  const res = await axiosInstance.get(endpoints.dashboard.food_balance, {
    params: {
      type_id: tag,
      village,
    },
  });
  return res?.data;
};
