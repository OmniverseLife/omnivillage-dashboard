import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getLocalStacked } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const LocalStackedProductionChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  // This API doesn't seem to be village-specific from the response, but use
  // search params if the actual API call is context-aware.
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: localStackedResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["local-stacked-data", villageName, countryName],
    queryFn: () => getLocalStacked(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      localStackedResponse?.data &&
      Array.isArray(localStackedResponse.data) &&
      localStackedResponse.data.length > 0
    ) {
      // Sort main categories by total quantity for better presentation
      const sortedCategories = [...localStackedResponse.data].sort(
        (a, b) =>
          (b.totalCategoryQuantity || 0) - (a.totalCategoryQuantity || 0)
      );

      // Get all unique main categories for X-axis
      const categories = sortedCategories.map(
        (item) =>
          item.mainCategory
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()) ||
          "Unknown Category"
      );

      // Collect all unique item names to create series
      const uniqueItems = new Set();
      sortedCategories.forEach((cat) => {
        cat.producedItems?.forEach((item) => {
          if (item.itemName) uniqueItems.add(item.itemName.trim());
        });
      });
      const itemNames = Array.from(uniqueItems).sort(); // Sort item names alphabetically for consistent series order

      // Prepare series data for Highcharts
      const series = itemNames.map((itemName) => {
        const data = categories.map((categoryName) => {
          const categoryData = sortedCategories.find(
            (c) =>
              c.mainCategory
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase()) === categoryName
          );
          const producedItem = categoryData?.producedItems?.find(
            (item) => item.itemName?.trim() === itemName
          );
          return typeof producedItem?.quantity === "number"
            ? producedItem.quantity
            : 0;
        });
        return {
          name: itemName,
          data: data,
        };
      });

      setChartOptions({
        chart: {
          type: "column", // Column chart
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `Local Production by Category and Item`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Main categories on X-axis
          title: {
            text: "Main Category",
          },
          labels: {
            rotation: -45, // Rotate labels if needed
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Quantity Produced",
          },
          labels: {
            formatter: function () {
              return `${this.value}`;
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false, // Quantities are typically whole numbers
        },
        tooltip: {
          useHTML: true,
          shared: true,
          headerFormat:
            '<span style="font-size: 14px;"><b>{point.key}</b></span><br/>',
          pointFormat: `
    <span style="color:{series.color}">\u25CF</span> 
    <span style="font-weight: bold;">{series.name}</span>: 
    <span style="font-weight: bold;">{point.y}</span><br/>
  `,
          footerFormat:
            '<span style="font-size: 12px;">Total: <b>{point.stackTotal}</b></span>',
          style: {
            fontSize: "13px",
            fontFamily: "Arial, sans-serif",
          },
          backgroundColor: "#ffffff",
          borderColor: "#ccc",
          borderRadius: 8,
          shadow: true,
        },

        plotOptions: {
          column: {
            stacking: "normal", // This creates the stacked effect
            dataLabels: {
              enabled: true,
              formatter: function () {
                // Show label only if quantity is positive
                return this.y > 0 ? this.y : null;
              },
              style: {
                fontWeight: "bold",
                color: "black",
                textOutline: "1px white",
              },
            },
          },
        },
        series: series, // The dynamically created series
        credits: {
          enabled: false,
        },
        lang: {
          noData: "No local production data available.",
        },
        noData: {
          style: {
            fontWeight: "bold",
            fontSize: "15px",
            color: "#303030",
          },
        },
      });
    } else {
      // Set default options or "no data" state
      setChartOptions(getNoDataOptions());
    }
  }, [localStackedResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "column", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Local Production by Category and Item`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: "No local production data available." },
    noData: {
      style: { fontWeight: "bold", fontSize: "15px", color: "#303030" },
    },
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
          Error loading local production data:{" "}
          {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid for display
  const hasValidDataForDisplay =
    localStackedResponse?.data?.length > 0 &&
    localStackedResponse.data.some((cat) =>
      cat.producedItems?.some(
        (item) => typeof item.quantity === "number" && item.quantity > 0
      )
    );

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No local production data available.
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
          Breakdown of locally produced items by category.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default LocalStackedProductionChart;
