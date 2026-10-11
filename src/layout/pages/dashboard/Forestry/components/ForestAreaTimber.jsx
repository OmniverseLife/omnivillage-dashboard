import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getForestAreaByVillage } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const ForestAreaAndTimberChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village"); // This might be null if fetching for all villages
  const countryName = searchParams.get("country");

  // If getForestAreaByVillage can fetch for ALL villages if villageName is not provided,
  // ensure the queryFn handles that or adjust 'enabled' accordingly.
  // For now, we'll assume it returns an array of all villages if `villageName` is omitted
  // in the API call. If your API requires `villageName` even for a single-village result,
  // then the previous logic for a single result was appropriate.
  // Assuming `getForestAreaByVillage(countryName, villageName)` returns data for *all* villages if villageName is null/undefined.
  const {
    data: forestDataResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["forest-area-data", countryName, villageName], // Key changes based on params
    queryFn: () => getForestAreaByVillage(countryName, villageName), // Pass villageName to API. If it's empty, API should return all.
    enabled: !!countryName, // Enable if countryName is present
  });

  useEffect(() => {
    // Check if the overall response and its 'data' array exist and have at least one element
    if (
      forestDataResponse?.data &&
      Array.isArray(forestDataResponse.data) &&
      forestDataResponse.data.length > 0
    ) {
      const categories = forestDataResponse.data.map(item => item.villageName || "Unknown Village");
      const totalForestAreaValues = forestDataResponse.data.map(item => typeof item.totalForestArea === 'number' ? item.totalForestArea : 0);
      const totalTimberLogsHarvestedValues = forestDataResponse.data.map(item => typeof item.totalTimberLogsHarvested === 'number' ? item.totalTimberLogsHarvested : 0);

      const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Villages";

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
          height: 400, // Increased height for multiple villages
        },
        title: {
          text: `Forest Area and Timber Harvest ${chartTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Each village is a category
          title: {
            text: "Village",
          },
          labels: {
            rotation: -45, // Rotate labels if many villages to prevent overlap
            style: {
              color: "#666",
            },
          },
        },
        yAxis: [
          {
            // Primary Y-axis for Forest Area
            title: {
              text: "Forest Area (Hectares)",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            labels: {
              formatter: function () {
                return `${this.value} Ha`;
              },
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            min: 0,
          },
          {
            // Secondary Y-axis for Timber Logs
            title: {
              text: "Timber Logs Harvested",
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            labels: {
              formatter: function () {
                return `${this.value} Logs`;
              },
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            opposite: true, // Place on the right side
            min: 0,
          },
        ],
        tooltip: {
          shared: true, // Show all series data for the hovered village
          formatter: function () {
            let tooltipContent = `<b>${this.x}</b><br/>`; // this.x is the village name
            this.points.forEach((point) => {
              let value = point.y;
              let unit = '';
              if (point.series.name === 'Total Forest Area') {
                unit = ' Ha';
              } else if (point.series.name === 'Total Timber Logs Harvested') {
                unit = ' Logs';
              }
              tooltipContent += `<span style="color:${point.series.color}">${point.series.name}:</span> <b>${value}${unit}</b><br/>`;
            });
            return tooltipContent;
          },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              format: "{point.y}",
              style: {
                fontWeight: "bold",
                color: "black",
              },
              // Only show data labels if there are not too many bars to prevent clutter
              // Alternatively, set a threshold for `formatter` logic to only show for large values
              // filter: { property: 'y', operator: '>', value: 0 } // Example: only show for values > 0
            },
            grouping: true, // Group the bars for each village
            shadow: false,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Total Forest Area",
            data: totalForestAreaValues,
            yAxis: 0,
            color: "#4CAF50", // Green for forest area
          },
          {
            name: "Total Timber Logs Harvested",
            data: totalTimberLogsHarvestedValues,
            yAxis: 1,
            color: "#8D6E63", // Brown for timber
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      // Set default options or "no data" state
      const noDataTitleVillagePart = villageName ? `in ${villageName}` : "Across Villages";
      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `Forest Area and Timber Harvest ${noDataTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: { categories: [] },
        yAxis: [{}, {}],
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No forest area or timber harvest data available.",
        },
      });
    }
  }, [forestDataResponse, villageName, countryName]); // Depend on the response and search params

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
          Error loading forest data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid and has expected properties in at least one element
  const hasValidData = forestDataResponse?.data?.length > 0 &&
                       forestDataResponse.data.some(item =>
                         typeof item.totalForestArea === 'number' ||
                         typeof item.totalTimberLogsHarvested === 'number'
                       );

  if (!hasValidData) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No forest area or timber harvest data available for {villageName || 'the selected region'}.
        </div>
      </StyledCard>
    );
  }

  // Determine the display text for the footer
  let footerTextVillagePart;
  if (villageName) {
    footerTextVillagePart = `in ${villageName}`;
  } else {
    // If no specific village is selected, assume we're showing data across multiple villages
    footerTextVillagePart = `across ${forestDataResponse.data.length} villages`;
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
          Forest area and timber harvesting metrics {footerTextVillagePart}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default ForestAreaAndTimberChart;