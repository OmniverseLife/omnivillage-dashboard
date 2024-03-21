import React from "react";
// import Chart from "react-google-charts";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

function CustomAreaChart({
  header,
  data,
  measurement = "",
  style,
  helper_text,
}) {
  const options1 = {
    chart: {
      type: "area",
      height: "520px",
    },
    title: {
      text: header,
      align: "left",
    },
    xAxis: {
      categories: data.xAxis,
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        showInLegend: true,
        // dataLabels: [
        //   {
        //     enabled: true,
        //     distance: 20,
        //   },
        //   {
        //     enabled: true,
        //     distance: -40,
        //     format: "{point.percentage:.1f}%",
        //     style: {
        //       fontSize: "1.2em",
        //       textOutline: "none",
        //       opacity: 0.7,
        //     },
        //     // filter: {
        //     //     operator: '>',
        //     //     property: 'percentage',
        //     //     value: 10
        //     // }
        //   },
        // ],
      },
      area: {
        size: "100%",
        marker: {
          enabled: false,
          symbol: "circle",
          radius: 2,
          states: {
            hover: {
              enabled: true,
            },
          },
        },
      },
    },
    series: data.dataset,
  };

  return (
    <div className="pieChartContainer" style={style}>
      {/* <h3
        style={{
          marginBottom: 20,
          alignSelf: "flex-start",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      > */}
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
      {/* </h3> */}
      {/* <Pie
        options={options}
        data={data}
        className="pieChart"
        plugins={[customDatalabels]}
      /> */}
      <div style={{ width: "100%", height: "100%" }}>
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

export default CustomAreaChart;
