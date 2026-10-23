import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getSpendVsConsumption } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const SpendVsConsumptionScatterChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: spendVsConsumptionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["spend-vs-consumption-data", villageName],
    queryFn: () => getSpendVsConsumption(countryName, villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (spendVsConsumptionData?.data) {
      const { scatterData, outliers } = spendVsConsumptionData.data;

      // Prepare data for the main scatter series
      const regularData = scatterData.map((d) => ({
        x: d.consumption,
        y: d.spend,
        members: d.members,
        spendPerMember: d.spendPerMember,
        isOutlier: outliers.some((o) => o._id === d._id), // Flag for easy identification
      }));

      // Separate outliers for a distinct series
      const outlierData = regularData.filter((d) => d.isOutlier);
      const nonOutlierData = regularData.filter((d) => !d.isOutlier);

      setChartOptions({
        chart: {
          type: "scatter",
          zoomType: "xy", // Allows zooming by dragging a rectangle
          backgroundColor: "transparent",
        },
        title: {
          text: `Electricity Spend vs. Consumption in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          title: {
            text: "Consumption (kWh)",
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
          labels: {
            formatter: function () {
              return `${this.value} kWh`;
            },
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Spend (INR)", // Assuming INR, adjust currency as needed
          },
          labels: {
            formatter: function () {
              return `₹${this.value}`; // Assuming INR, adjust currency as needed
            },
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          formatter: function () {
            const point = this.point;
            return (
              `<b>Consumption:</b> ${point.x} kWh<br/>` +
              `<b>Spend:</b> ₹${point.y}<br/>` + // Assuming INR
              `<b>Members:</b> ${point.members}<br/>` +
              `<b>Spend per Member:</b> ₹${
                point.spendPerMember ? point.spendPerMember.toFixed(2) : "N/A"
              }`
            );
          },
          shared: false, // Each point has its own tooltip
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 5,
              states: {
                hover: {
                  enabled: true,
                  lineColor: "rgb(100,100,100)",
                },
              },
            },
            states: {
              hover: {
                marker: {
                  enabled: false,
                },
              },
            },
            tooltip: {
              headerFormat: "<b>{series.name}</b><br>",
            },
          },
        },
        series: [
          {
            name: "Households",
            color: "rgba(119, 152, 191, .5)", // Default color for regular points
            data: nonOutlierData,
          },
          {
            name: "Outliers",
            color: "rgba(223, 83, 83, .7)", // Distinct color for outliers
            marker: {
              symbol: "circle", // Can use different symbol for outliers
              radius: 6,
              lineWidth: 1,
              lineColor: "#FFFFFF",
            },
            data: outlierData,
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "scatter",
          backgroundColor: "transparent",
        },
        title: {
          text: `Electricity Spend vs. Consumption in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          title: {
            text: "Consumption (kWh)",
          },
        },
        yAxis: {
          title: {
            text: "Spend (INR)",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No spend vs. consumption data available.",
        },
      });
    }
  }, [spendVsConsumptionData, villageName]);

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
        Error: {error?.message || "Failed to load spend vs. consumption data."}
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
          Relationship between electricity consumption and spend for households
          in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default SpendVsConsumptionScatterChart;
