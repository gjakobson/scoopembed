import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const ChartComponentOne = () => {
  const [chartData, setChartData] = useState({
    animation: false,
    series: [
      {
        type: "bar",
        metric: "Amount",
        categoryIndex: 0,
        category: null,
        name: "Amount",
        data: [
          0,
          2772411.63,
          3008518.55,
          2434785.44,
          2434785.44,
          2157295.82,
          2157295.82,
          1173309.45,
          855457.44,
          -13900.00
        ],
        yAxisIndex: 0,
        stack: "all",
        itemStyle: {
          color: "transparent"
        }
      },
      {
        name: "positive",
        type: "bar",
        stack: "all",
        data: [
          { value: 2772411.63, itemStyle: { color: "#2B65D9" } },
          236106.92,
          106469.4,
          0,
          148920.38,
          0,
          22750,
          0,
          0,
          0
        ],
        itemStyle: {
          color: "#009262"
        },
        waterfallPlaceholder: true
      },
      {
        name: "negative",
        type: "bar",
        stack: "all",
        data: [
          0,
          0,
          0,
          680202.51,
          0,
          426410,
          0,
          1006736.37,
          317852.01,
          { value: 869357.44, itemStyle: { color: "#2B65D9" } }
        ],
        itemStyle: {
          color: "#EB382A"
        },
        waterfallPlaceholder: true
      }
    ],
    tooltip: {
      trigger: "item",
      axisPointer: { type: "shadow" },
      order: "valueDesc"
    },
    backgroundColor: "transparent",
    title: { text: "Scoop Waterfall Chart" },
    xAxis: {
      type: "category",
      data: [
        "Beginning Pipeline",
        "New",
        "Moved In",
        "Moved Out",
        "Increased",
        "Decreased",
        "Re-opened",
        "Closed Won",
        "Lost",
        "Ending Pipeline"
      ],
      axisLabel: { color: "#ced1db" },
      nameTextStyle: { color: "#ced1db" },
      axisLine: { lineStyle: { color: "#ced1db" } }
    },
    yAxis: [
      {
        name: "Amount",
        type: "value",
        alignTicks: true,
        axisLabel: { color: "#ced1db" },
        position: "left",
        nameTextStyle: { color: "#ced1db" },
        axisLine: { lineStyle: { color: "#ced1db" } }
      }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prevChartData => {
        let newData = JSON.parse(JSON.stringify(prevChartData)); // Deep clone
        newData.series[0].data[3] = Math.random() * (3000000 - 1000000) + 1000000; // Set a random value
        return newData;
      });
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);
  

  return <ReactECharts option={chartData} style={{ height: 400, width: '100%' }} />;
};

export default ChartComponentOne;
