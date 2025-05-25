import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more"; // Needed for dual axes and more chart types

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getResourceConsumption } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

// Initialize Highcharts modules
HighchartsMore(Highcharts);

// Styled card
const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: 12,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
  },
  border: "1px solid #e0e0e0",
  backgroundColor: "#fff",
}));

const ResourceConsumptionChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: resourceConsumptionResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resource-consumption-data", villageName, countryName],
    queryFn: () => getResourceConsumption(countryName, villageName),
    enabled: !!countryName,
  });

  useEffect(() => {
    if (
      resourceConsumptionResponse?.data &&
      Array.isArray(resourceConsumptionResponse.data) &&
      resourceConsumptionResponse.data.length > 0
    ) {
      const transformedData = resourceConsumptionResponse.data.map(business => {
        const totalRawMaterialQuantity = (business.rawMaterialConsumption || []).reduce(
          (sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0),
          0
        );
        const totalFuelQuantity = (business.fuelConsumption || []).reduce(
          (sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0),
          0
        );
        return {
          ...business,
          totalRawMaterialQuantity,
          totalFuelQuantity,
          totalOverallConsumption: (business.energyConsumption || 0) + (business.waterConsumption || 0) + totalRawMaterialQuantity + totalFuelQuantity
        };
      }).sort((a, b) => b.totalOverallConsumption - a.totalOverallConsumption); // Sort by combined total for overview

      const categories = transformedData.map(item => item.businessName?.trim() || "Unknown Business");
      const energyConsumptionData = transformedData.map(item => typeof item.energyConsumption === 'number' ? item.energyConsumption : 0);
      const waterConsumptionData = transformedData.map(item => typeof item.waterConsumption === 'number' ? item.waterConsumption : 0);
      const totalRawMaterialQuantityData = transformedData.map(item => item.totalRawMaterialQuantity);
      const totalFuelQuantityData = transformedData.map(item => item.totalFuelQuantity);

      const hasData = categories.length > 0 &&
                      (energyConsumptionData.some(val => val > 0) ||
                       waterConsumptionData.some(val => val > 0) ||
                       totalRawMaterialQuantityData.some(val => val > 0) ||
                       totalFuelQuantityData.some(val => val > 0));

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
          height: 500, // Increased height for multiple axes
        },
        title: {
          text: `Resource Consumption by Business`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Business Name",
          },
          labels: {
            rotation: -45,
            style: {
              color: "#666",
            },
          },
        },
        yAxis: [
          { // Primary Y-axis for Energy and Water
            min: 0,
            title: {
              text: "Energy (kWh) / Water (Liters)",
              style: {
                color: '#333'
              }
            },
            labels: {
              formatter: function () {
                return `${this.value}`; // Units in tooltip/data label
              },
              style: {
                color: "#666",
              },
            },
            allowDecimals: false,
            // Visible if there's data for it
            visible: energyConsumptionData.some(val => val > 0) || waterConsumptionData.some(val => val > 0)
          },
          { // Secondary Y-axis for Raw Material and Fuel (aggregated)
            min: 0,
            title: {
              text: "Raw Material / Fuel Quantity (Mixed Units)",
              style: {
                color: '#333'
              }
            },
            labels: {
              formatter: function () {
                return `${this.value}`; // Units in tooltip/data label
              },
              style: {
                color: "#666",
              },
            },
            opposite: true, // Place on the right side
            allowDecimals: false,
            // Visible if there's data for it
            visible: totalRawMaterialQuantityData.some(val => val > 0) || totalFuelQuantityData.some(val => val > 0)
          }
        ],
        tooltip: {
          shared: true,
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: {
                fontWeight: 'bold',
                color: 'black',
                textOutline: '1px white'
              },
            },
            pointPadding: 0.1,
            groupPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Energy Consumption",
            data: energyConsumptionData,
            color: '#FF9800', // Orange
            yAxis: 0, // Assign to primary Y-axis
            tooltip: {
              pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} kWh</b><br/>',
            },
            dataLabels: {
              format: '{point.y} kWh',
            },
          },
          {
            name: "Water Consumption",
            data: waterConsumptionData,
            color: '#2196F3', // Blue
            yAxis: 0, // Assign to primary Y-axis
            tooltip: {
              pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} Liters</b><br/>',
            },
            dataLabels: {
              format: '{point.y} Liters',
            },
          },
          {
            name: "Aggregated Raw Material",
            data: totalRawMaterialQuantityData,
            color: '#8BC34A', // Light Green
            yAxis: 1, // Assign to secondary Y-axis
            type: 'spline', // Use spline to differentiate visually
            dashStyle: 'Dot', // Dashed line for clarity
            tooltip: {
              pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} (Mixed Units)</b><br/>',
            },
            dataLabels: {
              format: '{point.y}', // Only quantity, unit is too verbose for line
              enabled: false // Disable data labels on line by default, or only on points
            },
            marker: {
                enabled: true,
                radius: 4
            }
          },
          {
            name: "Aggregated Fuel",
            data: totalFuelQuantityData,
            color: '#9C27B0', // Purple
            yAxis: 1, // Assign to secondary Y-axis
            type: 'spline', // Use spline to differentiate visually
            dashStyle: 'Dash', // Dashed line for clarity
            tooltip: {
              pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} (Mixed Units)</b><br/>',
            },
            dataLabels: {
              format: '{point.y}', // Only quantity, unit is too verbose for line
              enabled: false
            },
            marker: {
                enabled: true,
                radius: 4
            }
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No resource consumption data available."
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#303030'
            }
        }
      });
    } else {
      setChartOptions(getNoDataOptions());
    }
  }, [resourceConsumptionResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "column", backgroundColor: "transparent", height: 500 },
    title: {
      text: `Resource Consumption by Business`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: [{}, {}], // Keep dual axes even for no data
    series: [],
    credits: { enabled: false },
    lang: { noData: "No resource consumption data available." },
    noData: { style: { fontWeight: 'bold', fontSize: '15px', color: '#303030' } }
  });

  if (isLoading) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <CircularProgress />
        </div>
      </StyledCard>
    );
  }

  if (isError) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ color: "red", padding: 16, textAlign: "center" }}>
          Error loading resource consumption data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = resourceConsumptionResponse?.data &&
                                resourceConsumptionResponse.data.some(item =>
                                  (typeof item.energyConsumption === 'number' && item.energyConsumption > 0) ||
                                  (typeof item.waterConsumption === 'number' && item.waterConsumption > 0) ||
                                  (item.rawMaterialConsumption || []).some(rm => typeof rm.quantity === 'number' && rm.quantity > 0) ||
                                  (item.fuelConsumption || []).some(fc => typeof fc.quantity === 'number' && fc.quantity > 0)
                                );

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No resource consumption data available.
        </div>
      </StyledCard>
    );
  }

  return (
    <StyledCard sx={{ marginTop: 4, paddingTop: "72px" }}>
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ marginTop: 2 }}
        >
          Comparison of energy (kWh), water (Liters), and aggregated raw material/fuel consumption across different businesses. Note: Aggregated raw material and fuel quantities represent a sum of items with varying units.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default ResourceConsumptionChart;