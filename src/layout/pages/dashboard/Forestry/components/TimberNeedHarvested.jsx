import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// Import the Highcharts More module which includes gauge charts
import HighchartsMore from "highcharts/highcharts-more";
HighchartsMore(Highcharts); // Initialize the module

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getTimberNeedHarvested } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const TimberNeedHarvestedGauge = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: timberDataResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["timber-need-harvested-data", villageName, countryName],
    queryFn: () => getTimberNeedHarvested(countryName, villageName),
    enabled: !!villageName && !!countryName, // Ensure both are available
  });

  useEffect(() => {
    // Check if the response data array exists and has elements
    if (
      timberDataResponse?.data &&
      Array.isArray(timberDataResponse.data) &&
      timberDataResponse.data.length > 0
    ) {
      // Assuming we take the first item if multiple are returned for some reason,
      // as a gauge typically displays one set of metrics.
      const timberData = timberDataResponse.data[0];

      const { village, totalTimberNeed, totalTimberHarvested } = timberData;

      const currentVillageName = village || villageName || "Selected Village";
      const actualTotalTimberNeed = typeof totalTimberNeed === 'number' && totalTimberNeed > 0 ? totalTimberNeed : 1; // Avoid division by zero
      const actualTotalTimberHarvested = typeof totalTimberHarvested === 'number' ? totalTimberHarvested : 0;

      // Calculate percentage
      const percentageFulfilled = (actualTotalTimberHarvested / actualTotalTimberNeed) * 100;

      // Determine the max for the gauge. If it goes significantly over 100%,
      // you might want to extend the gauge's max to make it visible.
      const gaugeMax = Math.max(100, Math.ceil(percentageFulfilled / 10) * 10 || 100); // Ensures max is at least 100 and scales up in 10% increments

      setChartOptions({
        chart: {
          type: "gauge",
          backgroundColor: "transparent",
          height: 300, // Adjust height
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false,
        },
        title: {
          text: `Timber Need Fulfillment in ${currentVillageName}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        pane: {
          startAngle: -150,
          endAngle: 150,
          background: [
            {
              backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, '#FFF'],
                  [1, '#333']
                ]
              },
              borderWidth: 0,
              outerRadius: '109%'
            }, {
              backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, '#333'],
                  [1, '#FFF']
                ]
              },
              borderWidth: 1,
              outerRadius: '107%'
            }, {
              // default background
              backgroundColor: '#DDD',
              borderWidth: 0,
              outerRadius: '105%',
              innerRadius: '103%'
            }
          ]
        },
        // the value axis
        yAxis: {
          min: 0,
          max: gaugeMax, // Dynamic max to show over-fulfillment
          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 10,
          minorTickPosition: 'inside',
          minorTickColor: '#666',
          tickPixelInterval: 30,
          tickWidth: 2,
          tickPosition: 'inside',
          tickLength: 10,
          tickColor: '#666',
          labels: {
            step: 2,
            distance: 20,
            formatter: function () {
              return this.value + ' %';
            }
          },
          title: {
            text: 'Fulfillment',
            y: 40
          },
          plotBands: [
            {
              from: 0,
              to: 50,
              color: '#DF5353' // red
            }, {
              from: 50,
              to: 100,
              color: '#DDDF0D' // yellow
            }, {
              from: 100,
              to: gaugeMax, // Extends beyond 100 if necessary
              color: '#55BF3B' // green
            }
          ]
        },
        series: [{
          name: 'Fulfillment',
          data: [parseFloat(percentageFulfilled.toFixed(2))], // Use the calculated percentage
          tooltip: {
            valueSuffix: ' %'
          },
          dial: {
              radius: '80%',
              backgroundColor: 'gray',
              borderColor: 'silver',
              borderWidth: 1,
              baseWidth: 10
          },
          pivot: {
              backgroundColor: 'gray',
              borderColor: 'silver',
              borderWidth: 1
          }
        }],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No timber need/harvest data available."
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
      const noDataTitleVillagePart = villageName ? `in ${villageName}` : "Across Regions";
      setChartOptions({
        chart: {
          type: "gauge",
          backgroundColor: "transparent",
          height: 300,
        },
        title: {
          text: `Timber Need Fulfillment ${noDataTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No timber need/harvest data available."
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
  }, [timberDataResponse, villageName, countryName]); // Depend on the response and search params

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
          Error loading timber need/harvest data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid
  const hasValidData = timberDataResponse?.data?.length > 0 &&
                       typeof timberDataResponse.data[0].totalTimberNeed === 'number' &&
                       typeof timberDataResponse.data[0].totalTimberHarvested === 'number';

  if (!hasValidData) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No timber need/harvest data available for {villageName || 'the selected region'}.
        </div>
      </StyledCard>
    );
  }

  const currentVillageNameForFooter = timberDataResponse.data[0].village || villageName;

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
          Percentage of timber need fulfilled in <strong>{currentVillageNameForFooter}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default TimberNeedHarvestedGauge;