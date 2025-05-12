import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getWaterConsumption } from "../../../../../functions/housingAndWater";

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

const WaterConsumptionHistogram = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: waterConsumptionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["water-consumption-data", villageName],
    queryFn: () => getWaterConsumption(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (
      waterConsumptionData?.data &&
      Array.isArray(waterConsumptionData.data)
    ) {
      // Group data by consumption range
      const consumptionCounts = waterConsumptionData.data.reduce(
        (acc, curr) => {
          const range = curr.consumptionRange.en;
          acc[range] = (acc[range] || 0) + curr.count;
          return acc;
        },
        {}
      );

      const categories = Object.keys(consumptionCounts);
      const data = Object.values(consumptionCounts);

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Water Consumption Patterns in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Consumption Range",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Number of Households",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          valueSuffix: " households",
          headerFormat:
            '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
        },
        series: [
          {
            name: "Number of Households",
            data: data,
            color: "#434348",
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
          text: `Water Consumption Patterns in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Consumption Range",
          },
        },
        yAxis: {
          title: {
            text: "Number of Households",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No water consumption data available.",
        },
      });
    }
  }, [waterConsumptionData, villageName]);

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
        Error: {error?.message || "Failed to load water consumption data."}
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
          Distribution of household water consumption in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default WaterConsumptionHistogram;
