import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getUsagePurpose } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const TravelPurposeDistributionChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: usagePurposeResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["usage-purpose-data", villageName, countryName],
    queryFn: () => getUsagePurpose(countryName, villageName), // Assuming API handles villageName filter
    enabled: !!villageName && !!countryName, // Enable if both are available
  });

  useEffect(() => {
    if (
      usagePurposeResponse?.data?.result &&
      Array.isArray(usagePurposeResponse.data.result) &&
      usagePurposeResponse.data.result.length > 0
    ) {
      // Find data for the specific village, or take the first one if no villageName is specified
      const villageData = villageName
        ? usagePurposeResponse.data.result.find(item => item.village === villageName)
        : usagePurposeResponse.data.result[0];

      if (villageData && villageData.purposes && villageData.purposes.length > 0) {
        const pieData = villageData.purposes.map(p => ({
          name: p.purpose?.en?.trim() || "Unknown Purpose",
          y: typeof p.totalDistance === 'number' ? p.totalDistance : 0,
        }));

        const currentVillageDisplay = villageData.village || villageName || "Selected Village";

        setChartOptions({
          chart: {
            type: "pie",
            backgroundColor: "transparent",
            height: 400,
          },
          title: {
            text: `Travel Distance by Purpose in ${currentVillageDisplay}`,
            align: "left",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            },
          },
          tooltip: {
            pointFormat: '<b>{point.name}</b>: {point.y} KM ({point.percentage:.1f}%)',
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                distance: -40, // Position labels inside the slices
                color: 'black',
                style: {
                    fontWeight: 'bold',
                    textOutline: '1px white' // Add outline for better visibility on dark colors
                },
                filter: {
                    property: 'percentage',
                    operator: '>',
                    value: 4 // Only show labels for slices > 4%
                }
              },
              showInLegend: true, // Show a legend for categories
            },
          },
          series: [
            {
              name: "Distance",
              colorByPoint: true,
              data: pieData,
            },
          ],
          credits: {
            enabled: false,
          },
          lang: {
            noData: `No travel purpose data available for ${currentVillageDisplay}.`
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
        // Handle case where villageData is found but has no purposes or purposes is empty
        const currentVillageDisplay = villageData?.village || villageName || "Selected Village";
        setChartOptions(getNoDataOptions(currentVillageDisplay));
      }
    } else {
      // Handle case where no data or no result array
      setChartOptions(getNoDataOptions(villageName || "the selected region"));
    }
  }, [usagePurposeResponse, villageName, countryName]); // Depend on the response and search params

  // Helper function for no data options
  const getNoDataOptions = (displayVillage) => ({
    chart: { type: "pie", backgroundColor: "transparent", height: 400 },
    title: {
      text: `Travel Distance by Purpose in ${displayVillage}`,
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    series: [],
    credits: { enabled: false },
    lang: { noData: `No travel purpose data available for ${displayVillage}.` },
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
          Error loading travel purpose data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Final check for valid data to display
  const hasValidDataForDisplay = usagePurposeResponse?.data?.result?.length > 0 &&
                                (villageName
                                  ? usagePurposeResponse.data.result.some(v => v.village === villageName && v.purposes?.length > 0)
                                  : usagePurposeResponse.data.result[0]?.purposes?.length > 0);

  if (!hasValidDataForDisplay) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No travel purpose data available for {villageName || 'the selected region'}.
        </div>
      </StyledCard>
    );
  }

  const currentVillageForFooter = (villageName
    ? usagePurposeResponse.data.result.find(item => item.village === villageName)
    : usagePurposeResponse.data.result[0])?.village || villageName;

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
          Distribution of travel distance by purpose in{" "}
          <strong>{currentVillageForFooter}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default TravelPurposeDistributionChart;