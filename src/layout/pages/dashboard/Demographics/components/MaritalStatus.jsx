import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getMaritalStatusByVillage } from "../../../../../functions/demographics";

// Styled Card for better UI
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

const MaritalStatusChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: maritalStatusData,
    isLoading: isMaritalStatusLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["demographic-marital-status", villageName],
    queryFn: () => getMaritalStatusByVillage(villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (maritalStatusData?.data?.maritalStatusCounts) {
      const chartSeriesData = Object.entries(
        maritalStatusData.data.maritalStatusCounts
      ).map(([status, count]) => ({
        name: status,
        y: count,
      }));

      const options = {
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          style: {
            fontFamily: '"Arial", sans-serif',
          },
        },
        title: {
          text: `Marital Status in ${maritalStatusData.data.village}`,
          align: "center",
          style: {
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
          },
        },
        plotOptions: {
          pie: {
            innerSize: "50%",
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: 10,
              style: {
                color: "#555",
                fontSize: "14px",
                fontWeight: "normal",
                textOutline: "none",
              },
              connectorColor: "#777",
            },
            showInLegend: true,
          },
        },
        series: [
          {
            name: "Marital Status",
            data: chartSeriesData,
            colors: ["#4CAF50", "#2196F3", "#FFC107", "#F44336"],
          },
        ],
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: {
            color: "#666",
            fontWeight: "normal",
            fontSize: "12px",
          },
          itemHoverStyle: {
            color: "#333",
          },
        },
        credits: {
          enabled: false,
        },
        tooltip: {
          backgroundColor: "#FFFFFF",
          style: {
            color: "#333",
            fontSize: "13px",
          },
          borderWidth: 1,
          borderColor: "#DDD",
          shadow: true,
          pointFormat:
            "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  align: "center",
                  verticalAlign: "bottom",
                  layout: "horizontal",
                },
                plotOptions: {
                  pie: {
                    dataLabels: {
                      distance: 5,
                      style: {
                        fontSize: "10px",
                      },
                    },
                  },
                },
                title: {
                  style: {
                    fontSize: "14px",
                  },
                },
              },
            },
          ],
        },
      };
      setChartOptions(options);
    }
  }, [maritalStatusData]);

  if (isMaritalStatusLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ color: "red", padding: "16px" }}>
        Error: {error?.message || "Failed to load marital status data."}
      </div>
    );
  }

  if (!maritalStatusData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        No data available.
      </div>
    );
  }

  return (
    <StyledCard
      sx={{
        width: "100%",
        marginX: "auto",
        padding: "20px",
        paddingTop:"72px",
        marginTop: 4,
      }}
    >
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: Data is based on {maritalStatusData.data.village}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default MaritalStatusChart;
