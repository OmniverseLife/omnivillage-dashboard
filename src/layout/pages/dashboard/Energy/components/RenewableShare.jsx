import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getRenewableShare } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const RenewableShareDonutChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: renewableShareData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["renewable-share-data", villageName],
    queryFn: () => getRenewableShare(countryName, villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (renewableShareData?.data) {
      const {
        totalEnergyConsumption,
        renewableEnergyConsumption,
        renewablePercentage,
      } = renewableShareData.data;

      // Calculate non-renewable consumption and percentage
      const nonRenewableEnergyConsumption =
        totalEnergyConsumption - renewableEnergyConsumption;
      const nonRenewablePercentage = 100 - renewablePercentage;

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `Renewable Energy Share in ${villageName}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} kWh)",
        },
        accessibility: {
          point: {
            valueSuffix: "%",
          },
        },
        plotOptions: {
          pie: {
            innerSize: "60%", // Creates the donut effect
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: -30, // Position labels inside the slices
              filter: {
                property: "percentage",
                operator: ">",
                value: 0, // Show labels for any non-zero percentage
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
            name: "Energy Share",
            colorByPoint: true, // Assigns different colors to each slice
            data: [
              {
                name: "Renewable Energy",
                y: renewableEnergyConsumption,
                percentage: renewablePercentage, // Store percentage for display
                color: Highcharts.getOptions().colors[0] || "#64B5F6", // Default blue, or use a custom green if preferred
              },
              {
                name: "Non-Renewable Energy",
                y: nonRenewableEnergyConsumption,
                percentage: nonRenewablePercentage,
                color: Highcharts.getOptions().colors[1] || "#FFB74D", // Default orange
              },
            ],
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
          text: `Renewable Energy Share in ${villageName}`,
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
          text: "No renewable energy share data available.",
        },
      });
    }
  }, [renewableShareData, villageName]);

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
        Error: {error?.message || "Failed to load renewable energy share data."}
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
          Renewable energy consumption share in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default RenewableShareDonutChart;
