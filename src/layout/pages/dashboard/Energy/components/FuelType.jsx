import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getFuelType } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const FuelTypeDonutChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: fuelTypeData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["fuel-type-data", villageName],
    queryFn: () => getFuelType(countryName, villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (fuelTypeData?.data && Array.isArray(fuelTypeData.data)) {
      const seriesData = fuelTypeData.data.map((item) => ({
        name: item.type.replace(/_/g, " "), // Replace underscores for better readability
        y: item.percentage,
        count: item.count, // Store count for tooltip
      }));

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household Fuel Type Usage in ${villageName}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.percentage:.1f}%</b> ({point.count} households)",
        },
        accessibility: {
          point: {
            valueSuffix: "%",
          },
        },
        plotOptions: {
          pie: {
            innerSize: "60%", // Makes it a donut chart
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: -30, // Position labels inside the slices
              filter: {
                property: "percentage",
                operator: ">",
                value: 4, // Only show labels for slices > 4%
              },
              style: {
                fontWeight: "bold",
                color: "white",
                textOutline: "1px black", // Add outline for better contrast
              },
            },
            showInLegend: true,
          },
        },
        series: [
          {
            name: "Fuel Type Share",
            colorByPoint: true, // Assigns different colors to each slice
            data: seriesData,
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household Fuel Type Usage in ${villageName}`,
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
        noData: {
          text: "No fuel type data available.",
        },
      });
    }
  }, [fuelTypeData, villageName]);

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
      <div style={{ color: "red", padding: 16 }}>
        Error: {error?.message || "Failed to load fuel type data."}
      </div>
    );
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
          Distribution of fuel types used by households in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default FuelTypeDonutChart;
