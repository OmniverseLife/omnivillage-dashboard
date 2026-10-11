import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getSourceExpense } from "../../../../../functions/housingAndWater"; // Adjust path as needed

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

const SourceExpenseLineChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: sourceExpenseData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["source-expense-data", villageName],
    queryFn: () => getSourceExpense(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (sourceExpenseData?.data && Array.isArray(sourceExpenseData.data)) {
      const sources = sourceExpenseData.data.map((item) => item.source);
      const expenses = sourceExpenseData.data.map((item) => item.averageExpense);

      setChartOptions({
        chart: {
          type: "line",
          backgroundColor: "transparent",
        },
        title: {
          text: `Average Expense per Water Source in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: sources,
          title: {
            text: "Water Source",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Average Expense",
          },
          labels: {
            style: {
              color: "#666",
            },
            formatter: function () {
              return `₹${this.value}`; // Assuming currency is INR, adjust if needed
            },
          },
        },
        tooltip: {
          valuePrefix: "₹", // Assuming currency is INR, adjust if needed
          valueSuffix: " per household",
        },
        series: [
          {
            name: "Average Expense",
            data: expenses,
            color: "#2f7ed8",
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
          text: `Average Expense per Water Source in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Water Source",
          },
        },
        yAxis: {
          title: {
            text: "Average Expense",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No water source expense data available.",
        },
      });
    }
  }, [sourceExpenseData, villageName]);

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
        Error: {error?.message || "Failed to load water source expense data."}
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
          Average household expense per water source in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default SourceExpenseLineChart;