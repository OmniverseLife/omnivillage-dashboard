import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getAmenities } from "../../../../../functions/housingAndWater";

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

const AmenitiesBarChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: amenitiesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["amenities-data", villageName],
    queryFn: () => getAmenities(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (amenitiesData?.data && Array.isArray(amenitiesData.data)) {
      const categories = amenitiesData.data.map((item) => item.amenity.en);
      const counts = amenitiesData.data.map((item) => item.count);
      const percentages = amenitiesData.data.map((item) => item.percentage);

      const chartHeight = Math.max(400, categories.length * 28);
      setChartOptions({
        chart: {
          type: "bar",
          backgroundColor: "transparent",
          height: chartHeight,
        },

        title: {
          text: `Household Amenities in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Amenity",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Percentage of Households",
          },
          labels: {
            formatter: function () {
              return this.value + "%";
            },
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          formatter: function () {
            return (
              `<b>${this.x}</b><br/>` +
              `Percentage: ${this.y.toFixed(2)}%<br/>` +
              `Count: ${counts[this.point.index]}`
            );
          },
        },
        series: [
          {
            name: "Percentage",
            data: percentages,
            color: "#8085e9",
            pointWidth: 20,
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "bar",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household Amenities in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Amenity",
          },
        },
        yAxis: {
          title: {
            text: "Percentage of Households",
          },
          labels: {
            formatter: function () {
              return this.value + "%";
            },
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No amenities data available.",
        },
      });
    }
  }, [amenitiesData, villageName]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ color: "red", padding: 16 }}>
        Error: {error?.message || "Failed to load amenities data."}
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
          Percentage of households with each amenity in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default AmenitiesBarChart;
