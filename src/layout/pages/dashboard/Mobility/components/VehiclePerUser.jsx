import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Ensure Highcharts modules like 'no-data-to-display' are loaded if needed
// import HighchartsNoData from 'highcharts/modules/no-data-to-display';
// HighchartsNoData(Highcharts);

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getVehiclePerHousehold } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const VehiclesPerUserChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: vehiclePerHouseholdResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vehicle-per-household-data", villageName, countryName],
    queryFn: () => getVehiclePerHousehold(countryName, villageName), // Assuming API handles villageName filter
    enabled: !!villageName && !!countryName, // Enable query if both are available
  });

  useEffect(() => {
    // Check if the response data array exists and has elements
    if (
      vehiclePerHouseholdResponse?.data &&
      Array.isArray(vehiclePerHouseholdResponse.data) &&
      vehiclePerHouseholdResponse.data.length > 0
    ) {
      // Find the specific village data, or use the first one if no villageName is specified
      const villageData = villageName
        ? vehiclePerHouseholdResponse.data.find(item => item.villageName === villageName)
        : vehiclePerHouseholdResponse.data[0];

      if (villageData && villageData.users && Array.isArray(villageData.users) && villageData.users.length > 0) {
        // Sort users by vehicleCount in descending order for better visualization
        const sortedUsers = [...villageData.users].sort(
          (a, b) => (b.vehicleCount || 0) - (a.vehicleCount || 0)
        );

        const categories = sortedUsers.map(user => user.user_id || "Unknown User");
        const seriesData = sortedUsers.map(user => typeof user.vehicleCount === 'number' ? user.vehicleCount : 0);
        const averageVehicles = typeof villageData.averageVehiclesPerUser === 'number' ? villageData.averageVehiclesPerUser : 0;

        const currentVillageDisplay = villageData.villageName || villageName || "Selected Village";
        const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Regions";

        setChartOptions({
          chart: {
            type: "column",
            backgroundColor: "transparent",
            height: 400,
          },
          title: {
            text: `Vehicles Per Household ${chartTitleVillagePart}`,
            align: "left",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            },
          },
          xAxis: {
            categories: "", // User IDs on the X-axis
            title: {
              text: "User",
            },
            labels: {
              rotation: -45, // Rotate labels if many users
              style: {
                color: "#666",
              },
            },
          },
          yAxis: {
            min: 0,
            title: {
              text: "Number of Vehicles",
            },
            labels: {
              formatter: function () {
                return `${this.value}`;
              },
              style: {
                color: "#666",
              },
            },
            allowDecimals: false, // Vehicle counts are whole numbers
            plotLines: [{ // Plot line for average
                value: averageVehicles,
                color: 'red',
                dashStyle: 'ShortDash',
                width: 2,
                label: {
                    text: `Average: ${averageVehicles.toFixed(1)}`,
                    align: 'right',
                    x: -10,
                    style: {
                        color: 'red',
                        fontWeight: 'bold'
                    }
                },
                zIndex: 5 // Ensure it's above the columns
            }]
          },
          tooltip: {
            headerFormat: '<b>Household</b><br/>',
            pointFormat: '<span style="color:{point.color}">{series.name}</span>: <b>{point.y} Vehicles</b>',
            shared: false,
          },
          plotOptions: {
            column: {
              dataLabels: {
                enabled: true,
                format: "{point.y}", // Show the count on top of the bar
                style: {
                  fontWeight: "bold",
                  color: "black",
                  textOutline: '1px white'
                },
              },
              pointPadding: 0.1,
              groupPadding: 0.2,
              borderWidth: 0,
              colorByPoint: true, // Assign different colors to each bar
            },
          },
          series: [
            {
              name: "Vehicle Count",
              data: seriesData,
            },
          ],
          credits: {
            enabled: false,
          },
          lang: {
              noData: `No vehicle data available for users in ${currentVillageDisplay}.`
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
        // Handle case where villageData is found but has no users or users is empty
        const currentVillageDisplay = villageData?.villageName || villageName || "Selected Village";
        setChartOptions(getNoDataOptions(currentVillageDisplay));
      }
    } else {
      // Handle case where no data or empty data array
      setChartOptions(getNoDataOptions(villageName || "the selected region"));
    }
  }, [vehiclePerHouseholdResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = (displayVillage) => ({
    chart: { type: "column", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Vehicles Per User ${displayVillage}`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: `No vehicle data available for users in ${displayVillage}.` },
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
          Error loading vehicle per household data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Final check for valid data to display
  const hasValidDataForDisplay = vehiclePerHouseholdResponse?.data?.length > 0 &&
                                (villageName
                                  ? vehiclePerHouseholdResponse.data.some(v => v.villageName === villageName && v.users?.length > 0)
                                  : vehiclePerHouseholdResponse.data[0]?.users?.length > 0);

  if (!hasValidDataForDisplay) {
    const currentVillageDisplay = (villageName
      ? vehiclePerHouseholdResponse?.data.find(v => v.villageName === villageName)?.villageName
      : vehiclePerHouseholdResponse?.data[0]?.villageName) || villageName || "the selected region";
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No vehicle data available for users in {currentVillageDisplay}.
        </div>
      </StyledCard>
    );
  }

  const currentVillageForFooter = (villageName
    ? vehiclePerHouseholdResponse.data.find(item => item.villageName === villageName)
    : vehiclePerHouseholdResponse.data[0])?.villageName || villageName;

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
          Number of vehicles owned per user in{" "}
          <strong>{currentVillageForFooter}</strong>, compared to the village average.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default VehiclesPerUserChart;