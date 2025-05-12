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
import { getHarvestingCapacity } from "../../../../../functions/housingAndWater"; // Adjust path as needed

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

const RainwaterHarvestingCapacityChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: harvestingCapacityData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["harvesting-capacity-data", villageName],
    queryFn: () => getHarvestingCapacity(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (harvestingCapacityData?.data && Array.isArray(harvestingCapacityData.data)) {
      // Assuming data for one village at a time.
      const villageData = harvestingCapacityData.data[0];

      if (villageData) {
        const householdsWithRainwaterHarvesting = villageData.count;
        const totalRainwaterHarvestingCapacity = villageData.totalCapacity;

        setChartOptions({
          chart: {
            type: "bar",
            backgroundColor: "transparent",
          },
          title: {
            text: `Water Harvesting in ${villageName}`,
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            },
          },
          xAxis: {
            categories: ["Rainwater Harvesting"],
            title: {
              text: "Harvesting Type",
            },
            labels: {
              style: {
                color: "#666",
              },
            },
          },
          yAxis: [
            {
              title: {
                text: "Number of Households",
              },
              labels: {
                style: {
                  color: "#666",
                },
              },
            },
            {
              title: {
                text: "Total Capacity (Units)",
                style: {
                  color: Highcharts.getOptions().colors[1],
                },
              },
              opposite: true,
              labels: {
                style: {
                  color: Highcharts.getOptions().colors[1],
                },
              },
            },
          ],
          tooltip: {
            shared: true,
          },
          series: [
            {
              name: "Households with Harvesting",
              type: "column",
              data: [householdsWithRainwaterHarvesting],
              color: "#8085e9",
              tooltip: {
                valueSuffix: " households",
              },
            },
            {
              name: "Total Capacity",
              type: "line",
              data: [totalRainwaterHarvestingCapacity],
              yAxis: 1,
              color: Highcharts.getOptions().colors[1],
              marker: {
                enabled: false,
              },
              tooltip: {
                valueSuffix: " units",
              },
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return `${this.y} units`;
                },
                y: -20,
                style: {
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: Highcharts.getOptions().colors[1]
                }
              }
            },
          ],
          credits: {
            enabled: false,
          },
        });
      } else {
        setChartOptions({
          chart: {
            type: "bar",
            backgroundColor: "transparent",
          },
          title: {
            text: `Rainwater Harvesting in ${villageName}`,
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            },
          },
          xAxis: {
            categories: [],
            title: {
              text: "Harvesting Type",
            },
          },
          yAxis: [
            {
              title: {
                text: "Number of Households",
              },
            },
            {
              title: {
                text: "Total Capacity (Units)",
              },
              opposite: true,
            },
          ],
          series: [],
          credits: {
            enabled: false,
          },
          noData: {
            text: "No rainwater harvesting data available for this village.",
          },
        });
      }
    } else {
      setChartOptions({
        chart: {
          type: "bar",
          backgroundColor: "transparent",
        },
        title: {
          text: `Rainwater Harvesting in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Harvesting Type",
          },
        },
        yAxis: [
          {
            title: {
              text: "Number of Households",
            },
          },
          {
            title: {
              text: "Total Capacity (Units)",
            },
            opposite: true,
          },
        ],
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No rainwater harvesting data available.",
        },
      });
    }
  }, [harvestingCapacityData, villageName]);

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
        Error: {error?.message || "Failed to load rainwater harvesting data."}
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
          Water harvesting in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default RainwaterHarvestingCapacityChart;