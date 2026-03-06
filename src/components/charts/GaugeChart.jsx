import React from "react";
import Chart from "react-apexcharts";

const GaugeChart = ({ value, title }) => {
  const options = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: {
          size: "65%",
        },
        track: {
          background: "#e5e7eb",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "14px",
            color: "#6b7280",
          },
          value: {
            fontSize: "22px",
            fontWeight: "bold",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    colors: ["#5c7781"],
    labels: [title],
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <Chart options={options} series={[value]} type="radialBar" height={250} />
    </div>
  );
};

export default GaugeChart;