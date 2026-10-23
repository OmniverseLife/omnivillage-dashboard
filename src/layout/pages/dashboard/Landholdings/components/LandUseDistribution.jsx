import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  styled,
  Grid,
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
import { getLandUseDistribution } from "../../../../../functions/landholdings";

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

const COLORS = ["#8884d8", "#82ca9d"];

const LandUseDistributionPieChart = () => {
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const country = searchParams.get("country");

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["landUseDistribution", villageName, country],
    queryFn: () => getLandUseDistribution(villageName, country),
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
            Error:{" "}
            {error?.message || "Failed to load land use distribution data"}
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  const countData = [
    {
      name: "Inside",
      value: response?.count?.inside,
    },
    {
      name: "Outside",
      value: response?.count?.outside,
    },
  ];

  const areaData = [
    {
      name: "Inside",
      value: response?.area?.inside,
    },
    {
      name: "Outside",
      value: response?.area?.outside,
    },
  ];

  return (
    <StyledCard>
      <CardContent>
        <StyledCardTitle>Landholdings Inside vs Outside Village</StyledCardTitle>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              By Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {countData.map((entry, index) => (
                    <Cell
                      key={`cell-count-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              align="center"
              gutterBottom
            >
              By Area
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={areaData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {areaData.map((entry, index) => (
                    <Cell
                      key={`cell-area-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default LandUseDistributionPieChart;
