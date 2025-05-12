import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getUnitFloorData } from "../../../../../functions/housingAndWater";

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

const UnitFloorScatterChartWithOverlapInfo = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");

  const {
    data: unitFloorData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["unit-floor-data", villageName],
    queryFn: () => getUnitFloorData(villageName, countryName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (
      unitFloorData?.data?.scatterData &&
      Array.isArray(unitFloorData.data.scatterData)
    ) {
      // Group data by units and floors to handle overlaps
      const groupedData = unitFloorData.data.scatterData.reduce((acc, curr) => {
        const key = `${curr.units}-${curr.floors}`;
        if (!acc[key]) {
          acc[key] = {
            units: curr.units,
            floors: curr.floors,
            houses: [],
          };
        }
        acc[key].houses.push({
          builtArea: curr.builtArea,
          densityUtilisation: curr.densityUtilisation,
        });
        return acc;
      }, {});

      const scatterData = Object.values(groupedData).map((group) => ({
        x: group.units,
        y: group.floors,
        houses: group.houses, // Store the array of house details
      }));

      setChartOptions({
        chart: {
          type: "scatter",
          zoomType: "xy",
          backgroundColor: "transparent",
        },
        title: {
          text: `Units vs. Floors in Houses of ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          title: {
            text: "Number of Units",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        yAxis: {
          title: {
            text: "Number of Floors",
          },
          labels: {
            style: {
              color: "#666",
            },
          },
        },
        tooltip: {
          headerFormat: "<b>Units: {point.x}, Floors: {point.y}</b><br/>",
          useHTML: true, // Enables HTML rendering
          pointFormatter: function () {
            let tooltipText = `
      <div style="padding: 4px 0;">
        <div><b>Number of Houses:</b> ${this.houses.length}</div>
        <div style="margin-top: 6px;"><b>Built Areas (sq. ft.):</b></div>
        <ul style="padding-left: 18px; margin: 4px 0;">
    `;

            this.houses.forEach((house) => {
              tooltipText += `
        <li style="margin: 8px 0;">
          ${house.builtArea} 
          <span style="color: #777;">(Density Utilized: ${house.densityUtilisation?.toFixed(
            2
          )})</span>
        </li>`;
            });

            tooltipText += "</ul></div>";
            return tooltipText;
          },
        },
        series: [
          {
            name: "Houses",
            data: scatterData,
            marker: {
              radius: 5,
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
          type: "scatter",
          zoomType: "xy",
          backgroundColor: "transparent",
        },
        title: {
          text: `Units vs. Floors in Houses of ${villageName}`,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          },
        },
        xAxis: {
          title: {
            text: "Number of Units",
          },
        },
        yAxis: {
          title: {
            text: "Number of Floors",
          },
        },
        series: [],
        credits: {
          enabled: false,
        },
        noData: {
          text: "No unit vs. floor data available.",
        },
      });
    }
  }, [unitFloorData, villageName]);

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
        Error: {error?.message || "Failed to load unit vs. floor data."}
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
          Relationship between the number of units and floors in houses of{" "}
          <strong>{villageName}</strong>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default UnitFloorScatterChartWithOverlapInfo;
