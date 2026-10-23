import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getSavingsAndInvestments } from "../../../../../functions/demographics";

// Styled card for consistent UI
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

const SavingsAndInvestmentsChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: savingsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["finance-savings-investments", villageName],
    queryFn: () => getSavingsAndInvestments(villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (savingsData?.data) {
      const { bankAccountPercentage, savingsPercentage, averageSavingsAmount } =
        savingsData.data;

      const chartData = [
        {
          name: "Bank Account",
          y: parseFloat(bankAccountPercentage),
          color: "#4CAF50",
        },
        {
          name: "Other Savings",
          y: parseFloat(savingsPercentage),
          color: "#2196F3",
        },
        {
          name: "No Savings",
          y:
            100 -
            (parseFloat(bankAccountPercentage) + parseFloat(savingsPercentage)),
          color: "#F44336",
        },
      ];

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `Savings & Investments in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        plotOptions: {
          pie: {
            innerSize: "60%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              style: {
                fontSize: "13px",
                color: "#333",
              },
            },
            showInLegend: true,
          },
        },
        tooltip: {
          pointFormat: "<b>{point.name}</b>: {point.y:.1f}%",
        },
        series: [
          {
            name: "Savings",
            data: chartData,
          },
        ],
        credits: {
          enabled: false,
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: {
            fontSize: "12px",
            color: "#666",
          },
        },
      });
    }
  }, [savingsData, villageName]);

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
        Error: {error?.message || "Failed to load savings data."}
      </div>
    );
  }

  if (!savingsData?.data) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        No savings data available.
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
          Avg. Savings Amount: <span style={{fontWeight:"700"}}>₹{parseFloat(savingsData.data.averageSavingsAmount).toLocaleString()}</span>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default SavingsAndInvestmentsChart;
