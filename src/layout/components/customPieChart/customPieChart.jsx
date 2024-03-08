import React from "react";
// import Chart from "react-google-charts";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export const customDatalabels = {
  id: "customDatalabels",
  afterDatasetsDraw(chart, args, pluginOptions) {
    const {
      ctx,
      data: chartData,
      chartArea: { top, bottom, left, right, width, height },
    } = chart;

    ctx.save();
    const halfWidth = width / 2 + left;
    const halfHeight = height / 2 + top;

    chartData.datasets[0].data.forEach((datapoint, index) => {
      const { x, y } = chart.getDatasetMeta(0).data[index].tooltipPosition();

      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = chartData.datasets[0].borderColor?.[index];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // ctx.fillText(datapoint, x, y);
      const xLine = x >= halfWidth ? x + 70 : x - 70;
      const yLine = y >= halfHeight ? y + 75 : y - 75;
      const extraLine = x >= halfWidth ? 20 : -20;
      const textWidth = ctx.measureText(datapoint).width;
      const textWidthPosition = x >= halfWidth ? textWidth - 5 : -textWidth + 5;

      ctx.strokeStyle = chartData.datasets[0].borderColor?.[index];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(xLine, yLine);
      ctx.lineTo(xLine + extraLine, yLine);
      ctx.stroke();
      ctx.fillText(datapoint, xLine + extraLine + textWidthPosition, yLine);
    });
  },
};

function CustomPieChart({ header, data, measurement, style, helper_text }) {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
    // ChartDataLabels,
    // customDatalabels
  );

  // ChartJS.unregister(ChartDataLabels);

  const options = {
    responsive: true,
    // zoomOutPercentage: 90,
    layout: {
      padding: 30,
    },
    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        title: { display: true, padding: 10 },
      },
      p4: false,
      // datalabels: {
      //   formatter: (value) => {
      //     return value ? value : null;
      //   },
      //   color: "#333",
      //   font: {
      //     size: 16,
      //   },
      //   clamp: true,
      // },
      // afterDraw: function (chart) {
      //   if (chart.data.datasets.length === 0) {
      //     // No data is present
      //     var ctx = chart.chart.ctx;
      //     var width = chart.chart.width;
      //     var height = chart.chart.height;
      //     chart.clear();

      //     ctx.save();
      //     ctx.textAlign = "center";
      //     ctx.textBaseline = "middle";
      //     ctx.font = "16px normal 'Helvetica Nueue'";
      //     ctx.fillText("No data to display", width / 2, height / 2);
      //     ctx.restore();
      //   }
      // },
    },
  };

  const options1 = {
    chart: {
      type: "pie",
    },
    title: {
      text: header,
      align: "left",
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
      pie: {
        size: "100%",
        // dataLabels: {
        //     enabled: false
        // }
      },
    },
    series: [
      {
        name: "Value",
        colorByPoint: true,
        data: data,
      },
    ],
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
      <p style={{ color: "#888", alignSelf: "flex-end" }}>{measurement}</p>
      {/* </h3> */}
      {/* <Pie
        options={options}
        data={data}
        className="pieChart"
        plugins={[customDatalabels]}
      /> */}
      <div style={{ width: "100%" }}>
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

export default CustomPieChart;
