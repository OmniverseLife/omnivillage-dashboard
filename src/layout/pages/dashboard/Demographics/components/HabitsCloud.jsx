import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getHabitsData } from "../../../../../functions/demographics";

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

const HabitsChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: habitsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["habits-data", villageName],
    queryFn: () => getHabitsData(villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (habitsData?.data && Array.isArray(habitsData.data)) {
      const habitLabels = habitsData.data.map((item) => item.habit.en);
      const habitCounts = habitsData.data.map((item) => item.totalCount);

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Reported Habits in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: habitLabels,
          labels: {
            style: {
              fontSize: "12px",
              color: "#666",
            },
          },
          title: {
            text: "Habits",
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Number of People",
          },
        },
        tooltip: {
          useHTML: true,
          shared: true,
          formatter: function () {
            const topFeelings = this.point.options.topFeelings || [];
            const topFeelingsHTML = topFeelings
              .map(
                (f) =>
                  `<li style="margin-bottom: 4px;"><b>${f.feeling.en}</b>: ${f.count}</li>`
              )
              .join("");

            return `
      <div style="font-size:13px; line-height:1.5;">
        <div style="font-size:14px; font-weight:bold; margin-bottom:4px;">${
          this.key
        }</div>
        <div><span style="color:${this.series.color}; font-weight:bold;">${
              this.series.name
            }</span>: ${this.y} people</div>
        ${
          topFeelings.length
            ? `<div style="margin-top:6px;"><span style="color:#7cb5ec; font-weight:bold;">Top Feelings:</span><ul style="padding-left: 16px; margin: 4px 0;">${topFeelingsHTML}</ul></div>`
            : ""
        }
      </div>
    `;
          },
        },
        series: [
          {
            name: "People",
            data: habitsData.data.map((item) => ({
              y: item.totalCount,
              topFeelings: item.topFeelings,
            })),
            color: "#3f51b5",
          },
        ],
        credits: {
          enabled: false,
        },
        legend: {
          enabled: false,
        },
      });
    }
  }, [habitsData, villageName]);

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
        Error: {error?.message || "Failed to load habits data."}
      </div>
    );
  }

  if (!habitsData?.data || habitsData.data.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        No habits data available.
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
          Based on reported habits data in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default HabitsChart;
