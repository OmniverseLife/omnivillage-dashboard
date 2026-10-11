import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getVillagePopulationSnapshot } from "../../../../../functions/demographics";
import { People, Home } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { LinearProgress } from '@mui/material';

// Styled Card Component
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
  width: '100%',
}));

// Styled Card Title
const StyledCardTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "600",
  color: "#555",
}));

// Styled Card Content Value
const StyledCardContentValue = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#222",
}));

const PopulationSnapshot = () => {
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const [malePercentage, setMalePercentage] = useState(50);
  const [femalePercentage, setFemalePercentage] = useState(50);
  const [genderDataAvailable, setGenderDataAvailable] = useState(false);


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

  useEffect(() => {
    if (populationData?.data?.snapshot?.genderCounts) {
      const genderCounts = populationData.data.snapshot.genderCounts;
      let maleCount = 0;
      let femaleCount = 0;
      genderCounts.forEach(item => {
        if (item.gender === 'male') {
          maleCount = item.count;
        } else if (item.gender === 'female') {
          femaleCount = item.count;
        }
      });
      const totalCount = maleCount + femaleCount;
      if (totalCount > 0) {
        setMalePercentage((maleCount / totalCount) * 100);
        setFemalePercentage((femaleCount / totalCount) * 100);
        setGenderDataAvailable(true);
      }
      else {
        setGenderDataAvailable(false);
      }
    } else {
      setGenderDataAvailable(false);
      setMalePercentage(50);
      setFemalePercentage(50);
    }
  }, [populationData]);


  if (isPopulationLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          width: '100%'
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ color: "red", padding: "16px", width: '100%' }}>
        Error: {error?.message || "Failed to load population data."}
      </div>
    );
  }

  if (!villageName) {
    return (
      <div style={{ padding: "16px", width: '100%' }}>
        Please select a village from the URL (e.g., ?village=rukha).
      </div>
    );
  }

  const { snapshot } = populationData?.data || {};

  const totalPopulation = snapshot?.totalPopulation || 0;
  const uniqueHouseholds = snapshot?.uniqueHouseholds || 0;



  return (
    <StyledCard>
      <CardContent>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          width="100%"
        >
          {/* Total Population Section */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            flex={1}
            padding="1rem"
            width="100%"
          >
            <Box display="flex" alignItems="center" mb={1}>
              <People sx={{ color: "#4caf50", fontSize: 24, mr: 1 }} />
              <StyledCardTitle>Total Population</StyledCardTitle>
            </Box>
            <StyledCardContentValue>{totalPopulation}</StyledCardContentValue>
            <Typography variant="body2" color="textSecondary">
              {/* No change percentage available */}
            </Typography>
          </Box>
          <Divider
            orientation={['vertical', 'vertical']}
            flexItem
            sx={{ display: { xs: 'none', md: 'block' } }}
          />
            <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            flex={1.5}
            padding="1rem"
            width="100%"
          >
            <StyledCardTitle style={{ marginBottom: "1rem" }}>
              Gender Distribution
            </StyledCardTitle>
            {genderDataAvailable ? (
              <Box width="100%">
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Male: {malePercentage.toFixed(1)}%</Typography>
                  <Typography variant="body2">Female: {femalePercentage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={malePercentage}
                  sx={{
                    height: 10,
                    backgroundColor: 'grey.300',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#8884d8',
                    },
                  }}
                  style={{ width: '100%' }}
                />
              </Box>
            ) : (
              <Typography
                variant="body1"
                color="textSecondary"
                style={{ textAlign: "center" }}
              >
                No gender data available
              </Typography>
            )}
          </Box>

          {/* Unique Households Section */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            flex={1}
            padding="1rem"
            width="100%"
          >
            <Box display="flex" alignItems="center" mb={1}>
              <Home sx={{ color: "#fbc02d", fontSize: 24, mr: 1 }} />
              <StyledCardTitle>Unique Households</StyledCardTitle>
            </Box>
            <StyledCardContentValue>{uniqueHouseholds}</StyledCardContentValue>
            <Typography variant="body2" color="textSecondary">
              {/* No change percentage available */}
            </Typography>
          </Box>
          <Divider
            orientation={['vertical', 'vertical']}
            flexItem
            sx={{ display: { xs: 'none', md: 'block' } }}
          />

          {/* Gender Distribution Section */}
        
        </Box>
        {isFetching && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              width: '100%'
            }}
          >
            <CircularProgress size={20} />
          </div>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default PopulationSnapshot;
