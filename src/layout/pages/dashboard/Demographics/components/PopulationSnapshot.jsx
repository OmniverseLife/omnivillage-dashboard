import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getVillagePopulationSnapshot } from "../../../../../functions/demographics";
import { People, Home, Group, Man, Woman } from "@mui/icons-material"; // Import icons
import { styled } from "@mui/material/styles";

// Styled Card Component
const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: 12, // Rounded corners
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
  },
  border: "1px solid #e0e0e0", // Add a border
}));

// Styled Card Title
const StyledCardTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.2rem",
  fontWeight: "600",
  color: "#555", // Darker title color
}));

// Styled Card Content Value
const StyledCardContentValue = styled(Typography)(({ theme }) => ({
  fontSize: "1.8rem", // Larger font size
  fontWeight: "bold",
  color: "#222", // Very dark color
}));

const PopulationSnapshot = () => {
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: populationData,
    isLoading: isPopulationLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["demographic-population-snapshot", villageName],
    queryFn: () => getVillagePopulationSnapshot(villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error fetching population snapshot:", error);
    }
  }, [isError, error]);

  if (isPopulationLoading) {
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

  if (isError) {
    return (
      <div style={{ color: "red", padding: "16px" }}>
        Error: {error?.message || "Failed to load population data."}
      </div>
    );
  }

  if (!villageName) {
    return (
      <div style={{ padding: "16px" }}>
        Please select a village from the URL (e.g., ?village=rukha).
      </div>
    );
  }

  const { snapshot } = populationData?.data || {};

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <People sx={{ color: "#4caf50", fontSize: 24, mr: 1 }} />
                <StyledCardTitle>Total Population</StyledCardTitle>
              </Box>
              <StyledCardContentValue>
                {snapshot?.totalPopulation || 0}
              </StyledCardContentValue>
              <Typography variant="body2" color="textSecondary">
                {/* No change percentage available */}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Home sx={{ color: "#fbc02d", fontSize: 24, mr: 1 }} />
                <StyledCardTitle>Unique Households</StyledCardTitle>
              </Box>
              <StyledCardContentValue>
                {snapshot?.uniqueHouseholds || 0}
              </StyledCardContentValue>
              <Typography variant="body2" color="textSecondary">
                {/* No change percentage available */}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard
            style={{
              height: "100%",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Group sx={{ color: "#3f51b5", fontSize: 24, mr: 1 }} />
                <StyledCardTitle>Gender Distribution</StyledCardTitle>
              </Box>
              <Box display="flex" alignItems="end" gap={2}>
                {snapshot?.genderCounts?.map((item) => (
                  <Box
                    key={item.gender}
                    display="flex"
                    alignItems="center"
                    my={1}
                  >
                    {/* {item.gender === "female" ? (
                      <Woman sx={{ color: "#d84315", fontSize: 24, mr: 0.5 }} />
                    ) : (
                      <Man sx={{ color: "#007bff", fontSize: 24, mr: 0.5 }} />
                    )} */}
                    <Typography  style={{textTransform:"capitalize", fontSize:"1.125rem"}}>
                      {item.gender}:{" "}
                      <span style={{ fontWeight: "bold" }}>{item.count}</span>
                    </Typography>
                  </Box>
                )) || (
                  <Typography
                    variant="body1"
                    style={{ paddingTop: "0.725rem" }}
                  >
                    No data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      {isFetching && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={20} />
        </div>
      )}
    </div>
  );
};

export default PopulationSnapshot;
