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
import { getWasteRecycle } from "../../../../../functions/housingAndWater"; // Adjust path as needed

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

const WasteRecyclingDonutChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: wasteRecycleData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["waste-recycle-data", villageName],
    queryFn: () => getWasteRecycle(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (wasteRecycleData?.data) {
      const { totalHouseholds, recyclingPercentage, village } = wasteRecycleData.data;
      const recyclingHouseholds = (recyclingPercentage / 100) * totalHouseholds;
      const notRecyclingHouseholds = totalHouseholds - recyclingHouseholds;

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `Waste Recycling in ${village} (Total Households: ${totalHouseholds})`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} households)",
        },
        accessibility: {
          point: {
            valueSuffix: "%",
          },
        },
        plotOptions: {
          pie: {
            innerSize: "60%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: -30,
              filter: {
                property: "percentage",
                operator: ">",
                value: 1,
              },
              style: {
                fontWeight: "bold",
                color: "white",
                textShadow: "0px 1px 2px black",
              },
            },
          },
        },
        series: [
          {
            name: "Recycling",
            data: [
              { name: "Recycling", y: recyclingHouseholds },
              { name: "Not Recycling", y: notRecyclingHouseholds },
            ],
            colors: ["#90ed7d", "#f45b5b"], // Green for recycling, red for not
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `Waste Recycling in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No waste recycling data available.",
        },
      });
    }
  }, [wasteRecycleData, villageName]);

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
        Error: {error?.message || "Failed to load waste recycling data."}
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
          Household waste recycling in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default WasteRecyclingDonutChart;