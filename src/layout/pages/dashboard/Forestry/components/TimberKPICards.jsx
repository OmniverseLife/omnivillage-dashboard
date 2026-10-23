import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getTimberSplit } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

// Styled card for KPIs
const StyledKPICard = styled(Card)(({ theme }) => ({
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: 12,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
  },
  border: "1px solid #e0e0e0",
  backgroundColor: "#fff",
  minHeight: 120, // Ensure cards have a minimum height
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(2),
  height: "100%", // Ensure cards take full height of the grid item
}));

const KPITitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

const KPIValue = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: "bold",
  color: theme.palette.primary.main,
  lineHeight: 1,
}));

const KPISubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.8rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

const TimberHarvestKPICards = () => {
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: timberSplitResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["timber-split-kpis", villageName, countryName],
    queryFn: () => getTimberSplit(countryName, villageName),
    enabled: !!villageName && !!countryName, // Ensure both are available
  });

  let totalLogsHarvested = 0;
  let communityTimber = 0;
  let ownTimber = 0;
  let totalLogs = 0;

  if (timberSplitResponse?.data && Array.isArray(timberSplitResponse.data)) {
    timberSplitResponse.data.forEach((item) => {
      totalLogsHarvested +=
        typeof item.totalTimberLogsHarvested === "number"
          ? item.totalTimberLogsHarvested
          : 0;
      communityTimber +=
        typeof item.communityForestTimber === "number"
          ? item.communityForestTimber
          : 0;
      ownTimber +=
        typeof item.ownForestTimber === "number" ? item.ownForestTimber : 0;
    });
    totalLogs = communityTimber + ownTimber; // Recalculate total from parts to ensure consistency
    // or just use totalLogsHarvested directly from API if trusted
  }

  const communityPercentage =
    totalLogs > 0 ? (communityTimber / totalLogs) * 100 : 0;
  const ownPercentage = totalLogs > 0 ? (ownTimber / totalLogs) * 100 : 0;

  if (isLoading) {
    return (
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {[1, 2, 3].map(
          (
            i // Render skeleton cards
          ) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <StyledKPICard>
                <CircularProgress size={30} />
              </StyledKPICard>
            </Grid>
          )
        )}
      </Grid>
    );
  }

  if (isError) {
    return (
      <Box sx={{ mt: 4, textAlign: "center", color: "red" }}>
        Error loading timber harvest data: {error?.message || "Unknown error."}
      </Box>
    );
  }

  const hasData =
    timberSplitResponse?.data && timberSplitResponse.data.length > 0;

  if (!hasData) {
    return (
      <Box sx={{ mt: 4, textAlign: "center", p: 3 }}>
        No timber harvest data available for{" "}
        {villageName || "the selected region"}.
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 4 }}>
      {/* KPI 1: Total Logs Harvested */}
      <Grid item xs={12} sm={12} md={4}>
        <StyledKPICard>
          <KPITitle>Total Logs Harvested</KPITitle>
          <KPIValue>{totalLogsHarvested.toLocaleString()}</KPIValue>
          <KPISubtitle>Logs</KPISubtitle>
        </StyledKPICard>
      </Grid>

      {/* KPI 2: Community Forest Contribution */}
      <Grid item xs={12} sm={12} md={4}>
        <StyledKPICard>
          <KPITitle>Community Forest Contribution</KPITitle>
          <KPIValue>{communityPercentage.toFixed(1)}%</KPIValue>
          <KPISubtitle>of total logs</KPISubtitle>
        </StyledKPICard>
      </Grid>

      {/* KPI 3: Own Forest Contribution */}
      <Grid item xs={12} sm={12} md={4}>
        <StyledKPICard>
          <KPITitle>Own Forest Contribution</KPITitle>
          <KPIValue>{ownPercentage.toFixed(1)}%</KPIValue>
          <KPISubtitle>of total logs</KPISubtitle>
        </StyledKPICard>
      </Grid>
    </Grid>
  );
};

export default TimberHarvestKPICards;
