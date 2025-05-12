import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getBuiltRenovated } from "../../../../../functions/housingAndWater";

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

const BuiltRenovatedLineChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: builtRenovatedData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["built-renovated-data", villageName],
    queryFn: () => getBuiltRenovated(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (builtRenovatedData?.data && Array.isArray(builtRenovatedData.data)) {
      const builtCounts = {};
      const renovatedCounts = {};

      builtRenovatedData.data.forEach((item) => {
        if (item.type === "Built") {
          builtCounts[item.year] = (builtCounts[item.year] || 0) + 1;
        } else if (item.type === "Renovated") {
          renovatedCounts[item.year] = (renovatedCounts[item.year] || 0) + 1;
        }
      });

      const allYears = Object.keys({
        ...builtCounts,
        ...renovatedCounts,
      }).sort();
      const builtSeriesData = allYears.map((year) => builtCounts[year] || 0);
      const renovatedSeriesData = allYears.map(
        (year) => renovatedCounts[year] || 0
      );

      setChartOptions({
        chart: {
          type: "line",
          backgroundColor: "transparent",
        },
        title: {
          text: `Houses Built and Renovated Over Time in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: allYears,
          title: {
            text: "Year",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Number of Houses",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          shared: true,
        },
        series: [
          {
            name: "Built",
            data: builtSeriesData,
            color: "#4572A7",
          },
          {
            name: "Renovated",
            data: renovatedSeriesData,
            color: "#AA4643",
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "line",
          backgroundColor: "transparent",
        },
        title: {
          text: `Houses Built and Renovated Over Time in ${villageName}`,
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
        yAxis: {
          title: {
            text: "Number of Houses",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No built/renovated data available.",
        },
      });
    }
  }, [builtRenovatedData, villageName]);

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
        Error: {error?.message || "Failed to load built/renovated data."}
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
          Number of houses built and renovated per year in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default BuiltRenovatedLineChart;
