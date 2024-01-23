import React from "react";
// import Chart from "react-google-charts";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
function CustomPieChart({ header, data, measurement }) {
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
          return value ? value : null;
        },
        color: "#333",
        font: {
          size: 16,
        },
        clamp: true,
      },
      afterDraw: function (chart) {
        if (chart.data.datasets.length === 0) {
          // No data is present
          var ctx = chart.chart.ctx;
          var width = chart.chart.width;
          var height = chart.chart.height;
          chart.clear();

          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "16px normal 'Helvetica Nueue'";
          ctx.fillText("No data to display", width / 2, height / 2);
          ctx.restore();
        }
      },
    },
  };
  return (
    <div className="pieChartContainer">
      <h3
        style={{
          marginBottom: 20,
          alignSelf: "flex-start",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {header} <p style={{ color: "#888" }}>{measurement}</p>
      </h3>
      <Pie options={options} data={data} className="pieChart" />
    </div>
  );
}

export default CustomPieChart;
