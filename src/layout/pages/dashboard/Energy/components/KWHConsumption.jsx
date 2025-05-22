import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getKwhConsumption } from "../../../../../functions/energyAndBusinessAndPersonalAndForestryAndMobility"; // Adjust path as needed

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

const KwhConsumptionHistogram = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: kwhConsumptionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["kwh-consumption-data", villageName],
    queryFn: () => getKwhConsumption(countryName, villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (
      kwhConsumptionData?.data?.histogram &&
      Array.isArray(kwhConsumptionData.data.histogram)
    ) {
      // Create a map to store aggregated data for each consumption value
      // Key: consumption value (e.g., 1125, 23040)
      // Value: { count: total households, totalMembers: total members, households: [...] }
      const aggregatedData = new Map();

      kwhConsumptionData.data.histogram.forEach((item) => {
        const consumptionValue = item.consumption;
        if (!aggregatedData.has(consumptionValue)) {
          aggregatedData.set(consumptionValue, {
            count: 0,
            totalMembers: 0,
            households: [],
          });
        }
        const currentAgg = aggregatedData.get(consumptionValue);
        currentAgg.count += item.count;
        item.households.forEach((household) => {
          currentAgg.totalMembers += household.numberOfMembers;
          currentAgg.households.push(household);
        });
      });

      const categories = Array.from(aggregatedData.keys()).sort(
        (a, b) => a - b
      );
      const dataForSeries = categories.map((key) => ({
        y: aggregatedData.get(key).count, // The height of the bar (number of households)
        consumption: key, // Store consumption directly on the point
        householdsDetails: aggregatedData.get(key).households, // Store all household details for tooltip
      }));

      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household kWh Consumption Distribution in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: categories.map((c) => `${c} kWh`), // Label categories as kWh
          title: {
            text: "Consumption Range (kWh)",
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
          min: 0,
          allowDecimals: false, // Ensure integer counts
        },
        tooltip: {
          formatter: function () {
            const point = this.point;
            let tooltipContent = `<b>Consumption: ${point.consumption} kWh</b><br/>`;
            tooltipContent += `Number of Households: <b>${point.y}</b><br/>`;

            let totalMembers = 0;
            point.householdsDetails.forEach((h) => {
              totalMembers += h.numberOfMembers;
            });
            tooltipContent += `Total Members: <b>${totalMembers}</b><br/><br/>`;

            tooltipContent += "Households:<br/>";
            point.householdsDetails.slice(0, 5).forEach((h) => {
              // Show max 5 households in tooltip
              tooltipContent += `- ${h.firstName} ${h.lastName} (${h.numberOfMembers} members)<br/>`;
            });
            if (point.householdsDetails.length > 5) {
              tooltipContent += `... and ${
                point.householdsDetails.length - 5
              } more.`;
            }

            return tooltipContent;
          },
          shared: false, // Ensure individual point tooltips
          useHTML: true, // Allow HTML formatting in tooltip
        },
        series: [
          {
            name: "Households",
            data: dataForSeries,
            color: "#6997e8",
          },
        ],
        credits: {
          enabled: false,
        },
      });
    } else {
      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Household kWh Consumption Distribution in ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Consumption Range (kWh)",
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
          text: "No kWh consumption data available.",
        },
      });
    }
  }, [kwhConsumptionData, villageName]);

  if (isLoading) {
    return (
      <StyledCard sx={{ marginTop: 4, paddingY: "72px" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <CircularProgress />
        </div>
      </StyledCard>
    );
  }

  if (isError) {
    return (
      <div style={{ color: "red", padding: 16 }}>
        Error: {error?.message || "Failed to load kWh consumption data."}
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
          Distribution of kWh consumption among households in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default KwhConsumptionHistogram;
