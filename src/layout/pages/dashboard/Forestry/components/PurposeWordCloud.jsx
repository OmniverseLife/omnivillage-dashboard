import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// Import the Highcharts Wordcloud module
import HighchartsWordcloud from "highcharts/modules/wordcloud";
HighchartsWordcloud(Highcharts); // Initialize the module

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getPurposeCloud } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const TimberPurposeWordCloud = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: purposeCloudResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["purpose-cloud-data", villageName, countryName],
    queryFn: () => getPurposeCloud(countryName, villageName), // Adjust API call args if needed
    enabled: !!villageName && !!countryName, // Enable if both are available
  });

  useEffect(() => {
    if (
      purposeCloudResponse?.data &&
      Array.isArray(purposeCloudResponse.data) &&
      purposeCloudResponse.data.length > 0
    ) {
      // Transform data for the Word Cloud
      const wordCloudData = purposeCloudResponse.data.map(item => ({
        name: item.text || "Unknown", // The text for the word
        weight: typeof item.count === 'number' ? item.count : 0, // The frequency/count
      })).filter(item => item.weight > 0); // Filter out items with zero count

      const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Villages";

      setChartOptions({
        chart: {
          type: "wordcloud", // Specify wordcloud type
          backgroundColor: "transparent",
          height: 400, // Adjust height as needed
        },
        title: {
          text: `Key Timber Purposes ${chartTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        // Word cloud charts typically don't have traditional axes
        series: [
          {
            name: "Purpose Count",
            data: wordCloudData,
            // Options for wordcloud appearance
            rotation: {
              from: 0,
              to: 90,
              orientations: 5 // Allow 5 different angles for words
            },
            minFontSize: 10,
            maxFontSize: 80, // Adjust based on data range
            // colorByPoint: true, // Optional: gives each word a different color
            colors: Highcharts.getOptions().colors, // Use default Highcharts colors
          },
        ],
        tooltip: {
          headerFormat: '<span style="font-size: 14px"><b>{point.key}</b></span><br>',
          pointFormat: 'Count: <b>{point.weight}</b>', // Display word and its count
        },
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No timber purpose data available to create a word cloud."
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
          type: "wordcloud",
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `Key Timber Purposes ${noDataTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        series: [], // Empty series
        credits: {
          enabled: false,
        },
        lang: {
            noData: "No timber purpose data available to create a word cloud."
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
  }, [purposeCloudResponse, villageName, countryName]); // Depend on the response and search params

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
          Error loading purpose cloud data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid for word cloud (at least one item with a valid text and count)
  const hasValidData = purposeCloudResponse?.data?.length > 0 &&
                       purposeCloudResponse.data.some(item =>
                         (item.text && item.text.trim() !== '') && typeof item.count === 'number' && item.count > 0
                       );

  if (!hasValidData) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No timber purpose data available to create a word cloud for {villageName || 'the selected region'}.
        </div>
      </StyledCard>
    );
  }

  // Determine the display text for the footer
  const footerTextVillagePart = villageName ? `in ${villageName}` : "across villages";

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
          Visual representation of most common timber purposes {footerTextVillagePart}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default TimberPurposeWordCloud;