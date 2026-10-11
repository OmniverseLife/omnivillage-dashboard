import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getExpansionDemand } from "../../../../../functions/housingAndWater";

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

const ExpansionDemandPieChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: expansionDemandData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["expansion-demand-data", villageName],
    queryFn: () => getExpansionDemand(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (expansionDemandData?.data) {
      const { totalHouses, needExpansion } = expansionDemandData.data;
      const needsExpansionCount = needExpansion?.count || 0;
      const noNeedExpansionCount = totalHouses - needsExpansionCount;

      const urgencyData =
        needExpansion?.urgency?.map((item) => ({
          name: `Need: ${item.level}`,
          y: item.count,
        })) || [];

      setChartOptions({
        chart: {
          type: "pie",
          backgroundColor: "transparent",
        },
        title: {
          text: `House Expansion Demand in ${villageName} (Total: ${totalHouses})`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} houses)",
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
          },
        },
        series: [
          {
            name: "Expansion Demand",
            data: [
              { name: "Need Expansion", y: needsExpansionCount },
              { name: "No Need for Expansion", y: noNeedExpansionCount },
              ...urgencyData,
            ],
            colors: ["#f45b5b", "#90ed7d", "#2b908f", "#f2a764"], // Customize colors
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: -50,
              filter: {
                property: "percentage",
                operator: ">",
                value: 4,
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
          text: `House Expansion Demand in ${villageName}`,
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
          text: "No expansion demand data available.",
        },
      });
    }
  }, [expansionDemandData, villageName]);

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
        Error: {error?.message || "Failed to load expansion demand data."}
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
          House expansion demand and urgency in <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default ExpansionDemandPieChart;
