import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles"; // Fixed: Ensure 'theme' is correctly used in the styled import

// Adjust path as needed for your API function
import { getLocalMarket } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility";
import { useSearchParams } from "react-router-dom";

// Styled card
const StyledCard = styled(Card)(({ theme }) => ({ // Fixed: Added `({ theme })` here
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

const LocalMarketComparisonChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  // Assuming API call needs village/country context, even if response is flat
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: localMarketResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["local-market-data", villageName, countryName],
    queryFn: () => getLocalMarket(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      localMarketResponse?.usedItemsResult &&
      (localMarketResponse.usedItemsResult.usedItems || localMarketResponse.usedItemsResult.producedItems)
    ) {
      const usedItemsMap = new Map(
        (localMarketResponse.usedItemsResult.usedItems || []).map(item => [item.itemName?.trim(), item.totalUsedCount || 0])
      );
      const producedItemsMap = new Map(
        (localMarketResponse.usedItemsResult.producedItems || []).map(item => [item.itemName?.trim(), item.totalProducedCount || 0])
      );

      // Get all unique item names
      const allItemNames = new Set([
        ...Array.from(usedItemsMap.keys()),
        ...Array.from(producedItemsMap.keys()),
      ]);

      // Create a unified list of items with their used and produced counts
      let combinedItems = Array.from(allItemNames).map(itemName => ({
        itemName: itemName,
        totalUsedCount: usedItemsMap.get(itemName) || 0,
        totalProducedCount: producedItemsMap.get(itemName) || 0,
      }));

      // Filter out items where both counts are zero
      combinedItems = combinedItems.filter(item => item.totalUsedCount > 0 || item.totalProducedCount > 0);

      // Sort by totalUsedCount descending, then by totalProducedCount descending
      combinedItems.sort((a, b) => {
        if (b.totalUsedCount !== a.totalUsedCount) {
          return b.totalUsedCount - a.totalUsedCount;
        }
        return b.totalProducedCount - a.totalProducedCount;
      });

      const categories = combinedItems.map(item =>
        item.itemName?.replace(/\b\w/g, char => char.toUpperCase()) || "Unknown Item" // Capitalize words
      );
      const usedData = combinedItems.map(item => item.totalUsedCount);
      const producedData = combinedItems.map(item => item.totalProducedCount);

      const hasData = combinedItems.length > 0;

      setChartOptions({
        chart: {
          type: "bar", // Horizontal bar chart
          backgroundColor: "transparent",
          height: hasData ? Math.max(400, combinedItems.length * 40) : 400, // Dynamic height based on number of items
        },
        title: {
          text: `Used vs. Produced Items`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Item names on Y-axis (for horizontal bar chart)
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
            text: "Quantity", // Title for numerical axis
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
          gridLineWidth: 0, // Hide horizontal grid lines
        },
        tooltip: {
          shared: true, // Show tooltip for both bars when hovering over a category
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              format: '{point.y}', // Show quantity on each bar
              style: {
                fontWeight: 'bold',
                color: 'black',
                textOutline: '1px white'
              },
            },
            pointPadding: 0.1, // Spacing between bars in a group
            groupPadding: 0.1, // Spacing between groups
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Total Used Count",
            data: usedData,
            color: '#4CAF50', // Green for used items (demand)
          },
          {
            name: "Total Produced Count",
            data: producedData,
            color: '#2196F3', // Blue for produced items (supply)
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No local market data available for comparison."
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
  }, [localMarketResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "bar", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Local Market: Used vs. Produced Items`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: "No local market data available for comparison." },
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
          Error loading local market data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = localMarketResponse?.usedItemsResult &&
                                (localMarketResponse.usedItemsResult.usedItems?.length > 0 ||
                                 localMarketResponse.usedItemsResult.producedItems?.length > 0);

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No local market data available for comparison.
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
          Comparison of items consumed vs. items produced in the local market.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default LocalMarketComparisonChart;