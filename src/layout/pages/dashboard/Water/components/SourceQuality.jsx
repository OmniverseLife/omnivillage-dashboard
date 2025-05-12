import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsHeatmap from "highcharts/modules/heatmap";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getSourceQuality } from "../../../../../functions/housingAndWater"; // Adjust path as needed

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

const SourceQualityHeatmap = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: sourceQualityData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["source-quality-data", villageName],
    queryFn: () => getSourceQuality(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (sourceQualityData?.data && Array.isArray(sourceQualityData.data)) {
      const waterSources = sourceQualityData.data.map((item) => item.source);
      const allQualities = [
        ...new Set(
          sourceQualityData.data.flatMap((item) => item.qualities.map((q) => q.quality))
        ),
      ];

      const heatmapData = [];

      waterSources.forEach((source, y) => {
        const sourceData = sourceQualityData.data.find((item) => item.source === source);
        if (sourceData) {
          allQualities.forEach((quality, x) => {
            const qualityInfo = sourceData.qualities.find((q) => q.quality === quality);
            heatmapData.push([x, y, qualityInfo ? qualityInfo.count : 0]);
          });
        }
      });

      setChartOptions({
        chart: {
          type: "heatmap",
          backgroundColor: "transparent",
        },
        title: {
          text: `Water Source Quality in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: allQualities,
          title: {
            text: "Quality",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          categories: waterSources,
          title: {
            text: "Water Source",
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
            return `<b>${this.series.xAxis.categories[this.point.x]}</b> for <b>${
              this.series.yAxis.categories[this.point.y]
            }</b>: ${this.point.value} houses`;
          },
        },
        series: [
          {
            name: "Water Source Quality",
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
          text: `Water Source Quality in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Quality",
          },
        },
        yAxis: {
          categories: [],
          title: {
            text: "Water Source",
          },
        },
        colorAxis: {
          min: 0,
          minColor: "#ffffff",
          maxColor: Highcharts.getOptions().colors[0],
        },
        series: [
          {
            name: "Water Source Quality",
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
          text: "No water source quality data available.",
        },
      });
    }
  }, [sourceQualityData, villageName]);

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
        Error: {error?.message || "Failed to load water source quality data."}
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
          Quality of water sources used by households in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default SourceQualityHeatmap;