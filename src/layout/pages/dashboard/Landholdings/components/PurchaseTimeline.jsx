import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getPurchaseTimeline } from "../../../../../functions/landholdings"; // Adjust path as needed

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

const PurchaseTimelineAreaSpineChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: purchaseTimelineData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["purchase-timeline", villageName],
    queryFn: () => getPurchaseTimeline(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (purchaseTimelineData?.result && Array.isArray(purchaseTimelineData.result)) {
      const years = purchaseTimelineData.result.map((item) => item.year);
      const totalAreas = purchaseTimelineData.result.map((item) => item.totalLandArea);
      const counts = purchaseTimelineData.result.map((item) => item.count);

      setChartOptions({
        chart: {
          zoomType: "x",
          backgroundColor: "transparent",
        },
        title: {
          text: `Land Purchase Timeline in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: years,
          title: {
            text: "Year",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: [
          {
            // Primary yAxis for Total Land Area
            labels: {
              format: "{value} sq. ft.",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            title: {
              text: "Total Land Area",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            opposite: false,
          },
          {
            // Secondary yAxis for Count
            labels: {
              format: "{value} purchases",
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            title: {
              text: "Number of Purchases",
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            opposite: true,
          },
        ],
        tooltip: {
          shared: true,
        },
        series: [
          {
            name: "Total Land Area",
            type: "areaspline",
            data: totalAreas,
            color: Highcharts.getOptions().colors[0],
            yAxis: 0,
            tooltip: {
              valueSuffix: " sq. ft.",
            },
          },
          {
            name: "Number of Purchases",
            type: "spline",
            data: counts,
            color: Highcharts.getOptions().colors[1],
            yAxis: 1,
            marker: {
              enabled: false,
            },
            tooltip: {
              valueSuffix: " purchases",
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
          zoomType: "x",
          backgroundColor: "transparent",
        },
        title: {
          text: `Land Purchase Timeline in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Year",
          },
        },
        yAxis: [
          {
            title: {
              text: "Total Land Area (sq. ft.)",
            },
            opposite: false,
          },
          {
            title: {
              text: "Number of Purchases",
            },
            opposite: true,
          },
        ],
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No purchase timeline data available.",
        },
      });
    }
  }, [purchaseTimelineData, villageName]);

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
        Error: {error?.message || "Failed to load purchase timeline data."}
      </div>
    );
  }

  if (!purchaseTimelineData?.result || purchaseTimelineData.result.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        No purchase timeline data available.
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
          Timeline of land purchases in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default PurchaseTimelineAreaSpineChart;