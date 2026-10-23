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
import { getDeclarationVsUse } from "../../../../../functions/landholdings"; // Adjust path as needed

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

const DeclarationVsUseScatterChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: declarationVsUseData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["declaration-vs-use", villageName],
    queryFn: () => getDeclarationVsUse(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (declarationVsUseData?.result && Array.isArray(declarationVsUseData.result)) {
      const scatterData = declarationVsUseData.result.map((item) => ({
        x: item.totalLandDeclared,
        y: item.totalLandUsed,
        geotag: item.geotag, // Include geotag for tooltip
      }));

      setChartOptions({
        chart: {
          type: "scatter",
          zoomType: "xy",
          backgroundColor: "transparent",
        },
        title: {
          text: `Declared vs. Used Land in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          title: {
            text: "Total Land Declared (sq. ft.)",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Total Land Used (sq. ft.)",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          pointFormat:
            "Declared: <b>{point.x} sq. ft.</b><br/>" +
            "Used: <b>{point.y} sq. ft.</b><br/>" +
            "Geotag: {point.geotag}",
        },
        series: [
          {
            name: "Land Parcels",
            data: scatterData,
            marker: {
              radius: 5,
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
          type: "scatter",
          zoomType: "xy",
          backgroundColor: "transparent",
        },
        title: {
          text: `Declared vs. Used Land in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          title: {
            text: "Total Land Declared (sq. ft.)",
          },
        },
        yAxis: {
          title: {
            text: "Total Land Used (sq. ft.)",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No declared vs. used land data available.",
        },
      });
    }
  }, [declarationVsUseData, villageName]);

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
        Error: {error?.message || "Failed to load declared vs. used land data."}
      </div>
    );
  }

  if (!declarationVsUseData?.result || declarationVsUseData.result.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        No declared vs. used land data available.
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
          Comparison of declared vs. used land area for parcels in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default DeclarationVsUseScatterChart;