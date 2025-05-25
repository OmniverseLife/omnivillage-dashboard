import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Import Highcharts modules if necessary (e.g., for more advanced features)
// import HighchartsNoData from 'highcharts/modules/no-data-to-display';
// HighchartsNoData(Highcharts);

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getTimberRequirement } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const TimberRequirementLineChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: timberRequirementResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["timber-requirement-data", villageName, countryName],
    queryFn: () => getTimberRequirement(countryName, villageName), // Adjust API call args if needed
    enabled: !!villageName && !!countryName, // Ensure both are available
  });

  useEffect(() => {
    if (
      timberRequirementResponse?.data &&
      Array.isArray(timberRequirementResponse.data) &&
      timberRequirementResponse.data.length > 0
    ) {
      // Group data by purpose
      const groupedData = timberRequirementResponse.data.reduce((acc, item) => {
        const purposeName = item.purpose?.en || "Unknown Purpose";
        if (!acc[purposeName]) {
          acc[purposeName] = [];
        }
        // Highcharts for line charts expects [x-value, y-value].
        // For years, we can use the year directly or a timestamp (e.g., Jan 1st of that year).
        // Using year directly as number allows Highcharts to treat it as a linear axis.
        acc[purposeName].push([
          item.year,
          typeof item.quantity === "number" ? item.quantity : 0,
        ]);
        return acc;
      }, {});

      // Create series for Highcharts
      const series = Object.keys(groupedData).map((purpose) => ({
        name: purpose,
        data: groupedData[purpose].sort((a, b) => a[0] - b[0]), // Sort data points by year
        tooltip: {
          valueSuffix: " Units", // Assuming 'Units' as a generic unit for quantity
        },
      }));

      const chartTitleVillagePart = villageName
        ? `in ${villageName}`
        : "Across Regions";

      setChartOptions({
        chart: {
          type: "line",
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `Timber Requirement by Purpose ${chartTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          type: "linear", // Use linear for continuous years
          title: {
            text: "Year",
          },
          tickInterval: 1, // Show every year
          labels: {
            formatter: function () {
              return String(this.value); // Ensure years are displayed as numbers
            },
            style: {
              color: "#666",
            },
          },
          min: Math.min(
            ...timberRequirementResponse.data.map((item) => item.year)
          ),
          max: Math.max(
            ...timberRequirementResponse.data.map((item) => item.year)
          ),
          allowDecimals: false,
        },
        yAxis: {
          title: {
            text: "Timber Quantity (Units)", // Using generic 'Units'
          },
          labels: {
            formatter: function () {
              return `${this.value}`; // Highcharts will auto-format numbers
            },
            style: {
              color: "#666",
            },
          },
          min: 0,
        },
        tooltip: {
          shared: true, // Show all series data for the hovered year
          headerFormat: "<b>Year: {point.x}</b><br/>",
          pointFormat:
            '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} Units</b><br/>',
        },
        plotOptions: {
          series: {
            marker: {
              enabled: true, // Show individual data points
              radius: 4,
            },
            lineWidth: 2,
            animation: {
              duration: 1000, // Smooth animation for lines
            },
          },
        },
        series: series, // Dynamically generated series
        credits: {
          enabled: false,
        },
        lang: {
          noData: "No timber requirement data available.",
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
      const noDataTitleVillagePart = villageName
        ? `in ${villageName}`
        : "Across Regions";
      setChartOptions({
        chart: {
          type: "line",
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `Timber Requirement by Purpose ${noDataTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: { categories: [] },
        yAxis: {},
        series: [],
        credits: {
          enabled: false,
        },
        lang: {
          noData: "No timber requirement data available.",
        },
        noData: {
          style: {
            fontWeight: "bold",
            fontSize: "15px",
            color: "#303030",
          },
        },
      });
    }
  }, [timberRequirementResponse, villageName, countryName]); // Depend on the response and search params

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
          Error loading timber requirement data:{" "}
          {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid and has expected properties
  const hasValidData =
    timberRequirementResponse?.data?.length > 0 &&
    timberRequirementResponse.data.some(
      (item) =>
        typeof item.year === "number" &&
        typeof item.quantity === "number" &&
        item.purpose?.en
    );

  if (!hasValidData) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No timber requirement data available for{" "}
          {villageName || "the selected region"}.
        </div>
      </StyledCard>
    );
  }

  // Determine the display text for the footer
  const footerTextVillagePart = villageName
    ? `in ${villageName}`
    : "across regions";

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
          Projected timber requirements by purpose {footerTextVillagePart}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default TimberRequirementLineChart;
