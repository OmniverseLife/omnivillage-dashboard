import React from "react";
// import Chart from "react-google-charts";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
function CustomPieChart({ header, data }) {
  ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        title: { display: true, padding: 10 },
      },
      datalabels: {
        formatter: (value) => {
          return `${value}`;
        },
        color: "#333",
        font: {
          size: 16,
        },
        clamp: true,
      },
    },
  };
  return (
    <div className="pieChartContainer">
      <h3 style={{ marginBottom: 20, alignSelf: "flex-start" }}>{header}</h3>
      <Pie options={options} data={data} className="pieChart" />
      {/* <Chart
        chartType="PieChart"
        data={data}
        options={options}
        width="100%"
        height={"400px"}
      /> */}
    </div>
  );
}

export default CustomPieChart;
