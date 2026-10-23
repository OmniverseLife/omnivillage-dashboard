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

import { getIncomeRangeByAgeAndOptionalGender } from "../../../../../functions/demographics";
import { useSearchParams } from "react-router-dom";

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

const IncomeRangeBarChartComponent = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [selectedGender, setSelectedGender] = useState("female");
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: incomeRangeData,
    isLoading: isIncomeRangeLoading,
    isError: isIncomeRangeError,
    error: incomeRangeError,
    refetch,
  } = useQuery({
    queryKey: ["demographic-income-range", villageName, selectedGender],
    queryFn: () =>
      getIncomeRangeByAgeAndOptionalGender(villageName, selectedGender),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (incomeRangeData?.data?.incomeRangeValues) {
      const incomeData =
        incomeRangeData.data.incomeRangeValues?.[villageName]?.[
          selectedGender
        ]?.incomeRanges?.map((item) => ({
          name: item.names.en,
          y: item.count,
        })) || [];

      const options = {
        chart: {
          type: "bar",
          backgroundColor: "transparent",
          style: { fontFamily: '"Arial", sans-serif' },
        },
        title: {
          text: `Income Range Distribution for ${selectedGender}`,
          align: "center",
          style: { color: "#333", fontSize: "18px", fontWeight: "bold" },
        },
        xAxis: {
          categories: incomeData.map((item) => item.name),
          title: { text: "Income Range", style: { color: "#555" } },
          labels: { style: { color: "#666" } },
        },
        yAxis: {
          title: { text: "Number of People", style: { color: "#555" } },
          labels: { style: { color: "#666" } },
          gridLineColor: "#e0e0e0",
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              style: {
                color: "#333",
                fontWeight: "normal",
                fontSize: "12px",
                textOutline: "none",
              },
            },
          },
        },
        series: [
          { name: "Number of People", data: incomeData, color: "#2196F3" },
        ],
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
          backgroundColor: "#FFFFFF",
          style: { color: "#333", fontSize: "13px" },
          borderWidth: 1,
          borderColor: "#DDD",
          shadow: true,
          pointFormat: "<b>{point.name}</b>: {point.y}",
        },
        responsive: {
          rules: [
            {
              condition: { maxWidth: 600 },
              chartOptions: {
                xAxis: {
                  labels: { rotation: -45, style: { fontSize: "10px" } },
                },
                title: { style: { fontSize: "16px" } },
              },
            },
          ],
        },
      };
      setChartOptions(options);
    } else {
      setChartOptions({
        chart: { type: "bar", backgroundColor: "transparent" },
        title: { text: `Income Range Distribution for ${selectedGender}` },
        xAxis: { categories: [], title: { text: "Income Range" } },
        yAxis: { title: { text: "Number of People" } },
        series: [{ name: "Number of People", data: [] }],
        lang: { noData: "No income range data available" },
        noData: {
          style: { fontWeight: "bold", fontSize: "16px", color: "#333333" },
        },
        credits: { enabled: false },
      });
    }
  }, [incomeRangeData, selectedGender]);

  if (isIncomeRangeLoading) {
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

  if (isIncomeRangeError) {
    return (
      <Typography color="error">
        Error: {incomeRangeError?.message || "Failed to load income range data"}
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
      {incomeRangeData?.data?.village && (
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: Income Range data for {incomeRangeData.data.village}
        </Typography>
      )}
    </div>
  );
};

export const IncomeRangeBarChart = ({ villageName }) => {
  return (
    <StyledCard
      sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4 }}
    >
      <CardContent>
        <IncomeRangeBarChartComponent villageName={villageName} />
      </CardContent>
    </StyledCard>
  );
};

export default IncomeRangeBarChart;
