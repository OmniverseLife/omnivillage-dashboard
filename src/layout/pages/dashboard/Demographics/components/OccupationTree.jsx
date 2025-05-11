import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import TreemapModule from "highcharts/modules/treemap";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { getOccupationTreeMap } from "../../../../../functions/demographics";

// Initialize the Treemap module
TreemapModule(Highcharts);

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

const OccupationTreeMapChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");

  const {
    data: occupationData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["demographic-occupation-tree", villageName],
    queryFn: () => getOccupationTreeMap(villageName),
    enabled: !!villageName,
  });

  useEffect(() => {
    if (occupationData?.data) {
      const treeData = occupationData.data.map((item, index) => ({
        id: `id_${index}`,
        name: item.occupation?.en?.trim() || "Unknown",
        value: item.count,
      }));

      const options = {
        chart: {
          type: "treemap",
          backgroundColor: "transparent",
        },
        title: {
          text: `Occupational Distribution in ${villageName}`,
          align: "center",
          style: {
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
          },
        },
        series: [
          {
            type: "treemap",
            layoutAlgorithm: "squarified",
            data: treeData,
            dataLabels: {
              enabled: true,
              style: {
                fontSize: "13px",
              },
            },
          },
        ],
        tooltip: {
          pointFormat: "<b>{point.name}</b>: {point.value}",
        },
        credits: {
          enabled: false,
        },
      };

      setChartOptions(options);
    }
  }, [occupationData, villageName]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ color: "red", padding: "16px" }}>
        Error: {error?.message || "Failed to load occupation data."}
      </div>
    );
  }

  if (!occupationData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        No data available.
      </div>
    );
  }

  return (
    <StyledCard
      sx={{
        width: "100%",
        marginX: "auto",
        padding: "20px",
        paddingTop: "72px",
        marginTop: 4,
      }}
    >
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: Data is based on {villageName}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default OccupationTreeMapChart;
