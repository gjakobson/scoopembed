// ChartComponent.js
import React from 'react';
import ReactECharts from 'echarts-for-react';

const ChartComponentOne = () => {
  const options = {
    title: {
      text: 'Scoop basic chart test 1'
    },
    tooltip: {},
    xAxis: {
      data: ['Shirt', 'Cardigan', 'Chiffon shirt', 'Pants', 'Heels', 'Socks']
    },
    yAxis: {},
    series: [{
      name: 'Sales',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }]
  };

  return <ReactECharts option={options} style={{ height: 400, width: '100%' }} />;
};

export default ChartComponentOne;
