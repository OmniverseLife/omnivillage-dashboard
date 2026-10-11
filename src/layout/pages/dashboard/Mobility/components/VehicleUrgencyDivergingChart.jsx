import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getVehicleUrgency } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const VehicleUrgencyDivergingChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: vehicleUrgencyResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vehicle-urgency-data", villageName, countryName],
    queryFn: () => getVehicleUrgency(countryName, villageName),
    enabled: !!villageName && !!countryName,
  });

  useEffect(() => {
    if (
      vehicleUrgencyResponse?.data &&
      Array.isArray(vehicleUrgencyResponse.data) &&
      vehicleUrgencyResponse.data.length > 0
    ) {
      // Find the specific village data, or use the first one if no villageName is specified
      const villageData = villageName
        ? vehicleUrgencyResponse.data.find(item => item.village === villageName)
        : vehicleUrgencyResponse.data[0];

      if (villageData && villageData.urgencyData && Array.isArray(villageData.urgencyData) && villageData.urgencyData.length > 0) {
        // Filter out any entries without 'urgency' (like the total count)
        const filteredUrgencyData = villageData.urgencyData.filter(item => item.urgency && item.vehicleType?.en);

        // Group data by vehicle type
        const groupedByVehicleType = filteredUrgencyData.reduce((acc, item) => {
          const type = item.vehicleType.en.trim();
          if (!acc[type]) {
            acc[type] = { "within 1 year": 0, "within 2-5 years": 0 };
          }
          if (item.urgency === "within 1 year") {
            acc[type]["within 1 year"] = (typeof item.count === 'number' ? item.count : 0);
          } else if (item.urgency === "within 2-5 years") {
            acc[type]["within 2-5 years"] = (typeof item.count === 'number' ? item.count : 0);
          }
          return acc;
        }, {});

        const categories = Object.keys(groupedByVehicleType);
        const within1YearData = categories.map(type => groupedByVehicleType[type]["within 1 year"]);
        // For diverging chart, make one series negative to extend to the left
        const within2to5YearsData = categories.map(type => -(groupedByVehicleType[type]["within 2-5 years"]));

        const currentVillageDisplay = villageData.village || villageName || "Selected Village";
        const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Regions";

        setChartOptions({
          chart: {
            type: "bar", // Horizontal bars
            backgroundColor: "transparent",
            height: 400,
          },
          title: {
            text: `Vehicle Urgency by Type ${chartTitleVillagePart}`,
            align: "left",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            },
          },
          xAxis: [{ // Left X-axis for negative values
            categories: categories,
            reversed: false,
            labels: {
              step: 1,
              style: {
                color: "#666",
              },
            },
            lineWidth: 0, // Hide axis line
            tickWidth: 0, // Hide ticks
          }, { // Right X-axis for positive values (hidden, but needed for categories)
            categories: categories,
            reversed: false,
            labels: {
              enabled: false
            },
            opposite: true,
            linkedTo: 0, // Link to the first X-axis
            lineWidth: 0,
            tickWidth: 0,
          }],
          yAxis: {
            title: {
              text: "Number of Vehicles",
            },
            labels: {
              formatter: function () {
                return Math.abs(this.value); // Display absolute values on Y-axis
              },
              style: {
                color: "#666",
              },
            },
          },
          tooltip: {
            formatter: function () {
              // Show absolute value in tooltip
              const value = Math.abs(this.y);
              return `<b>${this.point.category}</b><br/>${this.series.name}: <b>${value} Vehicles</b>`;
            }
          },
          plotOptions: {
            series: {
              stacking: "normal", // Stacking might not be strictly needed for diverging but good to have
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return Math.abs(this.y); // Show absolute value on the bar
                },
                color: 'black',
                style: {
                  fontWeight: 'bold',
                  textOutline: '1px white'
                }
              }
            },
            bar: {
                grouping: false, // Ensure bars are not grouped if only one series per side
                pointPadding: 0.2,
                groupPadding: 0.2
            }
          },
          series: [
            {
              name: "Within 1 Year",
              data: within1YearData,
              color: '#4CAF50', // Green for more urgent
              xAxis: 0 // Use the first X-axis
            },
            {
              name: "Within 2-5 Years",
              data: within2to5YearsData,
              color: '#FF9800', // Orange for less urgent
              xAxis: 0 // Use the first X-axis (this will make it diverge by being negative)
            },
          ],
          credits: {
            enabled: false,
          },
          lang: {
              noData: `No vehicle urgency data available for ${currentVillageDisplay}.`
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
        const currentVillageDisplay = villageData?.village || villageName || "Selected Village";
        setChartOptions(getNoDataOptions(currentVillageDisplay));
      }
    } else {
      setChartOptions(getNoDataOptions(villageName || "the selected region"));
    }
  }, [vehicleUrgencyResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = (displayVillage) => ({
    chart: { type: "bar", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Vehicle Urgency by Type ${displayVillage}`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: `No vehicle urgency data available for ${displayVillage}.` },
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
          Error loading vehicle urgency data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = vehicleUrgencyResponse?.data?.length > 0 &&
                                (villageName
                                  ? vehicleUrgencyResponse.data.some(v => v.village === villageName && v.urgencyData?.filter(d => d.urgency).length > 0)
                                  : vehicleUrgencyResponse.data[0]?.urgencyData?.filter(d => d.urgency).length > 0);

  if (!hasValidDataForDisplay) {
    const currentVillageDisplay = (villageName
      ? vehicleUrgencyResponse?.data.find(v => v.village === villageName)?.village
      : vehicleUrgencyResponse?.data[0]?.village) || villageName || "the selected region";
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No vehicle urgency data available for {currentVillageDisplay}.
        </div>
      </StyledCard>
    );
  }

  const currentVillageForFooter = (villageName
    ? vehicleUrgencyResponse?.data?.find(item => item.village === villageName)
    : vehicleUrgencyResponse?.data[0])?.village || villageName;

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
          Urgency of vehicle requirements (within 1 year vs. 2-5 years) in{" "}
          <strong>{currentVillageForFooter}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default VehicleUrgencyDivergingChart;