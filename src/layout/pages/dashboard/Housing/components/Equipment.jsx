import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getEquipmentData } from "../../../../../functions/housingAndWater";

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

const EquipmentHorizontalBarChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: equipmentData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["equipment-data", villageName],
    queryFn: () => getEquipmentData(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (equipmentData?.data && Array.isArray(equipmentData.data)) {
      const categories = equipmentData.data.map((item) => item.equipment.en);
      const counts = equipmentData.data.map((item) => item.count);

      setChartOptions({
        chart: {
          type: "bar",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household Equipment in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Equipment",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Number of Households",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          valueSuffix: " households",
        },
        series: [
          {
            name: "Number of Households",
            data: counts,
            color: "#7cb5ec",
            pointWidth: 20,
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
          text: `Household Equipment in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Equipment",
          },
        },
        yAxis: {
          title: {
            text: "Number of Households",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No equipment data available.",
        },
      });
    }
  }, [equipmentData, villageName]);

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
        Error: {error?.message || "Failed to load equipment data."}
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
          Number of households with each equipment in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default EquipmentHorizontalBarChart;
