import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getRenovationUrgency } from "../../../../../functions/housingAndWater";

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

const RenovationUrgencyColumnChartWithArea = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: renovationUrgencyData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["renovation-urgency", villageName],
    queryFn: () => getRenovationUrgency(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (
      renovationUrgencyData?.data &&
      Array.isArray(renovationUrgencyData.data)
    ) {
      // Group by renovation urgency and calculate counts and total built area
      const urgencyData = renovationUrgencyData.data.reduce((acc, curr) => {
        const urgency = curr.renovationUrgency?.en;
        if (!acc[urgency]) {
          acc[urgency] = { count: 0, totalBuiltArea: 0 };
        }
        acc[urgency].count++;
        acc[urgency].totalBuiltArea += curr?.builtArea;
        return acc;
      }, {});

      const categories = Object.keys(urgencyData);
      const counts = Object.values(urgencyData).map((item) => item.count);
      const totalAreas = Object.values(urgencyData).map(
        (item) => item.totalBuiltArea
      );

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Renovation Urgency in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Renovation Urgency",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: [
          {
            title: {
              text: "Number of Houses",
              style: {
                color: "#4572A7",
              },
            },
            labels: {
              style: {
                color: "#4572A7",
              },
            },
            opposite: false,
          },
          {
            title: {
              text: "Total Built Area (sq. ft.)",
              style: {
                color: "#AA4643",
              },
            },
            labels: {
              style: {
                color: "#AA4643",
              },
              format: "{value} sq. ft.",
            },
            opposite: true,
          },
        ],
        tooltip: {
          shared: true,
        },
        series: [
          {
            name: "Number of Houses",
            data: counts,
            color: "#4572A7",
            tooltip: {
              valueSuffix: " houses",
            },
          },
          {
            name: "Total Built Area",
            data: totalAreas,
            color: "#AA4643",
            yAxis: 1,
            tooltip: {
              valueSuffix: " sq. ft.",
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
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Renovation Urgency in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Renovation Urgency",
          },
        },
        yAxis: [
          {
            title: {
              text: "Number of Houses",
            },
            opposite: false,
          },
          {
            title: {
              text: "Total Built Area (sq. ft.)",
            },
            opposite: true,
          },
        ],
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No renovation urgency data available.",
        },
      });
    }
  }, [renovationUrgencyData, villageName]);

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
        Error: {error?.message || "Failed to load renovation urgency data."}
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
          Number of houses and total built area by renovation urgency in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default RenovationUrgencyColumnChartWithArea;
