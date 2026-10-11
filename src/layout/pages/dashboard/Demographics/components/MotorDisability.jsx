import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Button,
  Typography,
  CircularProgress,
  styled,
  Card,
  CardContent,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { getMotorDisabilityPrevalenceByVillageAndOptionalGender } from "../../../../../functions/demographics"; // Adjust the import path as needed

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

const MotorDisabilityPrevalenceChartComponent = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [selectedGender, setSelectedGender] = useState("female");
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: motorDisabilityData,
    isLoading: isMotorDisabilityLoading,
    isError: isMotorDisabilityError,
    error: motorDisabilityError,
    refetch,
  } = useQuery({
    queryKey: ["demographic-motor-disability", villageName, selectedGender],
    queryFn: () =>
      getMotorDisabilityPrevalenceByVillageAndOptionalGender(
        villageName,
        selectedGender
      ),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (motorDisabilityData?.data?.motorDisabilityPrevalence?.[villageName]) {
      const disabilityData =
        motorDisabilityData.data.motorDisabilityPrevalence[villageName][
          selectedGender
        ]?.disabilities?.map((item) => ({
          name: item.name.en,
          y: item.count,
        })) || [];

      const totalMembers =
        motorDisabilityData.data.motorDisabilityPrevalence[villageName][
          selectedGender
        ]?.totalMembers || 0;

      const options = {
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          style: { fontFamily: '"Arial", sans-serif' },
        },
        title: {
          text: `Motor Disability Prevalence for ${selectedGender} (Total: ${totalMembers})`,
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
            name: "Disability",
            data: disabilityData,
            colors: ["#4CAF50", "#F44336", "#2196F3", "#FFC107"], // Example colors
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
        title: { text: `Motor Disability Prevalence for ${selectedGender}` },
        series: [{ name: "Disability", data: [] }],
        lang: { noData: "No motor disability data available" },
        noData: { style: { fontWeight: "bold", fontSize: "16px", color: "#333333" } },
        credits: { enabled: false },
      });
    }
  }, [motorDisabilityData, selectedGender, villageName]);

  if (isMotorDisabilityLoading) {
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

  if (isMotorDisabilityError) {
    return (
      <Typography color="error">
        Error: {motorDisabilityError?.message || "Failed to load motor disability data"}
      </Typography>
    );
  }

 

  const handleGenderToggle = (gender) => {
    setSelectedGender(gender);
  };

  return (
    <div className="chart-container" style={{ width: "100%", margin: "auto" }}>
      { (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <Button
            variant={selectedGender === "female" ? "contained" : "outlined"}
            onClick={() => handleGenderToggle("female")}
            style={{ marginRight: "0.5rem" }}
          >
            Female
          </Button>
          <Button
            variant={selectedGender === "male" ? "contained" : "outlined"}
            onClick={() => handleGenderToggle("male")}
          >
            Male
          </Button>
        </div>
      )}
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      {motorDisabilityData?.data?.village && (
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: Motor Disability data for {motorDisabilityData.data.village}
        </Typography>
      )}
    </div>
  );
};

export const MotorDisabilityPrevalenceChart = () => {
  return (
    <StyledCard
      sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4 }}
    >
      <CardContent>
        <MotorDisabilityPrevalenceChartComponent />
      </CardContent>
    </StyledCard>
  );
};

export default MotorDisabilityPrevalenceChart;