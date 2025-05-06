import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  styled,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getUtilisationStatus } from "../../../../../functions/landholdings"; // Import the getUtilisationStatus function

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: "2rem",
  boxShadow: theme.shadows[5],
  borderRadius: theme.spacing(2),
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[10],
    transform: "translateY(-4px)",
  },
  border: "1px solid #e0e0e0",
}));

const StyledCardTitle = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(2),
  color: "#333",
  textAlign: "center",
}));

const COLORS = ["#0088FE", "#82ca9d", "#FFBB28"]; // Define colors for the pie chart slices

const LandUtilisationPieChart = () => {
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const country = searchParams.get("country");

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["landUtilisationStatus", villageName, country],
    queryFn: () => getUtilisationStatus(villageName, country), // Use the getUtilisationStatus function
    enabled: !!villageName && !!country,
  });

  if (isLoading) {
    return (
      <StyledCard>
        <CardContent
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </CardContent>
      </StyledCard>
    );
  }

  if (isError) {
    return (
      <StyledCard>
        <CardContent>
          <Typography color="error">
            Error: {error?.message || "Failed to load land utilisation data"}
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  // Prepare data for the pie chart.  Use ternary operator to handle undefined
  const pieData = response
    ? [
        { name: "Utilized", value: response.utilized },
        { name: "Unutilized", value: response.unutilized },
        { name: "Total", value: response.total }, // Include total if needed
      ]
    : [];

  return (
    <StyledCard>
      <CardContent>
        <StyledCardTitle>Land Utilisation Status (sqft)</StyledCardTitle>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              innerRadius={65} // Added innerRadius to make it a donut chart
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) + 25; // Adjusted radius for donut
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                const labelText = `${pieData[index].name} ${(
                  (pieData[index].value / response.total) *
                  100
                ).toFixed(2)}%`;
                return (
                  <text
                    x={x}
                    y={y}
                    fill={COLORS[index % COLORS.length]}
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                  >
                    {labelText}
                  </text>
                );
              }}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderColor: "#ddd",
                borderRadius: 8,
              }}
              labelStyle={{ fontWeight: "bold", color: "#222" }}
              itemStyle={{ color: "#333" }}
              formatter={(value) => value.toLocaleString()}
            />

            <Legend formatter={(value) => value.replace(/ \(.+\)$/, "")} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </StyledCard>
  );
};

export default LandUtilisationPieChart;
