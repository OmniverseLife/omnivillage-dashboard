import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getUsageFrequency } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const VehicleUsageFrequencyChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: usageFrequencyResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["usage-frequency-data", villageName, countryName],
    queryFn: () => getUsageFrequency(countryName, villageName), // Assuming API handles villageName filter
    enabled: !!villageName && !!countryName, // Enable if both are available
  });

  useEffect(() => {
    // Check if the response data array exists and has elements
    if (
      usageFrequencyResponse?.data &&
      Array.isArray(usageFrequencyResponse.data) &&
      usageFrequencyResponse.data.length > 0
    ) {
      // Find the specific village data, or use the first one if no villageName is specified
      const villageData = villageName
        ? usageFrequencyResponse.data.find(item => item.village === villageName)
        : usageFrequencyResponse.data[0];

      if (villageData && villageData.vehicleTypes && Array.isArray(villageData.vehicleTypes) && villageData.vehicleTypes.length > 0) {
        const vehicleTypesData = villageData.vehicleTypes;
        const currentVillageDisplay = villageData.village || villageName || "Selected Village";

        const categories = vehicleTypesData.map(item => item.vehicleType?.en?.trim() || "Unknown Type");

        const dailyData = vehicleTypesData.map(item => typeof item.daily === 'number' ? item.daily : 0);
        const weeklyData = vehicleTypesData.map(item => typeof item.weekly === 'number' ? item.weekly : 0);
        const monthlyData = vehicleTypesData.map(item => typeof item.monthly === 'number' ? item.monthly : 0);

        const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Regions";

        setChartOptions({
          chart: {
            type: "column", // Grouped column chart
            backgroundColor: "transparent",
            height: 400,
          },
          title: {
            text: `Vehicle Usage Frequency ${chartTitleVillagePart}`,
            align: "left",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            },
          },
          xAxis: {
            categories: categories, // Vehicle types on the X-axis
            title: {
              text: "Vehicle Type",
            },
            labels: {
              rotation: -45, // Rotate labels if many categories
              style: {
                color: "#666",
              },
            },
          },
          yAxis: {
            min: 0,
            title: {
              text: "Frequency Count",
            },
            labels: {
              formatter: function () {
                return `${this.value}`;
              },
              style: {
                color: "#666",
              },
            },
            allowDecimals: false, // Frequencies are typically whole numbers
          },
          tooltip: {
            headerFormat: '<b>{point.x}</b><br/>', // Vehicle Type
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>', // Frequency Type: Count
            shared: true, // Show all series for the hovered category
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
              dataLabels: { // Optional: Show data labels on bars
                  enabled: false, // Set to true if you want values on bars
                  format: '{point.y}',
                  style: {
                      fontWeight: 'bold',
                      textOutline: '1px white'
                  }
              }
            },
          },
          series: [
            {
              name: "Daily",
              data: dailyData,
              color: '#7cb5ed' // Highcharts default blue
            },
            {
              name: "Weekly",
              data: weeklyData,
              color: '#434348' // Highcharts default dark grey
            },
            {
              name: "Monthly",
              data: monthlyData,
              color: '#90ed7d' // Highcharts default green
            },
          ],
          credits: {
            enabled: false,
          },
          lang: {
              noData: `No vehicle usage frequency data available for ${currentVillageDisplay}.`
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
        // Handle case where villageData is found but has no vehicleTypes or vehicleTypes is empty
        const currentVillageDisplay = villageData?.village || villageName || "Selected Village";
        setChartOptions(getNoDataOptions(currentVillageDisplay));
      }
    } else {
      // Handle case where no data or empty data array
      setChartOptions(getNoDataOptions(villageName || "the selected region"));
    }
  }, [usageFrequencyResponse, villageName, countryName]); // Depend on the response and search params

  // Helper function for no data options
  const getNoDataOptions = (displayVillage) => ({
    chart: { type: "column", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Vehicle Usage Frequency ${displayVillage}`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: `No vehicle usage frequency data available for ${displayVillage}.` },
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
          Error loading usage frequency data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Final check for valid data to display
  const hasValidDataForDisplay = usageFrequencyResponse?.data?.length > 0 &&
                                (villageName
                                  ? usageFrequencyResponse.data.some(v => v.village === villageName && v.vehicleTypes?.length > 0)
                                  : usageFrequencyResponse.data[0]?.vehicleTypes?.length > 0);

  if (!hasValidDataForDisplay) {
    const currentVillageDisplay = (villageName
      ? usageFrequencyResponse?.data.find(v => v.village === villageName)?.village
      : usageFrequencyResponse?.data[0]?.village) || villageName || "the selected region";
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No vehicle usage frequency data available for {currentVillageDisplay}.
        </div>
      </StyledCard>
    );
  }

  const currentVillageForFooter = (villageName
    ? usageFrequencyResponse?.data.find(item => item.village === villageName)
    : usageFrequencyResponse?.data[0])?.village || villageName;

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
          Daily, weekly, and monthly vehicle usage frequencies in{" "}
          <strong>{currentVillageForFooter}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default VehicleUsageFrequencyChart;