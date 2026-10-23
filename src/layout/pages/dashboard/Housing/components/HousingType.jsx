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
import { getHousingType } from "../../../../../functions/housingAndWater";

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

const HousingTypeDonutChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: housingTypeData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["housing-type", villageName],
    queryFn: () => getHousingType(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (housingTypeData?.data && Array.isArray(housingTypeData.data)) {
      const chartData = housingTypeData.data.map((item) => ({
        name: item.houseType.en,
        y: item.count,
      }));

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `Housing Types in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})",
        },
        accessibility: {
          point: {
            valueSuffix: "%",
          },
        },
        plotOptions: {
          pie: {
            shadow: false,
            center: ["50%", "50%"],
            innerSize: "50%", // Creates the donut effect
          },
        },
        series: [
          {
            name: "Housing Type",
            data: chartData,
            colors: Highcharts.getOptions().colors, // Use default Highcharts colors
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: -50,
              filter: {
                property: "percentage",
                operator: ">",
                value: 4, // Only show labels for slices greater than 4%
              },
              style: {
                fontWeight: "bold",
                color: "white",
                textShadow: "0px 1px 2px black",
              },
            },
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
          text: `Housing Types in ${villageName}`,
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
          text: "No housing type data available.",
        },
      });
    }
  }, [housingTypeData, villageName]);

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
        Error: {error?.message || "Failed to load housing type data."}
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
          Distribution of housing types in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default HousingTypeDonutChart;