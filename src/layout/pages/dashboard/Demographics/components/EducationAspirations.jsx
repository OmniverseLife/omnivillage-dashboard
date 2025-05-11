import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getEducationAndAspirations } from "../../../../../functions/demographics"; // Assuming this is the correct path

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

const EducationAspirationsChart = () => {
  const [educationChartOptions, setEducationChartOptions] = useState({});
  const [aspirationChartOptions, setAspirationChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: educationAspirationsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["education-aspirations-data", villageName],
    queryFn: () => getEducationAndAspirations(villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (educationAspirationsData?.data) {
      const nodes = educationAspirationsData.data.nodes || [];
      const links = educationAspirationsData.data.links || [];

      // Process education data (assuming nodes with links to a common "aspiration" node)
      const educationCounts = {};
      links.forEach((link) => {
        const sourceNode = nodes.find((node, index) => index === link.source);
        const targetNode = nodes.find((node, index) => index === link.target);

        if (sourceNode && targetNode) {
          const educationLevel = sourceNode.name.en;
          educationCounts[educationLevel] =
            (educationCounts[educationLevel] || 0) + link.value;
        }
      });

      const educationLevels = Object.keys(educationCounts);
      const educationValues = Object.values(educationCounts);

      setEducationChartOptions({
        chart: {
          type: "bar",
          inverted: true,
          backgroundColor: "transparent",
        },
        title: {
          text: `Reported Education Levels in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: educationLevels,
          title: {
            text: "Education Level",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Number of People",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        series: [
          {
            name: "People",
            data: educationValues.map((value) => ({ y: value })),
            color: "#43a2ca",
          },
        ],
        credits: {
          enabled: false,
        },
        legend: {
          enabled: false,
        },
        tooltip: {
          valueSuffix: " people",
        },
      });

      // Process aspiration data (assuming nodes with links from various "education" nodes)
      const aspirationCounts = {};
      links.forEach((link) => {
        const sourceNode = nodes.find((node, index) => index === link.source);
        const targetNode = nodes.find((node, index) => index === link.target);

        if (sourceNode && targetNode) {
          const aspirationLevel = targetNode.name.en;
          aspirationCounts[aspirationLevel] =
            (aspirationCounts[aspirationLevel] || 0) + link.value;
        }
      });

      const aspirationLevels = Object.keys(aspirationCounts);
      const aspirationValues = Object.values(aspirationCounts);

      setAspirationChartOptions({
        chart: {
          type: "bar",
          inverted: true,
          backgroundColor: "transparent",
        },
        title: {
          text: `Reported Aspirations in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: aspirationLevels,
          title: {
            text: "Aspiration",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Number of People",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        series: [
          {
            name: "People",
            data: aspirationValues.map((value) => ({ y: value })),
            color: "#7cb5ec",
          },
        ],
        credits: {
          enabled: false,
        },
        legend: {
          enabled: false,
        },
        tooltip: {
          valueSuffix: " people",
        },
      });
    }
  }, [educationAspirationsData, villageName]);

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
        Error: {error?.message || "Failed to load education and aspirations data."}
      </div>
    );
  }

  if (!educationAspirationsData?.data?.nodes || educationAspirationsData.data.nodes.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        No education and aspirations data available.
      </div>
    );
  }

  return (
    <Grid container spacing={4} sx={{ marginTop: 0 }}>
      <Grid item xs={12} md={6}>
        <StyledCard sx={{ paddingTop: "72px" }}>
          <CardContent>
            <HighchartsReact
              highcharts={Highcharts}
              options={educationChartOptions}
            />
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ marginTop: 2 }}
            >
              Reported Education Levels in <strong>{villageName}</strong>
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <StyledCard sx={{ paddingTop: "72px" }}>
          <CardContent>
            <HighchartsReact
              highcharts={Highcharts}
              options={aspirationChartOptions}
            />
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ marginTop: 2 }}
            >
              Reported Aspirations in <strong>{villageName}</strong>
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default EducationAspirationsChart;