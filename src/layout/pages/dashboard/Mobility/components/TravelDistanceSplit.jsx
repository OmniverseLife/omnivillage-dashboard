import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getTravelDistanceSplit } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const TravelDistanceSplitChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: travelDistanceResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["travel-distance-split-data", villageName, countryName],
    queryFn: () => getTravelDistanceSplit(countryName, villageName), // Assuming API handles null villageName for all data
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    // Check if the response data array exists and has elements in chartData
    if (
      travelDistanceResponse?.data?.chartData &&
      Array.isArray(travelDistanceResponse.data.chartData) &&
      travelDistanceResponse.data.chartData.length > 0 &&
      travelDistanceResponse.data.keys
    ) {
      const chartData = travelDistanceResponse.data.chartData;
      const keys = travelDistanceResponse.data.keys; // ["Distance Travelled Within Village (KM)", "Distance Travelled Outside (KM)"]

      const categories = chartData.map(item => item.village || "Unknown Village");

      // Extract data for each key/series
      const series = keys.map(key => ({
        name: key,
        data: chartData.map(item => typeof item[key] === 'number' ? item[key] : 0),
        tooltip: {
          valueSuffix: ' KM' // Add KM suffix to tooltip values
        }
      }));

      const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Villages";

      setChartOptions({
        chart: {
          type: "column", // Stacked column chart
          backgroundColor: "transparent",
          height: 400, // Adjust height as needed
        },
        title: {
          text: `Travel Distance Split (Within vs Outside Village) ${chartTitleVillagePart}`,
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
            text: "Distance Travelled (KM)",
          },
          labels: {
            formatter: function () {
              return `${this.value} KM`; // Add unit to Y-axis labels
            },
            style: {
              color: "#666",
            },
          },
          stackLabels: { // Labels on top of each stack
            enabled: true,
            formatter: function () {
              return `${this.total} KM`; // Show total for the stack
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
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} KM</b><br/>' +
                       'Total: <b>{point.stackTotal} KM</b>', // Show individual and stack total
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
        series: series, // Dynamically generated series based on 'keys'
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No travel distance split data available."
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
      const noDataTitleVillagePart = villageName ? `in ${villageName}` : "Across Villages";
      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `Travel Distance Split (Within vs Outside Village) ${noDataTitleVillagePart}`,
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
            noData: "No travel distance split data available."
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#303030'
            }
        }
      });
    }
  }, [travelDistanceResponse, villageName, countryName]); // Depend on the response and search params

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
          Error loading travel distance data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid and has expected properties in at least one element
  const hasValidData = travelDistanceResponse?.data?.chartData?.length > 0 &&
                       travelDistanceResponse.data.keys?.length > 0 &&
                       travelDistanceResponse.data.chartData.some(item =>
                         travelDistanceResponse.data.keys.some(key => typeof item[key] === 'number')
                       );

  if (!hasValidData) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No travel distance split data available for {villageName || 'the selected region'}.
        </div>
      </StyledCard>
    );
  }

  // Determine the display text for the footer
  let footerTextVillagePart;
  if (villageName) {
    footerTextVillagePart = `in ${villageName}`;
  } else {
    footerTextVillagePart = `across ${travelDistanceResponse.data.chartData.length} villages`;
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
          Breakdown of distance travelled within and outside villages{" "}
          {footerTextVillagePart}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default TravelDistanceSplitChart;