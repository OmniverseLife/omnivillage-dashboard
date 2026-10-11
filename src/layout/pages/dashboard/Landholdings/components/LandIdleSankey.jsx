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
import { getIdleLandReasonSankey } from "../../../../../functions/landholdings"; // Adjust path as needed

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

const IdleLandReasonChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: idleLandData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["idle-land-reasons", villageName],
    queryFn: () => getIdleLandReasonSankey(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (idleLandData?.result && Array.isArray(idleLandData.result)) {
      const reasons = idleLandData.result.map((item) => item.idle_purpose_name.en);
      const landAreas = idleLandData.result.map((item) => item.totalLandArea);

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Idle Land Area by Reason in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: reasons,
          labels: {
            style: {
              fontSize: "12px",
              color: "#666",
            },
          },
          title: {
            text: "Reason for Idle Land",
          },
        },
        yAxis: {
          title: {
            text: "Total Land Area (sq. ft.)",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          valueSuffix: " sq. ft.",
        },
        series: [
          {
            name: "Land Area",
            data: landAreas,
            color: "#8085e9",
          },
        ],
        credits: {
          enabled: false,
        },
        legend: {
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
          text: `Idle Land Area by Reason in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Reason for Idle Land",
          },
        },
        yAxis: {
          title: {
            text: "Total Land Area (sq. ft.)",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No idle land reason data available.",
        },
      });
    }
  }, [idleLandData, villageName]);

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
        Error: {error?.message || "Failed to load idle land reasons data."}
      </div>
    );
  }

  if (!idleLandData?.result || idleLandData.result.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        No idle land reasons data available.
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
          Total idle land area by reason in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default IdleLandReasonChart;