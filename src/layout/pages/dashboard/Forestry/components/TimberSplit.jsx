import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Required for stacking to work correctly (often included in a main Highcharts bundle,
// but good to explicitly list if you're modularly importing)
// import HighchartsMore from 'highcharts/highcharts-more';
// HighchartsMore(Highcharts); // Initialize HighchartsMore if not already done

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getTimberSplit } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const TimberSplitStackedChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village"); // Can be null if fetching for all villages
  const countryName = searchParams.get("country");

  const {
    data: timberSplitResponse, // Renamed to avoid confusion with the 'data' property inside
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["timber-split-data", countryName, villageName],
    queryFn: () => getTimberSplit(countryName, villageName), // Assuming API handles null villageName for all data
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    // Check if the response data array exists and has elements
    if (
      timberSplitResponse?.data &&
      Array.isArray(timberSplitResponse.data) &&
      timberSplitResponse.data.length > 0
    ) {
      const categories = timberSplitResponse.data.map(item => item.villageName || "Unknown Village");
      const ownForestTimberValues = timberSplitResponse.data.map(item => typeof item.ownForestTimber === 'number' ? item.ownForestTimber : 0);
      const communityForestTimberValues = timberSplitResponse.data.map(item => typeof item.communityForestTimber === 'number' ? item.communityForestTimber : 0);

      const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Villages";

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
          height: 400, // Adjust height as needed
        },
        title: {
          text: `Timber Harvest Split (Own vs Community) ${chartTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Village names on the X-axis
          title: {
            text: "Village",
          },
          labels: {
            rotation: -45, // Rotate labels if many villages
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Timber Logs Harvested",
          },
          labels: {
            formatter: function () {
              return `${this.value} Logs`; // Add unit to Y-axis labels
            },
            style: {
              color: "#666",
            },
          },
          stackLabels: { // Labels on top of each stack
            enabled: true,
            formatter: function () {
              return `${this.total} Logs`; // Show total for the stack
            },
            style: {
              fontWeight: 'bold',
              color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
          }
        },
        tooltip: {
          shared: true, // Show all series data for the hovered stack
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} Logs</b><br/>' +
                       'Total: <b>{point.stackTotal} Logs</b>', // Show individual and stack total
        },
        plotOptions: {
          column: {
            stacking: "normal", // This makes it a stacked column chart
            dataLabels: {
              enabled: true,
              format: '{point.y}', // Show individual segment value
              color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
              style: {
                textOutline: '1px black' // Add outline for better contrast
              },
              filter: { // Only show data labels if the segment value is significant
                  property: 'y',
                  operator: '>',
                  value: 0
              }
            },
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Community Forest Timber",
            data: communityForestTimberValues,
            color: "#4CAF50", // Green for community forest
          },
          {
            name: "Own Forest Timber",
            data: ownForestTimberValues,
            color: "#8D6E63", // Brown for own forest
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
          text: `Timber Harvest Split (Own vs Community) ${noDataTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "#333",
          },
        },
        xAxis: { categories: [] },
        yAxis: {},
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No timber split data available.",
        },
      });
    }
  }, [timberSplitResponse, villageName, countryName]); // Depend on the response and search params

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
          Error loading timber split data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid and has expected properties in at least one element
  const hasValidData = timberSplitResponse?.data?.length > 0 &&
                       timberSplitResponse.data.some(item =>
                         typeof item.ownForestTimber === 'number' ||
                         typeof item.communityForestTimber === 'number'
                       );

  if (!hasValidData) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No timber split data available for {villageName || 'the selected region'}.
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
    footerTextVillagePart = `across ${timberSplitResponse.data.length} villages`;
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
          Breakdown of timber harvested from own vs. community forests{" "}
          {footerTextVillagePart}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default TimberSplitStackedChart;