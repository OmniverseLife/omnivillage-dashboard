import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom"; // Use if village/country context is needed
import { getPersonalExpense } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const PersonalExpenseBarChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village"); // Not directly used by this API, but kept for context
  const countryName = searchParams.get("country"); // Assuming API call needs country context

  const {
    data: personalExpenseResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["personal-expense-bar-data", villageName, countryName],
    queryFn: () => getPersonalExpense(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      personalExpenseResponse?.data &&
      Array.isArray(personalExpenseResponse.data) &&
      personalExpenseResponse.data.length > 0
    ) {
      // Sort data by totalExpense in ascending order for a horizontal bar chart
      // (smallest bar at the bottom, largest at the top)
      const sortedExpenses = [...personalExpenseResponse.data].sort(
        (a, b) => (a.totalExpense || 0) - (b.totalExpense || 0)
      );

      const categories = sortedExpenses.map(item => item.category?.replace(/_/g, ' ')
                                                      .replace(/\b\w/g, char => char.toUpperCase()) || "Unknown Category");
      const seriesData = sortedExpenses.map(item => typeof item.totalExpense === 'number' ? item.totalExpense : 0);

      // Calculate total for footer display
      const totalExpense = seriesData.reduce((sum, val) => sum + val, 0);

      setChartOptions({
        chart: {
          type: "bar", // Horizontal bar chart
          backgroundColor: "transparent",
          height: 400, // Adjust height based on number of categories
        },
        title: {
          text: `Personal Expenses by Category`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Categories (expense types) on Y-axis for horizontal chart
          title: {
            text: null, // No title for categories axis
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
            text: "Total Expense (₹)", // Title for expense axis
          },
          labels: {
            formatter: function () {
              return `₹${this.value.toLocaleString('en-IN')}`; // Format with Rupee symbol and commas
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false, // Assuming expenses are whole numbers or want to round
        },
        tooltip: {
          pointFormat: '<b>{point.name}</b>: ₹{point.y:,.0f}', // Category name and formatted expense
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              format: '₹{point.y:,.0f}', // Show expense amount on the bar
              style: {
                fontWeight: 'bold',
                color: 'black',
                textOutline: '1px white'
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
            name: "Total Expense",
            data: seriesData,
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No personal expense data available."
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
      // Set default options or "no data" state
      setChartOptions(getNoDataOptions());
    }
  }, [personalExpenseResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "bar", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Personal Expenses by Category`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: "No personal expense data available." },
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
          Error loading personal expense data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid for display
  const hasValidDataForDisplay = personalExpenseResponse?.data?.length > 0 &&
                                personalExpenseResponse.data.some(item => typeof item.totalExpense === 'number' && item.totalExpense > 0);

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No personal expense data available.
        </div>
      </StyledCard>
    );
  }

  // Calculate total expense for footer
  const totalExpenseSum = personalExpenseResponse.data.reduce((sum, item) => sum + (item.totalExpense || 0), 0);

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
          Total personal expenses distributed across categories:{" "}
          <strong>₹{totalExpenseSum.toLocaleString('en-IN')}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default PersonalExpenseBarChart;