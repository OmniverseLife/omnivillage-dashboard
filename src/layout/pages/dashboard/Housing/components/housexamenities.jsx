import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsHeatmap from "highcharts/modules/heatmap";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getAmenitiesHeatmap } from "../../../../../functions/housingAndWater";

// Initialize Highcharts Heatmap module
if (typeof Highcharts === "object") {
  HighchartsHeatmap(Highcharts);
}

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

const AmenitiesHeatmap = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: amenitiesHeatmapData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["amenities-heatmap-data", villageName],
    queryFn: () => getAmenitiesHeatmap(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (
      amenitiesHeatmapData?.data &&
      Array.isArray(amenitiesHeatmapData.data)
    ) {
      const houseTypes = [
        ...new Set(amenitiesHeatmapData.data.map((item) => item.houseType.en)),
      ];
      const allAmenities = [
        ...new Set(
          amenitiesHeatmapData.data.flatMap((item) =>
            item.amenities.map((a) => a.amenity.en)
          )
        ),
      ];

      const heatmapData = [];

      houseTypes.forEach((houseType, y) => {
        const houseTypeData = amenitiesHeatmapData.data.find(
          (item) => item.houseType.en === houseType
        );
        if (houseTypeData) {
          allAmenities.forEach((amenity, x) => {
            const amenityInfo = houseTypeData.amenities.find(
              (a) => a.amenity.en === amenity
            );
            heatmapData.push([x, y, amenityInfo ? amenityInfo.count : 0]);
          });
        }
      });

      setChartOptions({
        chart: {
          type: "heatmap",
          backgroundColor: "transparent",
        },
        title: {
          text: `Amenities by House Type in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: allAmenities,
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
          categories: houseTypes,
          title: {
            text: "House Type",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        colorAxis: {
          min: 0,
          minColor: "#ffffff",
          maxColor: Highcharts.getOptions().colors[0],
        },
        legend: {
          align: "right",
          layout: "vertical",
          margin: 0,
          verticalAlign: "top",
          y: 25,
          symbolHeight: 280,
        },
        tooltip: {
          formatter: function () {
            return `<b>${
              this.series.xAxis.categories[this.point.x]
            }</b> in <b>${this.series.yAxis.categories[this.point.y]}</b>: ${
              this.point.value
            } houses`;
          },
        },
        series: [
          {
            name: "Amenities by House Type",
            data: heatmapData,
            dataLabels: {
              enabled: true,
              color: "#000000",
            },
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "heatmap",
          backgroundColor: "transparent",
        },
        title: {
          text: `Amenities by House Type in ${villageName}`,
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
          categories: [],
          title: {
            text: "House Type",
          },
        },
        colorAxis: {
          min: 0,
          minColor: "#ffffff",
          maxColor: Highcharts.getOptions().colors[0],
        },
        series: [
          {
            name: "Amenities by House Type",
            data: [],
            dataLabels: {
              enabled: true,
              color: "#000000",
            },
          },
        ],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No amenities heatmap data available.",
        },
      });
    }
  }, [amenitiesHeatmapData, villageName]);

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
        Error: {error?.message || "Failed to load amenities heatmap data."}
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
          Number of houses with each amenity, by house type in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default AmenitiesHeatmap;
