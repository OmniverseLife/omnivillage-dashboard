import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Import Highcharts modules if needed, e.g., for data-labels, accessibility etc.
// import HighchartsMore from "highcharts/highcharts-more";
// import HighchartsAccessibility from "highcharts/modules/accessibility";
// HighchartsMore(Highcharts);
// HighchartsAccessibility(Highcharts);


import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getSupportNeed } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const SupportNeedChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: supportNeedResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["support-need-data", villageName, countryName],
    queryFn: () => getSupportNeed(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      supportNeedResponse?.data &&
      Array.isArray(supportNeedResponse.data) &&
      supportNeedResponse.data.length > 0
    ) {
      // Calculate total needs for sorting
      const sortedData = [...supportNeedResponse.data].sort(
        (a, b) => {
          const totalA = (a.skillRequirement || 0) + (a.manpowerRequirement || 0) + (a.equipmentRequirement || 0) + (a.otherRequirement || 0);
          const totalB = (b.skillRequirement || 0) + (b.manpowerRequirement || 0) + (b.equipmentRequirement || 0) + (b.otherRequirement || 0);
          return totalB - totalA; // Sort by total needs descending
        }
      );

      const categories = sortedData.map(item => item.businessName?.trim() || "Unknown Business");
      const skillRequirementData = sortedData.map(item => typeof item.skillRequirement === 'number' ? item.skillRequirement : 0);
      const manpowerRequirementData = sortedData.map(item => typeof item.manpowerRequirement === 'number' ? item.manpowerRequirement : 0);
      const equipmentRequirementData = sortedData.map(item => typeof item.equipmentRequirement === 'number' ? item.equipmentRequirement : 0);
      const otherRequirementData = sortedData.map(item => typeof item.otherRequirement === 'number' ? item.otherRequirement : 0);

      const hasData = categories.length > 0 &&
                      (skillRequirementData.some(val => val > 0) ||
                       manpowerRequirementData.some(val => val > 0) ||
                       equipmentRequirementData.some(val => val > 0) ||
                       otherRequirementData.some(val => val > 0));

      setChartOptions({
        chart: {
          type: "bar", // Horizontal stacked bar chart
          backgroundColor: "transparent",
          height: hasData ? Math.max(400, categories.length * 50) : 400, // Dynamic height
        },
        title: {
          text: `Support Needs by Business`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Business names on Y-axis for horizontal bars
          title: {
            text: null, // No title for category axis
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          min: 0,
          max: 4, // Maximum possible needs (1 for each of 4 types)
          title: {
            text: "Number of Support Needs",
          },
          labels: {
            formatter: function () {
              return `${this.value}`;
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false, // Needs are whole numbers (0 or 1)
          stackLabels: { // Labels for the total of each stack
              enabled: true,
              formatter: function() {
                  return 'Total: ' + this.total;
              },
              style: {
                  fontWeight: 'bold',
                  color: 'black',
                  textOutline: '1px white'
              }
          }
        },
        tooltip: {
          shared: true, // Show all series for the hovered business
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
        },
        plotOptions: {
          bar: {
            stacking: 'normal', // This makes it a stacked bar chart
            dataLabels: {
              enabled: true,
              format: '{point.y}', // Show individual segment value (0 or 1)
              color: 'black', // Ensure visibility on segments
              style: {
                fontWeight: 'bold',
                textOutline: '1px white' // Outline for better contrast
              },
              // Only show data label if value is 1
              formatter: function() {
                  return this.y === 1 ? '1' : '';
              }
            },
            pointPadding: 0.1,
            groupPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Skill Requirement",
            data: skillRequirementData,
            color: '#4CAF50', // Green
          },
          {
            name: "Manpower Requirement",
            data: manpowerRequirementData,
            color: '#2196F3', // Blue
          },
          {
            name: "Equipment Requirement",
            data: equipmentRequirementData,
            color: '#FFC107', // Amber
          },
          {
            name: "Other Requirement",
            data: otherRequirementData,
            color: '#9C27B0', // Purple
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No support need data available."
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
  }, [supportNeedResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "bar", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Support Needs by Business`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: "No support need data available." },
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
          Error loading support need data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = supportNeedResponse?.data &&
                                supportNeedResponse.data.some(item =>
                                  (typeof item.skillRequirement === 'number' && item.skillRequirement > 0) ||
                                  (typeof item.manpowerRequirement === 'number' && item.manpowerRequirement > 0) ||
                                  (typeof item.equipmentRequirement === 'number' && item.equipmentRequirement > 0) ||
                                  (typeof item.otherRequirement === 'number' && item.otherRequirement > 0)
                                );

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No support need data available.
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
          Breakdown of different support needs (skill, manpower, equipment, other) for each business.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default SupportNeedChart;