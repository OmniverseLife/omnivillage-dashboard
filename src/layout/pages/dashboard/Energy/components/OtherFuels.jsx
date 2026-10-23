import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getOtherFuels } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const OtherFuelsBarChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: otherFuelsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["other-fuels-data", villageName],
    queryFn: () => getOtherFuels(countryName, villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (otherFuelsData?.data && Array.isArray(otherFuelsData.data)) {
      const fuelTypes = otherFuelsData.data.map((item) =>
        item.fuelType.en.replace(/_/g, " ")
      );
      const counts = otherFuelsData.data.map((item) => item.count);
      const expenditures = otherFuelsData.data.map(
        (item) => item.totalExpenditures
      );
      const quantities = otherFuelsData.data.map((item) => item.totalQuantity);

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Other Fuel Types Usage and Metrics in ${villageName}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: fuelTypes,
          title: {
            text: "Fuel Type",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: [
          {
            // Primary yAxis for Count
            title: {
              text: "Households Count",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            labels: {
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            min: 0,
            allowDecimals: false,
          },
          {
            // Secondary yAxis for Expenditures
            title: {
              text: "Total Expenditures (₹)", // Assuming INR
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            labels: {
              formatter: function () {
                return `₹${this.value}`;
              },
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            opposite: true, // Place on the right side
          },
          {
            // Tertiary yAxis for Quantity
            title: {
              text: "Total Quantity (Units)",
              style: {
                color: Highcharts.getOptions().colors[2],
              },
            },
            labels: {
              style: {
                color: Highcharts.getOptions().colors[2],
              },
            },
            opposite: true, // Place on the right side
            offset: 80, // Offset to avoid overlapping with secondary yAxis
          },
        ],
        tooltip: {
          shared: true,
          formatter: function () {
            let tooltip = `<b>${this.x}</b><br/>`;
            this.points.forEach(function (point) {
              let value = point.y;
              let suffix = "";
              if (point.series.name === "Total Expenditures") {
                suffix = " ₹";
              } else if (point.series.name === "Total Quantity") {
                suffix = " Units";
              } else if (point.series.name === "Households Count") {
                suffix = " Households";
              }
              tooltip += `<span style="color:${point.series.color}">${point.series.name}:</span> <b>${value}${suffix}</b><br/>`;
            });
            return tooltip;
          },
        },
        plotOptions: {
          column: {
            grouping: true, // Important for grouped columns
            shadow: false,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "Households Count",
            data: counts,
            yAxis: 0, // Use primary yAxis
            color: Highcharts.getOptions().colors[0],
          },
          {
            name: "Total Expenditures",
            data: expenditures,
            yAxis: 1, // Use secondary yAxis
            color: Highcharts.getOptions().colors[1],
          },
          {
            name: "Total Quantity",
            data: quantities,
            yAxis: 2, // Use tertiary yAxis
            color: Highcharts.getOptions().colors[2],
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Other Fuel Types Usage and Metrics in ${villageName}`,
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
            text: "Fuel Type",
          },
        },
        yAxis: [{}, {}, {}], // Keep placeholder for multiple y-axes
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No other fuel types data available.",
        },
      });
    }
  }, [otherFuelsData, villageName]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ color: "red", padding: 16 }}>
          Error: {error?.message || "Failed to load other fuel types data."}
        </div>
      </StyledCard>
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
          Usage, expenditures, and quantities for other fuel types in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default OtherFuelsBarChart;
