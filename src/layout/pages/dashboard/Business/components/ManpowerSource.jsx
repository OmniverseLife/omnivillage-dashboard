import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles"; // Corrected: This import is correct

import { useSearchParams } from "react-router-dom";
import { getManpowerSource } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

// Styled card
const StyledCard = styled(Card)(({ theme }) => ({ // Fixed: Added closing parenthesis and curly brace for the styled component definition
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

const ManpowerSourceChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  // Assuming API call needs village/country context, even if response is flat
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: manpowerSourceResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["manpower-source-data", villageName, countryName],
    queryFn: () => getManpowerSource(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      manpowerSourceResponse?.data &&
      Array.isArray(manpowerSourceResponse.data) &&
      manpowerSourceResponse.data.length > 0
    ) {
      // Calculate total manpower for sorting
      const sortedData = [...manpowerSourceResponse.data].sort(
        (a, b) => {
          const totalA = (a.insideVillage || 0) + (a.outsideVillage || 0);
          const totalB = (b.insideVillage || 0) + (b.outsideVillage || 0);
          return totalB - totalA; // Sort by total manpower descending
        }
      );

      const categories = sortedData.map(item => item.businessName?.trim() || "Unknown Business");
      const insideVillageData = sortedData.map(item => typeof item.insideVillage === 'number' ? item.insideVillage : 0);
      const outsideVillageData = sortedData.map(item => typeof item.outsideVillage === 'number' ? item.outsideVillage : 0);

      const hasData = categories.length > 0 &&
                      (insideVillageData.some(val => val > 0) ||
                       outsideVillageData.some(val => val > 0));

      setChartOptions({
        chart: {
          type: "bar", // Stacked bar chart (horizontal columns)
          backgroundColor: "transparent",
          height: hasData ? Math.max(400, categories.length * 60) : 400, // Dynamic height
        },
        title: {
          text: `Manpower Source Distribution by Business`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Business names on Y-axis (for horizontal chart)
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
          title: {
            text: "Number of People",
          },
          labels: {
            formatter: function () {
              return `${this.value}`;
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false, // Manpower counts are whole numbers
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
              format: '{point.y}', // Show individual segment value
              style: {
                fontWeight: 'bold',
                color: 'black',
                textOutline: '1px white'
              },
            },
            pointPadding: 0.1, // Spacing between bar groups (though no groups if only one stack)
            groupPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Inside Village",
            data: insideVillageData,
            color: '#4CAF50', // Green for inside village manpower
          },
          {
            name: "Outside Village",
            data: outsideVillageData,
            color: '#FFC107', // Amber for outside village manpower
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No manpower source data available."
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
  }, [manpowerSourceResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "bar", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Manpower Source Distribution by Business`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: "No manpower source data available." },
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
          Error loading manpower source data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = manpowerSourceResponse?.data &&
                                manpowerSourceResponse.data.some(item =>
                                  (typeof item.insideVillage === 'number' && item.insideVillage > 0) ||
                                  (typeof item.outsideVillage === 'number' && item.outsideVillage > 0)
                                );

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No manpower source data available.
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
          Breakdown of manpower employed by businesses from within and outside the village.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default ManpowerSourceChart;