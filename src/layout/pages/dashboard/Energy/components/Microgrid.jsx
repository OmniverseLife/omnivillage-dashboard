import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getMicroGridUsage } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const MicroGridUsageChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: microGridUsageData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["microgrid-usage-data", villageName],
    queryFn: () => getMicroGridUsage(countryName, villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (microGridUsageData?.data && Array.isArray(microGridUsageData.data)) {
      const categories = microGridUsageData.data.map((item) =>
        item.microgridType.en.replace(/_/g, " ")
      );

      const seriesData = microGridUsageData.data.map((item) => ({
        y: item.totalMicrogrids,
        totalInstallationCost: item.totalInstallationCost,
        averageInstallationCost: item.averageInstallationCost,
        usageBreakdown: item.usageBreakdown,
      }));

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Microgrid Usage in ${villageName}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Microgrid Type",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Number of Microgrids",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
          min: 0,
          allowDecimals: false,
        },
        tooltip: {
          formatter: function () {
            const point = this.point;
            let tooltipContent = `<b>${point.category} Microgrids</b><br/>`;
            tooltipContent += `Total Microgrids: <b>${point.y}</b><br/>`;
            tooltipContent += `Total Installation Cost: <b>₹${point.totalInstallationCost}</b><br/>`;
            tooltipContent += `Average Installation Cost: <b>₹${point.averageInstallationCost.toFixed(
              2
            )}</b><br/><br/>`;

            if (point.usageBreakdown && point.usageBreakdown.length > 0) {
              tooltipContent += "<b>Usage Breakdown:</b><br/>";
              point.usageBreakdown.forEach((usageItem) => {
                tooltipContent += `- ${usageItem.count} households with ${usageItem.usage} usage<br/>`;
              });
            } else {
              tooltipContent += "No specific usage breakdown available.<br/>";
            }
            return tooltipContent;
          },
          shared: false, // Ensure individual point tooltips
          useHTML: true, // Allows HTML formatting in tooltip
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              format: "{point.y}", // Show the count on the bar
              style: {
                fontWeight: "bold",
                color: "black",
              },
            },
          },
        },
        series: [
          {
            name: "Total Microgrids",
            data: seriesData,
            color: "#4CAF50", // A suitable color for energy infrastructure
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
          text: `Microgrid Usage in ${villageName}`,
          align: "left",
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Microgrid Type",
          },
        },
        yAxis: {
          title: {
            text: "Number of Microgrids",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No microgrid usage data available.",
        },
      });
    }
  }, [microGridUsageData, villageName]);

  if (isLoading) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <CircularProgress />
        </div>
      </StyledCard>
    );
  }

  if (isError) {
    return (
      <div style={{ color: "red", padding: 16 }}>
        Error: {error?.message || "Failed to load microgrid usage data."}
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
          Overview of microgrid types and usage in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default MicroGridUsageChart;
