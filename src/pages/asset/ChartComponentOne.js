// ChartComponent.js
import React from 'react';
import ReactECharts from 'echarts-for-react';

const ChartComponentOne = () => {

  const options = {
    "animation": false,
    "series": [
      {
        "type": "bar",
        "metric": "Amount",
        "categoryIndex": 0,
        "category": null,
        "name": "Amount",
        "data": [
          0,
          2772411.63,
          3008518.55,
          2434785.4399999995,
          2434785.4399999995,
          2157295.8199999994,
          2157295.8199999994,
          1173309.4499999993,
          855457.4399999992,
          -13900.000000000698
        ],
        "yAxisIndex": 0,
        "stack": "all",
        "itemStyle": {
          "color": "transparent"
        }
      },
      {
        "name": "positive",
        "type": "bar",
        "stack": "all",
        "data": [
          {
            "value": 2772411.63,
            "itemStyle": {
              "color": "#2B65D9"
            }
          },
          236106.91999999998,
          106469.4,
          0,
          148920.38,
          0,
          22750,
          0,
          0,
          0
        ],
        "itemStyle": {
          "color": "#009262"
        },
        "waterfallPlaceholder": true
      },
      {
        "name": "negative",
        "type": "bar",
        "stack": "all",
        "data": [
          0,
          0,
          0,
          680202.51,
          0,
          426410,
          0,
          1006736.37,
          317852.01,
          {
            "value": 869357.44,
            "itemStyle": {
              "color": "#2B65D9"
            }
          }
        ],
        "itemStyle": {
          "color": "#EB382A"
        },
        "waterfallPlaceholder": true
      }
    ],
    "tooltip": {
      "trigger": "item",
      "axisPointer": {
        "type": "shadow"
      },
      "order": "valueDesc"
    },
    "backgroundColor": "transparent",
    "title": {"text" : "Scoop Waterfall Chart"},
    "xAxis": {
      "type": "category",
      "data": [
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
      "axisLabel": {
        "color": "#6E7079"
      },
      "nameTextStyle": {
        "color": "#6E7079"
      },
      "axisLine": {
        "lineStyle": {
          "color": "#6E7079"
        }
      }
    },
    "yAxis": [
      {
        "name": "Amount",
        "type": "value",
        "alignTicks": true,
        "axisLabel": {
          "color": "#6E7079"
        },
        "position": "left",
        "nameTextStyle": {
          "color": "#6E7079"
        },
        "axisLine": {
          "lineStyle": {
            "color": "#6E7079"
          }
        }
      }
    ]
  }

  return <ReactECharts option={options} style={{ height: 400, width: '100%' }} />;
};

export default ChartComponentOne;
