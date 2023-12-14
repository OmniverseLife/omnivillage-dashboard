import React from "react";
// import Chart from "react-google-charts";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
function CustomPieChart({ header, data }) {
  ChartJS.register(ArcElement, Tooltip, Legend);

  // const options = {
  //   title: header,
  //   // is3D: true,
  // };
  return (
    <div className="pieChartContainer">
      <h3 style={{ marginBottom: 20, alignSelf: "flex-start" }}>{header}</h3>
      <Pie data={data} className="pieChart" />
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
