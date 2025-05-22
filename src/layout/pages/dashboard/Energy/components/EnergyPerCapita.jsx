import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getEnergyPerCapita } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const EnergyPerCapitaChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: energyPerCapitaResponse, // Renamed to avoid confusion with the 'data' property inside
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["energy-per-capita-data", villageName, countryName],
    queryFn: () => getEnergyPerCapita(countryName, villageName),
    enabled: !!villageName && !!countryName,
  });

  useEffect(() => {
    // Check if the overall response and its 'data' array exist and have at least one element
    if (
      energyPerCapitaResponse?.data &&
      Array.isArray(energyPerCapitaResponse.data) &&
      energyPerCapitaResponse.data.length > 0
    ) {
      // Access the first element of the data array
      const energyPerCapitaData = energyPerCapitaResponse.data[0];

      const {
        totalEnergyConsumption,
        totalPopulation,
        village,
        energyIntensity,
      } = energyPerCapitaData;

      // Ensure energyIntensity is a valid number before using it
      const finalEnergyIntensity = typeof energyIntensity === 'number' ? energyIntensity : 0;
      const finalTotalEnergyConsumption = typeof totalEnergyConsumption === 'number' ? totalEnergyConsumption : 0;
      const finalTotalPopulation = typeof totalPopulation === 'number' ? totalPopulation : 0;
      const finalVillageName = village || villageName || "Selected Village";

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
          height: 300,
        },
        title: {
          text: `Energy Intensity in ${finalVillageName}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [finalVillageName],
          title: {
            text: "Village",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Energy Intensity (kWh/capita)",
          },
          labels: {
            formatter: function () {
              return `${this.value} kWh`;
            },
            style: {
              color: "#666",
            },
          },
          min: 0,
        },
        tooltip: {
          formatter: function () {
            const point = this.point;
            return (
              `<b>${point.category}</b><br/>` +
              `Energy Intensity: <b>${finalEnergyIntensity.toFixed(2)} kWh/capita</b><br/>` +
              `Total Energy Consumption: <b>${finalTotalEnergyConsumption} kWh</b><br/>` +
              `Total Population: <b>${finalTotalPopulation}</b>`
            );
          },
          shared: false,
          useHTML: true,
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              format: "{point.y:.2f}",
              style: {
                fontWeight: "bold",
                color: "black",
              },
            },
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Energy Intensity",
            data: [finalEnergyIntensity],
            color: "#FF9800",
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      // Set default options or a "no data" state when data is not available or invalid
      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
          height: 300,
        },
        title: {
          text: `Energy Intensity in ${villageName || 'Selected Village'}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Village",
          },
        },
        yAxis: {
          title: {
            text: "Energy Intensity (kWh/capita)",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No energy per capita data available.",
        },
      });
    }
  }, [energyPerCapitaResponse, villageName, countryName]); // Depend on the response object

  // Loading and Error states
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
          Error loading energy per capita data: {error?.message || "Unknown error."}
        </div>
      </StyledCard>
    );
  }

  // No data state
  // Check if energyPerCapitaResponse.data is an array and if its first element exists
  if (
    !energyPerCapitaResponse?.data ||
    !Array.isArray(energyPerCapitaResponse.data) ||
    energyPerCapitaResponse.data.length === 0 ||
    !energyPerCapitaResponse.data[0].energyIntensity // Check for the specific property in the first element
  ) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ padding: 24, textAlign: "center" }}>
          No energy per capita data available for {villageName || 'the selected village'}.
        </div>
      </StyledCard>
    );
  }

  // If data is available, render the chart (and the Typography uses the first element)
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
          Energy consumption per person in{" "}
          <strong>{energyPerCapitaResponse.data[0].village || villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default EnergyPerCapitaChart;