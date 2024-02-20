import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { customDatalabels } from "../customPieChart/customPieChart";
// ChartJS.unregister(customDatalabels);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
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
        ctx.font = "14px normal 'Helvetica Nueue'";
        ctx.fillText("No data to display", width / 2, height / 2);
        ctx.restore();
      }
    },
  },
};

function CustomBarChart({ header, data }) {
  return (
    <div style={{ width: "100%" }}>
      <h3>{header}</h3>
      <Bar options={options} data={data} plugins={[ChartDataLabels]} />
    </div>
  );
}

export default CustomBarChart;
