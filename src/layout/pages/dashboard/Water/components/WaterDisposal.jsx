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
import { getWasteDisposal } from "../../../../../functions/housingAndWater"; // Adjust path as needed

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

const WasteDisposalStackedBarChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: wasteDisposalData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["waste-disposal-data", villageName],
    queryFn: () => getWasteDisposal(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (wasteDisposalData?.data && Array.isArray(wasteDisposalData.data) && wasteDisposalData.data.length > 0) {
      const villageData = wasteDisposalData.data[0];
      const disposalMethods = villageData.disposalMethods;

      const categories = [villageData.village]; // Use village name as the category
      const seriesData = disposalMethods.map((methodData) => ({
        name: methodData.method,
        data: [methodData.percentage],
      }));

      setChartOptions({
        chart: {
          type: "bar",
          stacked: "percent",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household Waste Disposal Methods in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories,
          title: {
            text: "Village",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Percentage of Households",
          },
          labels: {
            formatter: function () {
              return this.value + "%";
            },
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          pointFormat:
            '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b><br/>',
          shared: true,
        },
        plotOptions: {
          bar: {
            stacking: "percent",
            dataLabels: {
              enabled: true,
              format: "{point.percentage:.1f}%",
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || "black",
            },
          },
        },
        series: seriesData,
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "bar",
          stacked: "percent",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household Waste Disposal Methods in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Village",
          },
        },
        yAxis: {
          title: {
            text: "Percentage of Households",
          },
          labels: {
            formatter: function () {
              return this.value + "%";
            },
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No waste disposal data available for this village.",
        },
      });
    }
  }, [wasteDisposalData, villageName]);

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
        Error: {error?.message || "Failed to load waste disposal data."}
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
          Household waste disposal methods in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default WasteDisposalStackedBarChart;