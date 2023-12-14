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
  },
};

function CustomBarChart({ header, data }) {
  console.log(data);
  return (
    <div style={{ width: "100%" }}>
      <h3>{header}</h3>
      <Bar options={options} data={data} />
    </div>
  );
}

export default CustomBarChart;
