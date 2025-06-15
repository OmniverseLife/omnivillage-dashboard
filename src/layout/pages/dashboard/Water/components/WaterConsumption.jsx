import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getWaterConsumption } from "../../../../../functions/housingAndWater";

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

const WaterConsumptionByCategoryChart = () => { // Renamed component for clarity
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: waterConsumptionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["water-consumption-data-by-category", villageName], // Changed query key
    queryFn: () => getWaterConsumption(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (
      waterConsumptionData?.data &&
      Array.isArray(waterConsumptionData.data) &&
      waterConsumptionData.data.length > 0
    ) {
      // 1. Collect all unique consumption ranges (categories for X-axis)
      const allConsumptionRanges = Array.from(
        new Set(
          waterConsumptionData.data.map((item) => item.consumptionRange.en)
        )
      );

      // Sort consumption ranges if they represent a sequence (e.g., numerical ranges)
      // This is a basic attempt to sort based on recognizing numbers in ranges.
      // You might need a more robust sorting logic if ranges are complex strings.
      allConsumptionRanges.sort((a, b) => {
        const numA = parseFloat(a.match(/\d+/)?.[0] || 0);
        const numB = parseFloat(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });


      // 2. Collect all unique consumption types (series names)
      const allConsumptionTypes = Array.from(
        new Set(waterConsumptionData.data.map((item) => item.type))
      );

      // Format types for display (e.g., "cleaning" -> "Cleaning", "cooking_and_drinking" -> "Cooking and Drinking")
      const formattedConsumptionTypes = allConsumptionTypes.map(type =>
        type?.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase()) || "Unknown"
      );

      // 3. Prepare series data
      // Each series will represent a consumption type, and its data will be counts for each range
      const series = formattedConsumptionTypes.map((formattedType) => {
        const originalType = formattedType.replace(/ /g, '_').toLowerCase(); // Convert back to original type for data lookup
        const dataForType = allConsumptionRanges.map((range) => {
          // Find the count for this specific type and range
          const foundItem = waterConsumptionData.data.find(
            (item) =>
              item.type === originalType && item.consumptionRange.en === range
          );
          return foundItem ? foundItem.count : 0; // Return count or 0 if not found
        });

        return {
          name: formattedType, // Series name (e.g., "Cleaning")
          data: dataForType,   // Array of counts for each consumption range
        };
      });

      setChartOptions({
        chart: {
          type: "column", // Use column chart for stacked bars
          backgroundColor: "transparent",
        },
        title: {
          text: `Water Consumption by Category in ${villageName || 'Selected Village'}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: allConsumptionRanges, // Consumption ranges on X-axis
          title: {
            text: "Consumption Range",
          },
          labels: {
            style: {
              color: "#666",
            },
            // Rotate labels if needed for long names
            rotation: allConsumptionRanges.some(cat => cat.length > 25) ? -45 : 0,
            formatter: function() { // Add a tooltip to category labels if they are too long
              return this.value.length > 30 ? '<span title="' + this.value + '">' + this.value.substring(0, 27) + '...</span>' : this.value;
            }
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Number of Households",
          },
          stackLabels: { // Show total for each stack
              enabled: true,
              style: {
                  fontWeight: 'bold',
                  color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
              }
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          headerFormat:
            '<span style="font-size:10px">{point.key}</span><br/>',
          pointFormat:
            '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.1f}%)<br/>',
          footerFormat: 'Total: <b>{point.total}</b> households',
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            stacking: "normal", // This makes the bars stack
            dataLabels: {
              enabled: false, // Generally disable individual data labels for stacked charts to avoid clutter
              // You can enable them if needed, but often totals are preferred via stackLabels
            },
          },
        },
        series: series, // Your prepared series array
        credits: {
          enabled: false,
        },
        legend: {
          align: 'right',
          x: -30,
          verticalAlign: 'top',
          y: 25,
          floating: true,
          backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false,
          itemStyle: {
            fontWeight: 'normal'
          }
        },
        responsive: {
          rules: [{
            condition: {
              maxWidth: 768
            },
            chartOptions: {
              xAxis: {
                labels: {
                  rotation: -90,
                  formatter: function() { // Apply tooltip for small screens too
                    return this.value.length > 15 ? '<span title="' + this.value + '">' + this.value.substring(0, 12) + '...</span>' : this.value;
                  }
                }
              },
              legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
                floating: false,
                x: 0,
                y: 0
              },
              title: {
                style: {
                  fontSize: "16px"
                }
              }
            }
          }]
        }
      });
    } else {
      // Set no data options
      setChartOptions({
        chart: {
          type: "column",
          backgroundColor: "transparent",
        },
        title: {
          text: `Water Consumption by Category in ${villageName || 'Selected Village'}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          categories: [],
          title: {
            text: "Consumption Range",
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
          text: `No water consumption data available for ${villageName}.`,
          style: { fontWeight: "bold", fontSize: "16px", color: "#333333" },
        },
      });
    }
  }, [waterConsumptionData, villageName]);

  // Handle case where no village is selected
  if (!villageName) {
    return (
      <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 4 }}>
        Please select a village to view water consumption patterns.
      </Typography>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <Typography color="error" align="center" sx={{ mt: 2 }}>
        Error: {error?.message || "Failed to load water consumption data."}
      </Typography>
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
          Distribution of household water consumption by category in{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default WaterConsumptionByCategoryChart;