import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getBusinessTypeDistribution } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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
  position: 'relative', // Needed for absolute positioning of central text
}));

const BusinessTypeDistributionChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [totalBusinesses, setTotalBusinesses] = useState(0); // State for central text
  const [searchParams] = useSearchParams();
  // Assuming API call needs village/country context, even if response is flat
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: businessTypeResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["business-type-distribution-data", villageName, countryName],
    queryFn: () => getBusinessTypeDistribution(countryName, villageName), // Adjust API call args if needed
    enabled: !!countryName, // Enable query if countryName is available
  });

  useEffect(() => {
    if (
      businessTypeResponse?.data &&
      Array.isArray(businessTypeResponse.data) &&
      businessTypeResponse.data.length > 0
    ) {
      // Sort data by count descending for better visualization
      const sortedData = [...businessTypeResponse.data].sort(
        (a, b) => (b.count || 0) - (a.count || 0)
      );

      const pieData = sortedData.map(item => ({
        name: item.businessType?.en || "Unknown Type", // Use English name for display
        y: typeof item.count === 'number' ? item.count : 0,
        // color: '...', // Highcharts can automatically assign colors, or define them here
      }));

      const calculatedTotal = pieData.reduce((sum, item) => sum + item.y, 0);
      setTotalBusinesses(calculatedTotal); // Set total for central display

      const hasData = calculatedTotal > 0;

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          height: 350, // Adjusted height for donut
        },
        title: {
          text: `Business Type Distribution`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat: '<b>{point.name}</b>: {point.y} businesses ({point.percentage:.1f}%)',
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
            name: "Businesses",
            colorByPoint: true, // Assigns different colors to each slice
            data: pieData,
          },
        ],
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No business type distribution data available."
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
      setTotalBusinesses(0); // Reset total if no data
    }
  }, [businessTypeResponse, villageName, countryName]);

  // Helper function for no data options
  const getNoDataOptions = () => ({
    chart: { type: "pie", backgroundColor: "transparent", height: 350 },
    title: {
      text: `Business Type Distribution`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    series: [],
    credits: { enabled: false },
    lang: { noData: "No business type distribution data available." },
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
          Error loading business type data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  const hasValidDataForDisplay = businessTypeResponse?.data &&
                                businessTypeResponse.data.some(item => typeof item.count === 'number' && item.count > 0);

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No business type distribution data available.
        </div>
      </StyledCard>
    );
  }

  return (
    <StyledCard sx={{ marginTop: 4, paddingTop: "72px" }}>
      <CardContent sx={{ position: 'relative' }}> {/* Add relative position to CardContent */}
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        {/* Central total businesses display */}
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
            {totalBusinesses}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total Businesses
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ marginTop: 2 }}
        >
          Distribution of different business types.
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default BusinessTypeDistributionChart;