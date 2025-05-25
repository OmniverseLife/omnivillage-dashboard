import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getLocalProduceShare } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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
  position: 'relative', // Needed for absolute positioning of percentage text
}));

const LocalProduceShareChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [percentageProducing, setPercentageProducing] = useState(0);
  const [searchParams] = useSearchParams();
  // Assuming API call needs village/country context, even if response is flat
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: produceShareResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["local-produce-share-data", villageName, countryName],
    queryFn: () => getLocalProduceShare(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      produceShareResponse?.data &&
      typeof produceShareResponse.data.totalHouseholds === 'number' &&
      typeof produceShareResponse.data.householdsProducingItems === 'number' &&
      typeof produceShareResponse.data.percentageProducing === 'number'
    ) {
      const { totalHouseholds, householdsProducingItems, percentageProducing: fetchedPercentage } = produceShareResponse.data;

      const nonProducingHouseholds = Math.max(0, totalHouseholds - householdsProducingItems);
      setPercentageProducing(fetchedPercentage); // Store percentage for central display

      const hasData = totalHouseholds > 0; // Check if there's meaningful data

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          height: 350, // Adjusted height for donut
        },
        title: {
          text: `Local Production Share (Households)`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat: '<b>{point.name}</b>: {point.y} households ({point.percentage:.1f}%)',
        },
        plotOptions: {
          pie: {
            innerSize: '60%', // Creates the donut effect
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f}%',
              distance: -30, // Position labels inside slices
              color: 'black',
              style: {
                fontWeight: 'bold',
                textOutline: '1px white'
              },
              filter: {
                  property: 'percentage',
                  operator: '>',
                  value: 4 // Only show labels for slices > 4%
              }
            },
            showInLegend: true,
            states: {
              hover: {
                halo: {
                  size: 0 // Disable halo on hover for cleaner look
                }
              }
            }
          },
        },
        series: [
          {
            name: "Households",
            colorByPoint: true,
            data: [
              {
                name: "Producing Items",
                y: householdsProducingItems,
                color: '#4CAF50' // Green for producing households
              },
              {
                name: "Not Producing Items",
                y: nonProducingHouseholds,
                color: '#FFC107' // Amber for non-producing households
              },
            ],
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No local production share data available."
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
      setPercentageProducing(0); // Reset percentage if no data
    }
  }, [produceShareResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "pie", backgroundColor: "transparent", height: 350 },
    title: {
      text: `Local Production Share (Households)`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    series: [],
    credits: { enabled: false },
    lang: { noData: "No local production share data available." },
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
          Error loading local production share data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = produceShareResponse?.data && produceShareResponse.data.totalHouseholds > 0;

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No local production share data available.
        </div>
      </StyledCard>
    );
  }

  return (
    <StyledCard sx={{ marginTop: 4, paddingTop: "72px" }}>
      <CardContent sx={{ position: 'relative' }}> {/* Add relative position to CardContent */}
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        {/* Central percentage display */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none', // Allow clicks/hovers to pass through to chart
            zIndex: 1, // Ensure it's above the chart
          }}
        >
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#333' }}>
            {percentageProducing.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Producing Households
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ marginTop: 2 }}
        >
          {produceShareResponse.data.householdsProducingItems} out of{" "}
          {produceShareResponse.data.totalHouseholds} households are engaged in local production.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default LocalProduceShareChart;