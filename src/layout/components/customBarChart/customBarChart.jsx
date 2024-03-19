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
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
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

function CustomBarChart({ header, data, measurement = "", helper_text }) {
  // console.log(data.dataset);
  const options1 = {
    chart: {
      type: "column",
      height: "560px",
      // spacingBottom: 0,
    },
    title: {
      text: header,
      align: "left",
      // margin: 120,
    },
    xAxis: {
      categories: data.xAxis,
      crosshair: true,
      accessibility: {
        description: "Countries",
      },
    },
    yAxis: [{ min: 0 }],
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
      series: {
        minPointLength: 10,
      },
    },
    series: data.dataset,
    legend: {
      enabled: true,
    },
  };

  return (
    <div
      style={{
        // width: "48%",
        fontFamily: "inherit",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #4b465c1f",
        padding: "15px 5px",
        alignItems: "center",
        width: "100%",
        height: "600px",
        position: "relative",
      }}
    >
      {/* <h3>{header}</h3> */}
      <p
        style={{
          color: "#888",
          alignSelf: "flex-end",
          position: "absolute",
          top: "15px",
          right: "20px",
          zIndex: 9,
        }}
      >
        <span>{measurement.slice(0, -1)}</span>
        {!Number.isInteger(parseInt(measurement.slice(-2, -1))) &&
        Number.isInteger(parseInt(measurement.slice(-1))) ? (
          <sup>{measurement.slice(-1)}</sup>
        ) : (
          measurement.slice(-1)
        )}
      </p>
      {/* <Bar options={options} data={data} plugins={[ChartDataLabels]} /> */}
      <div style={{ width: "100%", marginTop: "auto" }}>
        <HighchartsReact highcharts={Highcharts} options={options1} />
      </div>
      {Boolean(helper_text) && (
        <span
          style={{
            fontSize: "12px",
            color: "#777",
            display: "block",
            textAlign: "center",
          }}
        >
          &#9432; {helper_text}
        </span>
      )}
    </div>
  );
}

export default CustomBarChart;
