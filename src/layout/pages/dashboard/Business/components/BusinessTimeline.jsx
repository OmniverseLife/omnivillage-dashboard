import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getBusinessStarted } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const BusinessStartedChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  // Assuming API call needs village/country context, even if response is flat
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: businessStartedResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["business-started-data", villageName, countryName],
    queryFn: () => getBusinessStarted(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      businessStartedResponse?.data &&
      Array.isArray(businessStartedResponse.data) &&
      businessStartedResponse.data.length > 0
    ) {
      // Sort data by year in ascending order
      const sortedData = [...businessStartedResponse.data].sort(
        (a, b) => (a.year || 0) - (b.year || 0)
      );

      const categories = sortedData.map(item => item.year?.toString() || "Unknown Year");
      const seriesData = sortedData.map(item => typeof item.count === 'number' ? item.count : 0);

      const hasData = seriesData.some(count => count > 0);

      setChartOptions({
        chart: {
          type: "column", // Column chart
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `New Businesses Started by Year`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Years on X-axis
          title: {
            text: "Year",
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
            text: "Number of Businesses Started",
          },
          labels: {
            formatter: function () {
              return `${this.value}`;
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false, // Counts are whole numbers
        },
        tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: 'Number of Businesses: <b>{point.y}</b>',
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              format: '{point.y}', // Show count on each column
              style: {
                fontWeight: 'bold',
                color: 'black',
                textOutline: '1px white'
              },
            },
            pointPadding: 0.1, // Spacing between columns
            groupPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Businesses Started",
            data: seriesData,
            color: '#007bff', // A distinct color for the columns
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No new business data available by year."
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
  }, [businessStartedResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "column", backgroundColor: "transparent", height: 400 },
    title: {
      text: `New Businesses Started by Year`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: "No new business data available by year." },
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
          Error loading business started data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = businessStartedResponse?.data &&
                                businessStartedResponse.data.some(item => typeof item.count === 'number' && item.count > 0);

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No new business data available by year.
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
          Visualizing the number of businesses established each year.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default BusinessStartedChart;