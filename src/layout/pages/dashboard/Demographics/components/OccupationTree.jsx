import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// No longer need TreemapModule for a bar chart
// import TreemapModule from "highcharts/modules/treemap"; // REMOVE THIS LINE
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getOccupationTreeMap } from "../../../../../functions/demographics";

// If you had initialized TreemapModule here, you should remove that line as well.
// TreemapModule(Highcharts); // REMOVE OR COMMENT OUT THIS LINE

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

const OccupationBarChart = () => { // Renamed component for clarity
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: occupationData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["demographic-occupation-bar", villageName], // Updated query key
    queryFn: () => getOccupationTreeMap(villageName), // Keep the same function if it returns the right data
    enabled: !!villageName,
  });

  useEffect(() => {
    if (occupationData?.data && occupationData.data.length > 0) {
      // Sort data in descending order for better visualization in a bar chart
      const sortedData = [...occupationData.data].sort((a, b) => b.count - a.count);

      const categories = sortedData.map(
        (item) => item.occupation?.en?.trim() || "Unknown"
      );
      const seriesData = sortedData.map((item) => item.count);

      const options = {
        chart: {
          type: "column", // Changed to 'column' for a vertical bar chart
          backgroundColor: "transparent",
        },
        title: {
          text: `Occupational Distribution in ${villageName || 'Selected Village'}`, // Added village name to title
          align: "center",
          style: {
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Occupation",
            style: { color: "#555" },
          },
          labels: {
            rotation: -45, // Rotate labels for better readability if many categories
            style: {
              fontSize: "12px",
              color: "#666",
            },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Number of People",
            style: { color: "#555" },
          },
          labels: {
            style: {
              color: "#666",
            },
          },
          gridLineColor: "#e0e0e0",
        },
        series: [
          {
            name: "Number of People",
            data: seriesData,
            colorByPoint: true, // Assigns a different color to each column
            dataLabels: {
              enabled: true,
              format: '{point.y}', // Show the count on top of the bars
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
          },
        ],
        legend: {
          enabled: false, // Usually not needed for single series bar charts
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
        },
        credits: {
          enabled: false,
        },
        responsive: {
          rules: [
            {
              condition: { maxWidth: 600 },
              chartOptions: {
                xAxis: {
                  labels: { rotation: -90, style: { fontSize: "10px" } },
                },
                title: { style: { fontSize: "16px" } },
              },
            },
          ],
        },
      };

      setChartOptions(options);
    } else {
      // Set no data options
      setChartOptions({
        chart: { type: "column", backgroundColor: "transparent" },
        title: { text: `Occupational Distribution in ${villageName || 'Selected Village'}` },
        xAxis: { categories: [], title: { text: "Occupation" } },
        yAxis: { title: { text: "Number of People" } },
        series: [{ name: "Number of People", data: [] }],
        lang: { noData: `No occupational data available for ${villageName}` },
        noData: {
          style: { fontWeight: "bold", fontSize: "16px", color: "#333333" },
        },
        credits: { enabled: false },
      });
    }
  }, [occupationData, villageName]);

  // Handle case where no village is selected
  if (!villageName) {
    return (
      <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 4 }}>
        Please select a village to view occupational distribution.
      </Typography>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <Typography color="error" align="center" sx={{ mt: 2 }}>
        Error: {error?.message || "Failed to load occupation data."}
      </Typography>
    );
  }

  // Check if data is truly empty after loading (e.g., if API returned an empty array)
  if (!occupationData?.data || occupationData.data.length === 0) {
    return (
      <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 4 }}>
        No occupational data available for {villageName}.
      </Typography>
    );
  }

  return (
    <StyledCard
      sx={{
        width: "100%",
        marginX: "auto",
        padding: "20px",
        paddingTop: "72px",
        marginTop: 4,
      }}
    >
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: Data is based on {villageName}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default OccupationBarChart; // Export the new component name