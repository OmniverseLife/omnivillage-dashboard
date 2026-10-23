import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getInvestmentIncome } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const InvestmentIncomeChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  // Assuming API call needs village/country context, even if response is flat
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: investmentIncomeResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["investment-income-data", villageName, countryName],
    queryFn: () => getInvestmentIncome(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      investmentIncomeResponse?.data &&
      Array.isArray(investmentIncomeResponse.data) &&
      investmentIncomeResponse.data.length > 0
    ) {
      // Sort data by totalIncome descending to show highest income businesses first
      const sortedData = [...investmentIncomeResponse.data].sort(
        (a, b) => (b.totalIncome || 0) - (a.totalIncome || 0)
      );

      const categories = sortedData.map(item => item.businessName?.trim() || "Unknown Business");
      const investmentData = sortedData.map(item => typeof item.totalInvestmentNeed === 'number' ? item.totalInvestmentNeed : 0);
      const incomeData = sortedData.map(item => typeof item.totalIncome === 'number' ? item.totalIncome : 0);
      const lossData = sortedData.map(item => typeof item.totalLoss === 'number' ? item.totalLoss : 0);

      const hasData = categories.length > 0 &&
                      (investmentData.some(val => val > 0) ||
                       incomeData.some(val => val > 0) ||
                       lossData.some(val => val > 0));

      setChartOptions({
        chart: {
          type: "bar", // Grouped bar chart (horizontal columns)
          backgroundColor: "transparent",
          height: hasData ? Math.max(400, categories.length * 90) : 400, // Dynamic height
        },
        title: {
          text: `Business Investment, Income & Loss`,
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
            text: "Amount (₹)", // Title for monetary axis
          },
          labels: {
            formatter: function () {
              return `₹${this.value.toLocaleString('en-IN')}`; // Format with Rupee symbol and commas
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false, // Assuming whole rupee amounts or desire to round
          gridLineWidth: 0, // Hide horizontal grid lines
        },
        tooltip: {
          shared: true, // Show all series for the hovered business
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>₹{point.y:,.0f}</b><br/>',
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              format: '₹{point.y:,.0f}', // Show amount on each bar
              style: {
                fontWeight: 'bold',
                color: 'black',
                textOutline: '1px white'
              },
            },
            pointPadding: 0.1, // Spacing between bars within a group
            groupPadding: 0.2, // Spacing between groups
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Total Income",
            data: incomeData,
            color: '#4CAF50', // Green for income
          },
          {
            name: "Total Investment Need",
            data: investmentData,
            color: '#2196F3', // Blue for investment
          },
          {
            name: "Total Loss",
            data: lossData,
            color: '#F44336', // Red for loss
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No investment and income data available."
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
  }, [investmentIncomeResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "bar", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Business Investment, Income & Loss`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: "No investment and income data available." },
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
          Error loading investment and income data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = investmentIncomeResponse?.data &&
                                investmentIncomeResponse.data.some(item =>
                                  typeof item.totalInvestmentNeed === 'number' ||
                                  typeof item.totalIncome === 'number' ||
                                  typeof item.totalLoss === 'number'
                                );

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No investment and income data available.
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
          Overview of investment needs, income, and losses for various businesses.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default InvestmentIncomeChart;