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
 import { getWasteScarcity } from "../../../../../functions/housingAndWater"; // Adjust path as needed

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

 const WasteScarcityGroupedBarChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [searchParams] = useSearchParams();
  const villageName = searchParams.get("village");
  const countryName = searchParams.get("country");


  const {
   data: wasteScarcityData,
   isLoading,
   isError,
   error,
  } = useQuery({
   queryKey: ["waste-scarcity-data", villageName],
   queryFn: () => getWasteScarcity(villageName, countryName),
   enabled: !!villageName,
  });

  useEffect(() => {
   if (wasteScarcityData?.data) {
    const severities = [
     ...new Set(wasteScarcityData.data.map((item) => item.severity.en)),
    ];
    const months = [
     ...new Set(
      wasteScarcityData.data.flatMap((item) => item.months_of_year_of_scarcity)
     ),
    ].sort((a, b) => {
     const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
     ];
     return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    const seriesData = severities.map((severity) => {
     const data = months.map((month) => {
      const scarcity = wasteScarcityData.data.find((item) =>
       item.severity.en === severity && item.months_of_year_of_scarcity.includes(month)
      );
      return scarcity ? scarcity.count : 0;
     });
     return { name: severity, data,   pointWidth: 20, };
    });

    setChartOptions({
     chart: {
      type: "bar",
      backgroundColor: "transparent",
      height:600,
     },
     title: {
      text: `Waste Scarcity in ${villageName} by Severity`,
      style: {
       fontSize: "18px",
       fontWeight: "bold",
       color: "#333",
      },
     },
     xAxis: {
      categories: months,
      title: {
       text: "Months",
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
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
       '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
       '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
     },
     plotOptions: {
      bar: {
       dataLabels: {
        enabled: true,
        style: {
         fontWeight: "bold",
        },
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
      backgroundColor: "transparent",
     },
     title: {
      text: `Waste Scarcity in ${villageName} by Severity`,
      style: {
       fontSize: "18px",
       fontWeight: "bold",
       color: "#333",
      },
     },
     xAxis: {
      categories: [],
      title: {
       text: "Months",
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
      text: "No waste scarcity data available.",
     },
    });
   }
  }, [wasteScarcityData, villageName]);

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
     Error: {error?.message || "Failed to load waste scarcity data."}
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
      Household waste scarcity in <strong>{villageName}</strong>
     </Typography>
    </CardContent>
   </StyledCard>
  );
 };

 export default WasteScarcityGroupedBarChart;