import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getOtherProduce } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const OtherProduceBarChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: otherProduceResponse, // Renamed for clarity
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["other-produce-data", villageName, countryName],
    queryFn: () => getOtherProduce(countryName, villageName), // Assuming API handles country and village
    enabled: !!villageName && !!countryName, // Enable if both are available
  });

  useEffect(() => {
    if (
      otherProduceResponse?.data &&
      Array.isArray(otherProduceResponse.data) &&
      otherProduceResponse.data.length > 0
    ) {
      // Sort data by totalQuantity in descending order for better visualization
      const sortedData = [...otherProduceResponse.data].sort(
        (a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0)
      );

      const categories = sortedData.map(item => item.typeName?.en || "Unknown Produce");
      const seriesData = sortedData.map(item => ({
        y: typeof item.totalQuantity === 'number' ? item.totalQuantity : 0,
        unit: item.quantityUnit?.en || "", // Store unit in data point for tooltip
        name: item.typeName?.en || "Unknown Produce", // Store name for consistent tooltip
      }));

      const chartTitleVillagePart = villageName ? `in ${villageName}` : "Across Villages";


      setChartOptions({
        chart: {
          type: "bar", // Horizontal bar chart
          backgroundColor: "transparent",
          height: Math.max(400, categories.length * 40 + 100), // Dynamic height based on number of items
        },
        title: {
          text: `Other Forest Produce Quantities ${chartTitleVillagePart}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories, // Produce types on the Y-axis (for horizontal chart)
          title: {
            text: "Produce Type",
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
            text: "Total Quantity", // Quantity on the X-axis (for horizontal chart)
          },
          labels: {
            formatter: function () {
              // Highcharts will automatically format numbers, units will be added in tooltip
              return `${this.value}`;
            },
            style: {
              color: "#666",
            },
          },
          allowDecimals: false, // Assuming quantities are whole numbers
        },
        tooltip: {
          formatter: function () {
            const point = this.point;
            // Access custom 'unit' property stored in seriesData
            const unit = point.unit ? ` ${point.unit}` : '';
            return `<b>${point.name}</b><br/>` +
                   `Total Quantity: <b>${point.y}${unit}</b>`;
          },
          shared: false, // Ensure individual point tooltips
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              format: "{point.y}{point.unit}", // Show quantity and unit on the bar
              style: {
                fontWeight: "bold",
                color: "black",
              },
              inside: true, // Place labels inside the bars
              align: 'left', // Align labels to the left of the bar
              crop: false, // Prevent labels from being cropped if they extend beyond the plot area
              overflow: 'allow' // Allow labels to overflow if needed
            },
            pointPadding: 0.1, // Spacing between bars
            groupPadding: 0.1, // Spacing between groups of bars (not applicable here with one series)
            colorByPoint: true, // Assign different colors to each bar
            borderRadius: 5, // Optional: Rounded corners for bars
          },
        },
        series: [
          {
            name: "Quantity",
            data: seriesData,
            // Colors will be assigned by Highcharts automatically due to colorByPoint: true
          },
        ],
        credits: {
          enabled: false,
        },
        // No Data message
        lang: {
            noData: "No other forest produce data available."
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
          type: "bar",
          backgroundColor: "transparent",
          height: 400,
        },
        title: {
          text: `Other Forest Produce Quantities ${noDataTitleVillagePart}`,
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
            noData: "No other forest produce data available."
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
  }, [otherProduceResponse, villageName, countryName]); // Depend on the response and search params

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
          Error loading other produce data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // Check if data is valid and has expected properties
  const hasValidData = otherProduceResponse?.data?.length > 0 &&
                       otherProduceResponse.data.some(item =>
                         typeof item.totalQuantity === 'number' && item.typeName?.en
                       );

  if (!hasValidData) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No other forest produce data available for {villageName || 'the selected region'}.
        </div>
      </StyledCard>
    );
  }

  // Determine the display text for the footer
  let footerTextVillagePart;
  if (villageName) {
    footerTextVillagePart = `in ${villageName}`;
  } else {
    footerTextVillagePart = `across ${otherProduceResponse.data.length} types of produce`;
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
          Quantities of various other forest produce harvested{" "}
          {footerTextVillagePart}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default OtherProduceBarChart;