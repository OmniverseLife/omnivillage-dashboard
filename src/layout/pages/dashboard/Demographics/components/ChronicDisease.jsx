import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Typography,
  CircularProgress,
  styled,
  Card,
  CardContent,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { getChronicDiseasePrevalence } from "../../../../../functions/demographics"; // Adjust the import path as needed

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

const ChronicDiseasePrevalenceChartComponent = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: chronicDiseaseData,
    isLoading: isChronicDiseaseLoading,
    isError: isChronicDiseaseError,
    error: chronicDiseaseError,
  } = useQuery({
    queryKey: ["demographic-chronic-disease", villageName],
    queryFn: () => getChronicDiseasePrevalence(villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (chronicDiseaseData?.data?.chronicDiseasePrevalence?.[villageName]) {
      const diseaseData =
        chronicDiseaseData.data.chronicDiseasePrevalence[villageName]?.diseases?.map((item) => ({
          name: item.diseaseNames.en,
          y: item.count,
        })) || [];

      const totalMembersWithDisease =
        chronicDiseaseData.data.chronicDiseasePrevalence[villageName]
          ?.totalMembersWithDisease || 0;

      const options = {
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          style: { fontFamily: '"Arial", sans-serif' },
        },
        title: {
          text: `Chronic Disease Prevalence (Total Cases: ${totalMembersWithDisease})`,
          align: "center",
          style: { color: "#333", fontSize: "18px", fontWeight: "bold" },
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: 10,
              style: { color: "#555", fontSize: "14px", fontWeight: "normal", textOutline: "none" },
              connectorColor: "#777",
            },
            showInLegend: true,
          },
        },
        series: [
          {
            name: "Disease",
            data: diseaseData,
            colors: ["#F44336", "#2196F3", "#FFC107", "#4CAF50", "#9C27B0", "#00BCD4"], // Example colors
          },
        ],
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { color: "#666", fontWeight: "normal", fontSize: "12px" },
          itemHoverStyle: { color: "#333" },
        },
        credits: { enabled: false },
        tooltip: {
          backgroundColor: "#FFFFFF",
          style: { color: "#333", fontSize: "13px" },
          borderWidth: 1,
          borderColor: "#DDD",
          shadow: true,
          pointFormat: "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
        },
        responsive: {
          rules: [
            {
              condition: { maxWidth: 500 },
              chartOptions: {
                legend: { align: "center", verticalAlign: "bottom", layout: "horizontal" },
                plotOptions: {
                  pie: {
                    dataLabels: { distance: 5, style: { fontSize: "10px" } },
                  },
                },
                title: { style: { fontSize: "14px" } },
              },
            },
          ],
        },
      };
      setChartOptions(options);
    } else {
      setChartOptions({
        chart: { type: "pie", backgroundColor: "transparent" },
        title: { text: "Chronic Disease Prevalence" },
        series: [{ name: "Disease", data: [] }],
        lang: { noData: "No chronic disease data available" },
        noData: { style: { fontWeight: "bold", fontSize: "16px", color: "#333333" } },
        credits: { enabled: false },
      });
    }
  }, [chronicDiseaseData, villageName]);

  if (isChronicDiseaseLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (isChronicDiseaseError) {
    return (
      <Typography color="error">
        Error: {chronicDiseaseError?.message || "Failed to load chronic disease data"}
      </Typography>
    );
  }

  return (
    <div className="chart-container" style={{ width: "100%", margin: "auto" }}>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      {chronicDiseaseData?.data?.village && (
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: Chronic Disease data for {chronicDiseaseData.data.village}
        </Typography>
      )}
    </div>
  );
};

export const ChronicDiseasePrevalenceChart = () => {
  return (
    <StyledCard
      sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4, }}
    >
      <CardContent>
        <ChronicDiseasePrevalenceChartComponent />
      </CardContent>
    </StyledCard>
  );
};

export default ChronicDiseasePrevalenceChart;