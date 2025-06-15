import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMap from "highcharts/modules/map"; // Potentially useful for location data, though not directly used in *these* charts
import HighchartsData from "highcharts/modules/data"; // Useful for processing data
import HighchartsFunnel from "highcharts/modules/funnel"; // Not needed here but for reference
import HighchartsExporting from "highcharts/modules/exporting"; // For download options
import HighchartsAccessibility from "highcharts/modules/accessibility"; // For accessibility

// Initialize Highcharts modules
HighchartsMap(Highcharts); // If you plan to add map visualizations later
HighchartsData(Highcharts);
HighchartsExporting(Highcharts);
HighchartsAccessibility(Highcharts);

import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getBusinessDetails } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const BusinessDetailsCharts = () => {
  const [businessTypeOptions, setBusinessTypeOptions] = useState({});
  const [infrastructureOptions, setInfrastructureOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: businessDetailsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["business-details-data", villageName, countryName],
    queryFn: () => getBusinessDetails(countryName, villageName),
    enabled: !!countryName,
  });

  useEffect(() => {
    if (
      businessDetailsResponse?.data &&
      Array.isArray(businessDetailsResponse.data) &&
      businessDetailsResponse.data.length > 0
    ) {
      const data = businessDetailsResponse.data;

      // --- Process Business Type Data ---
      const businessTypeCounts = data.reduce((acc, item) => {
        const type = item.businessType?.trim() || "Unspecified";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const businessTypeSeries = Object.keys(businessTypeCounts).map(
        (type) => ({
          name: type,
          y: businessTypeCounts[type],
        })
      );

      setBusinessTypeOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          height: 350,
        },
        title: {
          text: `Distribution of Business Types`,
          align: "left",
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              connectorColor: "silver",
            },
            showInLegend: true,
          },
        },
        series: [
          {
            name: "Businesses",
            colorByPoint: true,
            data: businessTypeSeries,
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
          noData: "No business type data available.",
        },
        noData: {
          style: {
            fontWeight: "bold",
            fontSize: "15px",
            color: "#303030",
          },
        },
      });

      // --- Process Infrastructure Data ---
      const infrastructureCounts = data.reduce((acc, item) => {
        if (item.infrastructure && Array.isArray(item.infrastructure)) {
          item.infrastructure.forEach((infra) => {
            const infraName = infra?.trim() || "Unspecified Infrastructure";
            acc[infraName] = (acc[infraName] || 0) + 1;
          });
        }
        return acc;
      }, {});

      const infrastructureSeries = Object.keys(infrastructureCounts)
        .map((infra) => ({
          name: infra,
          y: infrastructureCounts[infra],
        }))
        .sort((a, b) => b.y - a.y); // Sort by count descending

      setInfrastructureOptions({
        chart: {
          type: "bar",
          backgroundColor: "transparent",
          height: Math.max(350, infrastructureSeries.length * 50), // Dynamic height
        },
        title: {
          text: `Infrastructure Availability Count`,
          align: "left",
          style: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: infrastructureSeries.map((item) => item.name),
          title: {
            text: null,
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
            text: "Number of Businesses",
          },
          labels: {
            formatter: function () {
              return `${this.value}`;
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false,
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.y}</b> businesses<br/>",
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              format: "{point.y}",
              style: {
                fontWeight: "bold",
                color: "black",
                textOutline: "1px white",
              },
            },
          },
        },
        series: [
          {
            name: "Businesses with",
            data: infrastructureSeries.map((item) => item.y),
            color: "#673AB7", // Deep Purple
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
          noData: "No infrastructure data available.",
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
      setBusinessTypeOptions(
        getNoDataOptions("Distribution of Business Types")
      );
      setInfrastructureOptions(
        getNoDataOptions("Infrastructure Availability Count")
      );
    }
  }, [businessDetailsResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = (title) => ({
    chart: { type: "pie", backgroundColor: "transparent", height: 350 }, // Default to pie chart type for no data
    title: {
      text: title,
      align: "left",
      style: { fontSize: "16px", fontWeight: "bold", color: "#333" },
    },
    xAxis: { categories: [] },
    yAxis: {},
    series: [],
    credits: { enabled: false },
    lang: { noData: `No data available for ${title.toLowerCase()}.` },
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
          Error loading business details data:{" "}
          {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasAnyDataForDisplay =
    businessDetailsResponse?.data && businessDetailsResponse.data.length > 0;

  if (!hasAnyDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No business details data available.
        </div>
      </StyledCard>
    );
  }

  return (
    <StyledCard sx={{ marginTop: 4, paddingTop: "72px" }}>
      <CardContent>
        <HighchartsReact
          highcharts={Highcharts}
          options={businessTypeOptions}
        />

        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ marginTop: 4, mb: 2 }}
        >
          Overview of business types and infrastructure availability.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default BusinessDetailsCharts;
