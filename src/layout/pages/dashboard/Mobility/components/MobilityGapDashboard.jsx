import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official"; // Optional, for the small comparison chart

import { Card, CardContent, Typography, CircularProgress, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getMobilityGap } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

// Styled card for overall display
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
  minHeight: 250, // Ensure cards have a minimum height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

// Styled card for individual KPIs
const KpiCard = styled(Card)(({ theme, gapindexcolor }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(2),
  backgroundColor: gapindexcolor || theme.palette.background.paper,
  color: gapindexcolor ? theme.palette.getContrastText(gapindexcolor) : theme.palette.text.primary,
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  borderRadius: 8,
}));

const MobilityGapDashboard = () => {
  const [mobilityData, setMobilityData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: mobilityGapResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["mobility-gap-data", villageName, countryName],
    queryFn: () => getMobilityGap(countryName, villageName), // Assuming API handles villageName filter
    enabled: !!villageName && !!countryName, // Enable query if both are available
  });

  useEffect(() => {
    if (
      mobilityGapResponse?.data &&
      Array.isArray(mobilityGapResponse.data) &&
      mobilityGapResponse.data.length > 0
    ) {
      // Assuming getMobilityGap always returns an array with one village's data if filtered
      const dataForVillage = villageName
        ? mobilityGapResponse.data.find(item => item.villageName === villageName)
        : mobilityGapResponse.data[0];

      if (dataForVillage) {
        setMobilityData(dataForVillage);

        // Prepare data for the small comparison chart
        const totalVehicles = typeof dataForVillage.totalVehicles === 'number' ? dataForVillage.totalVehicles : 0;
        const totalPopulation = typeof dataForVillage.totalPopulation === 'number' ? dataForVillage.totalPopulation : 0;

        setChartOptions({
          chart: {
            type: "bar",
            backgroundColor: "transparent",
            height: 150, // Small height for comparison
            margin: [0, 0, 0, 0] // Reduce margins
          },
          title: {
            text: null // No title for embedded chart
          },
          xAxis: {
            categories: ['Total Vehicles', 'Total Population'],
            title: { text: null },
            labels: {
              style: { fontSize: '10px' }
            },
            lineWidth: 0, // Hide axis line
            tickWidth: 0, // Hide ticks
          },
          yAxis: {
            title: { text: null },
            labels: {
              formatter: function() { return Math.abs(this.value); }, // Ensure positive labels
              style: { fontSize: '10px' }
            },
            gridLineWidth: 0, // Hide grid lines
            endOnTick: false, // Don't force ticks to end on a specific value
            startOnTick: false, // Don't force ticks to start on a specific value
            maxPadding: 0.1, // Adjust padding
            minPadding: 0.1, // Adjust padding
          },
          legend: {
            enabled: false // No legend for simple comparison
          },
          tooltip: {
            pointFormat: '<b>{point.y}</b>',
            enabled: true
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true,
                format: '{point.y}',
                style: {
                  fontWeight: 'bold',
                  fontSize: '10px',
                  textOutline: '1px white'
                }
              },
              colorByPoint: true // Each bar gets a different color
            }
          },
          series: [{
            name: 'Count',
            data: [totalVehicles, totalPopulation]
          }],
          credits: {
            enabled: false
          }
        });
      } else {
        setMobilityData(null); // No data for the specific village
      }
    } else {
      setMobilityData(null); // No data received
    }
  }, [mobilityGapResponse, villageName, countryName]);

  const getGapIndexColor = (gapIndex) => {
    // Customize colors based on gapIndex value
    if (gapIndex === 0) return '#4CAF50'; // Green for no gap
    if (gapIndex > 0) return '#FF9800'; // Orange for a positive gap
    if (gapIndex < 0) return '#2196F3'; // Blue for a negative gap (e.g., surplus)
    return '#607D8B'; // Grey for unknown/null
  };

  if (isLoading) {
    return (
      <StyledCard sx={{ marginTop: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ marginTop: 2 }}>Loading Mobility Gap data...</Typography>
      </StyledCard>
    );
  }

  if (isError) {
    return (
      <StyledCard sx={{ marginTop: 4 }}>
        <Typography color="error">Error: {error?.message || "Failed to load data"}</Typography>
      </StyledCard>
    );
  }

  const currentVillageDisplay = mobilityData?.villageName || villageName || "the selected region";

  if (!mobilityData) {
    return (
      <StyledCard sx={{ marginTop: 4 }}>
        <Typography variant="body1">No Mobility Gap data available for {currentVillageDisplay}.</Typography>
      </StyledCard>
    );
  }

  return (
    <StyledCard sx={{ marginTop: 4 }}>
      <CardContent sx={{ width: '100%', paddingBottom: '0 !important' }}> {/* Override padding to avoid extra space */}
        <Typography variant="h6" gutterBottom align="left" sx={{ fontWeight: 'bold' }}>
          Mobility Gap & Key Metrics for {currentVillageDisplay}
        </Typography>
        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard>
              <Typography variant="subtitle1" color="textSecondary">Total Vehicles</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                {mobilityData.totalVehicles}
              </Typography>
            </KpiCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard>
              <Typography variant="subtitle1" color="textSecondary">Total Population</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {mobilityData.totalPopulation}
              </Typography>
            </KpiCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard>
              <Typography variant="subtitle1" color="textSecondary">Total Distance Travelled</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {mobilityData.totalDistanceTravelled} KM
              </Typography>
            </KpiCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard gapindexcolor={getGapIndexColor(mobilityData.gapIndex)}>
              <Typography variant="subtitle1">Mobility Gap Index</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {typeof mobilityData.gapIndex === 'number' ? mobilityData.gapIndex : 'N/A'}
              </Typography>
              <Typography variant="caption">
                {mobilityData.gapIndex === 0 ? "Optimal mobility" :
                 mobilityData.gapIndex > 0 ? "Mobility deficit" :
                 "Mobility surplus"}
              </Typography>
            </KpiCard>
          </Grid>
        </Grid>

        {/* Small comparison chart below KPIs */}
        <Grid container justifyContent="center" sx={{ marginTop: 4 }}>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" align="center" gutterBottom>
                    Vehicles vs. Population
                </Typography>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </Grid>
        </Grid>
      </CardContent>
      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ marginTop: 2, paddingBottom: 2 }}
      >
        Overall mobility metrics for <strong>{currentVillageForFooter(mobilityData, villageName)}</strong>.
      </Typography>
    </StyledCard>
  );
};

// Helper function for footer text
const currentVillageForFooter = (data, villageNameParam) => {
    return data?.villageName || villageNameParam;
};


export default MobilityGapDashboard;