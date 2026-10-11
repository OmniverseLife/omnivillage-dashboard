import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card, CardContent, Typography, CircularProgress, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams } from 'react-router-dom';
import { getDietShareByVillageAndOptionalGender } from '../../../../../functions/demographics'; // Import the correct function


// Styled Card for better UI
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

const DietShareChartComponent = ({ data }) => {
  const [chartOptions, setChartOptions] = useState({});
  const [selectedGender, setSelectedGender] = useState("female");

  
  useEffect(() => {
    if (data && data.dietShareAndCount) {
      const dietData = data.dietShareAndCount[selectedGender]?.map((item) => ({
        name: item.names.en,
        y: item.count,
        share: item.share,
      }));

      const options = {
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          style: {
            fontFamily: '"Arial", sans-serif',
          },
        },
        title: {
          text: `Diet Share for ${selectedGender}`,
          align: "center",
          style: {
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
          },
        },
        plotOptions: {
          pie: {
            innerSize: "50%",
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %",
              distance: 10,
              style: {
                color: "#555",
                fontSize: "14px",
                fontWeight: "normal",
                textOutline: "none",
              },
              connectorColor: "#777",
            },
            showInLegend: true,
          },
        },
        series: [
          {
            name: "Diet",
            data: dietData,
            colors: ["#4CAF50", "#2196F3", "#FFC107", "#F44336"],
          },
        ],
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: {
            color: "#666",
            fontWeight: "normal",
            fontSize: "12px",
          },
          itemHoverStyle: {
            color: "#333",
          },
        },
        credits: {
          enabled: false,
        },
        tooltip: {
          backgroundColor: "#FFFFFF",
          style: {
            color: "#333",
            fontSize: "13px",
          },
          borderWidth: 1,
          borderColor: "#DDD",
          shadow: true,
          pointFormat:
            "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  align: "center",
                  verticalAlign: "bottom",
                  layout: "horizontal",
                },
                plotOptions: {
                  pie: {
                    dataLabels: {
                      distance: 5,
                      style: {
                        fontSize: "10px",
                      },
                    },
                  },
                },
                title: {
                  style: {
                    fontSize: "14px",
                  },
                },
              },
            },
          ],
        },
      };
      setChartOptions(options);
    }
  }, [data, selectedGender]);

  if (!data) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="chart-container" style={{ width: "100%", margin: "full" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
         <Button
          variant={selectedGender === "female" ? "contained" : "outlined"}
          onClick={() => setSelectedGender("female")}
          style={{ marginRight: "0.5rem" }}
        >
          Female
        </Button>
        <Button
          variant={selectedGender === "male" ? "contained" : "outlined"}
          onClick={() => setSelectedGender("male")}
        >
          Male
        </Button>
      </div>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export const DietShareChart = () => {
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get('village');


  const {
    data: dietShareData,
    isLoading: isDietShareLoading,
    isError: isDietShareError,
    error: dietShareError,
  } = useQuery({
    queryKey: ['demographic-diet-share', villageName],
    queryFn: () => getDietShareByVillageAndOptionalGender(villageName),
    enabled: !!villageName,
  });



  if (isDietShareLoading) {
    return (
      <StyledCard sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4 }}>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </div>
        </CardContent>
      </StyledCard>
    );
  }

  if (isDietShareError) {
    return (
      <StyledCard sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4 }}>
        <CardContent>
          <Typography color="error">
            Error: {dietShareError?.message || 'Failed to load data'}
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  if (!dietShareData) {
    return (
      <StyledCard sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4 }}>
        <CardContent>
          <Typography>No data available</Typography>
        </CardContent>
      </StyledCard>
    );
  }

  

  return (
    <StyledCard sx={{ width: "100%", marginX: "auto", padding: "20px", marginTop: 4 }}>
      <CardContent>
        <DietShareChartComponent data={dietShareData.data} />
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "10px", textAlign: "center" }}
        >
          Source: Diet Share data for {dietShareData.data.village}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default DietShareChart;
