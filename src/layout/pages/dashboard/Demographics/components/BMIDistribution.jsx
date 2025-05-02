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

import { getBMIDistributionByVillageAndOptionalGender } from "../../../../../functions/demographics"; // Adjust the import path as needed

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

const BMIDistributionChartComponent = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [selectedGender, setSelectedGender] = useState("male");
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: bmiData,
    isLoading: isBmiLoading,
    isError: isBmiError,
    error: bmiError,
    refetch,
  } = useQuery({
    queryKey: ["demographic-bmi-distribution", villageName, selectedGender],
    queryFn: () =>
      getBMIDistributionByVillageAndOptionalGender(villageName, selectedGender),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (bmiData?.data?.bmiDistribution?.[selectedGender]?.bmiValues) {
      const bmiValues = bmiData.data.bmiDistribution[selectedGender].bmiValues;

      // Create bins for the histogram
      const binSize = 5;
      const bins = {};
      let minBmi = Infinity;
      let maxBmi = -Infinity;

      bmiValues.forEach((bmi) => {
        minBmi = Math.min(minBmi, bmi);
        maxBmi = Math.max(maxBmi, bmi);
        const binStart = Math.floor(bmi / binSize) * binSize;
        const binEnd = binStart + binSize;
        const binLabel = `${binStart}-${binEnd}`;
        bins[binLabel] = (bins[binLabel] || 0) + 1;
      });

      const histogramData = Object.entries(bins)
        .sort((a, b) => {
          const numA = parseInt(a[0].split("-")[0]);
          const numB = parseInt(b[0].split("-")[0]);
          return numA - numB;
        })
        .map(([bin, count]) => {
          const binStartVal = parseInt(bin.split("-")[0]);
          let color = "#546E7A"; // Default color
          if (binStartVal < 16) {
            color = "#FF8A65"; // Severe Thinness
          } else if (binStartVal >= 16 && binStartVal < 17) {
            color = "#FDD835"; // Moderate Thinness
          } else if (binStartVal >= 17 && binStartVal < 18.5) {
            color = "#AED581"; // Mild Thinness
          } else if (binStartVal >= 18.5 && binStartVal < 25) {
            color = "#4CAF50"; // Normal
          } else if (binStartVal >= 25 && binStartVal < 30) {
            color = "#FFB300"; // Overweight
          } else if (binStartVal >= 30 && binStartVal < 35) {
            color = "#F4511E"; // Obese Class I
          } else if (binStartVal >= 35 && binStartVal < 40) {
            color = "#E64A19"; // Obese Class II
          } else if (binStartVal >= 40) {
            color = "#BF360C"; // Obese Class III
          }
          return {
            name: bin,
            y: count,
            color: color,
          };
        });

      const options = {
        chart: {
          type: "column",
          backgroundColor: "transparent",
          style: { fontFamily: '"Arial", sans-serif' },
        },
        title: {
          text: `BMI Distribution (${selectedGender})`,
          align: "center",
          style: { color: "#333", fontSize: "18px", fontWeight: "bold" },
        },
        xAxis: {
          categories: histogramData.map((item) => item.name),
          title: { text: "BMI Range", style: { color: "#555" } },
          labels: { style: { color: "#666" } },
        },
        yAxis: {
          title: { text: "Number of People", style: { color: "#555" } },
          labels: { style: { color: "#666" } },
          gridLineColor: "#e0e0e0",
        },
        series: [
          {
            name: "Number of People",
            data: histogramData.map((item) => ({
              name: item.name,
              y: item.y,
              color: item.color, // Use the color from the mapping
            })),
          },
        ],
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
          headerFormat:
            '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style="color:{point.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
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
        chart: { type: "column", backgroundColor: "transparent" },
        title: { text: `BMI Distribution (${selectedGender})` },
        xAxis: { categories: [], title: { text: "BMI Range" } },
        yAxis: { title: { text: "Number of People" } },
        series: [{ name: "Number of People", data: [] }],
        lang: { noData: "No BMI distribution data available" },
        noData: {
          style: { fontWeight: "bold", fontSize: "16px", color: "#333333" },
        },
        credits: { enabled: false },
      });
    }
  }, [bmiData, selectedGender, villageName]);

  if (isBmiLoading) {
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

  if (isBmiError) {
    return (
      <Typography color="error">
        Error: {bmiError?.message || "Failed to load BMI distribution data"}
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
      {bmiData?.data?.village && (
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: BMI Distribution data for {bmiData.data.village}
        </Typography>
      )}
    </div>
  );
};

export const BMIDistributionChart = () => {
  return (
    <StyledCard
      sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4 }}
    >
      <CardContent>
        <BMIDistributionChartComponent />
      </CardContent>
    </StyledCard>
  );
};

export default BMIDistributionChart;
