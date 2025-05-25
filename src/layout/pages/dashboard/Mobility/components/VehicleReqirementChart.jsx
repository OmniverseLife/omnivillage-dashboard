import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Import Highcharts modules if necessary
// import HighchartsNoData from 'highcharts/modules/no-data-to-display';
// HighchartsNoData(Highcharts);

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getVehicleRequirement } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const VehicleRequirementChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: vehicleRequirementResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vehicle-requirement-data", villageName, countryName],
    queryFn: () => getVehicleRequirement(countryName, villageName), // Adjust API call args if needed
    enabled: !!villageName && !!countryName, // Enable if both are available
  });

  useEffect(() => {
    // Check if the response data array exists and has elements
    if (
      vehicleRequirementResponse?.data &&
      Array.isArray(vehicleRequirementResponse.data) &&
      vehicleRequirementResponse.data.length > 0
    ) {
      // Find the specific village data, or use the first one if no villageName is specified
      const villageData = villageName
        ? vehicleRequirementResponse.data.find(item => item.village === villageName)
        : vehicleRequirementResponse.data[0];

      if (villageData && villageData.vehicleTypeData && Array.isArray(villageData.vehicleTypeData) && villageData.vehicleTypeData.length > 0) {
        // Sort data by count in descending order for better visualization
        const sortedData = [...villageData.vehicleTypeData].sort(
          (a, b) => (b.count || 0) - (a.count || 0)
        );

        const categories = sortedData.map(item => item.vehicleType?.en?.trim() || "Unknown Type");
        const seriesData = sortedData.map(item => ({
          y: typeof item.count === 'number' ? item.count : 0,
          name: item.vehicleType?.en?.trim() || "Unknown Type", // For tooltip
        }));

        const currentVillageDisplay = villageData.village || villageName || "Selected Village";
        const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Regions";

        setChartOptions({
          chart: {
            type: "column", // Vertical bar chart
            backgroundColor: "transparent",
            height: 400, // Adjust height as needed
          },
          title: {
            text: `Vehicle Requirement by Type ${chartTitleVillagePart}`,
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
              text: "Number of Vehicles Required",
            },
            labels: {
              formatter: function () {
                return `${this.value}`;
              },
              style: {
                color: "#666",
              },
            },
            allowDecimals: false, // Vehicle counts are typically whole numbers
          },
          tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '<span style="color:{point.color}">{series.name}</span>: <b>{point.y} Vehicles</b>',
            shared: false, // Each bar has its own tooltip
          },
          plotOptions: {
            column: {
              dataLabels: {
                enabled: true,
                format: "{point.y}", // Show the count on top of the bar
                style: {
                  fontWeight: "bold",
                  color: "black",
                  textOutline: '1px white' // Add outline for better visibility
                },
              },
              pointPadding: 0.1, // Spacing between bars
              groupPadding: 0.2,
              borderWidth: 0,
              colorByPoint: true, // Assign different colors to each bar
            },
          },
          series: [
            {
              name: "Count",
              data: seriesData,
            },
          ],
          credits: {
            enabled: false,
          },
          lang: {
              noData: `No vehicle requirement data available for ${currentVillageDisplay}.`
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
        // Handle case where villageData is found but has no vehicleTypeData or vehicleTypeData is empty
        const currentVillageDisplay = villageData?.village || villageName || "Selected Village";
        setChartOptions(getNoDataOptions(currentVillageDisplay));
      }
    } else {
      // Handle case where no data or empty data array
      setChartOptions(getNoDataOptions(villageName || "the selected region"));
    }
  }, [vehicleRequirementResponse, villageName, countryName]); // Depend on the response and search params

  // Helper function for no data options
  const getNoDataOptions = (displayVillage) => ({
    chart: { type: "column", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Vehicle Requirement by Type ${displayVillage}`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: `No vehicle requirement data available for ${displayVillage}.` },
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
          Error loading vehicle requirement data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Final check for valid data to display
  const hasValidDataForDisplay = vehicleRequirementResponse?.data?.length > 0 &&
                                (villageName
                                  ? vehicleRequirementResponse.data.some(v => v.village === villageName && v.vehicleTypeData?.length > 0)
                                  : vehicleRequirementResponse.data[0]?.vehicleTypeData?.length > 0);

  if (!hasValidDataForDisplay) {
    const currentVillageDisplay = (villageName
      ? vehicleRequirementResponse.data.find(v => v.village === villageName)?.village
      : vehicleRequirementResponse.data[0]?.village) || villageName || "the selected region";
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No vehicle requirement data available for {currentVillageDisplay}.
        </div>
      </StyledCard>
    );
  }

  const currentVillageForFooter = (villageName
    ? vehicleRequirementResponse.data.find(item => item.village === villageName)
    : vehicleRequirementResponse.data[0])?.village || villageName;

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
          Projected vehicle requirements by type in{" "}
          <strong>{currentVillageForFooter}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default VehicleRequirementChart;