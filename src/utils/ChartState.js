import dayjs from "dayjs";
import numeral from "numeral";
import {areEquals, combineFilters, packFilter} from "./Filter";

/**
 * Class contains the following:
 *
 * config:                      current chart configuration settings
 * result:                      last server result
 * series:                      current data series
 * drillAttributes:             possible drill attributes
 * valueAxis:                   the value axis
 * categories:                  current categories
 * allowedKPIs:                 KPIs that can be selected and work with existing drill attributes and categories
 * allowedReportSeriesTables    reportSeriesTables that have drill attribute and category
 */
const calculatePadding = (inputString) => {
    const textSize = 4;
    const minLength = 20
    if (!inputString || inputString.length < minLength) return 0
    return (inputString.length - minLength) * textSize;
}

export default class ChartState {
    static getDefaultConfig() {
        return {
            chartTitle: '',
            selectedItems: [],
            selectedDates: new Map(),
            seriesType: "column",
            stacked: true,
            seriesTypeMap: new Map(),
            categoryAxis: "Time",
            period: "Daily",
            timeRange: "Last Year",
            calendarType: "Rolling",
            drillAttribute: undefined,
            worksheetColumns: [],
            selectedTableColumns: [],
            nonPivotColumnsOrder: [],
            pivotColumnsOrder: [],
            selectedTableKpis: [],
            usedDrillAttributes: [],
            from: null,
            to: null,
            filter: null,
            savedFilter: null,
            view: 'chart',
            loading: false,
            worksheetID: undefined,
            rangeName: undefined,
            sheetName: undefined,
            selectedWorksheetName: undefined,
            activePrompts: [],
            tableState: {
                nonPivotState: {rowGroupCols: []},
                pivotState: {rowGroupCols: [], pivotCols: []},
                pinnedCols: [],
            },
            selectedTables: [],
            displayRows: 50,
            tableTimeSeries: true,
            disableTimeSeries: false,
            allowedKPIs: undefined,
            allowedReportSeriesTables: undefined,
            styleOverrides: {xAxis: {splitLine: {show: false}}},
            themeID: undefined
        };
    }

    constructor(server, config, setConfig) {
        this.server = server;
        this.categories = undefined;
        this.config = config;
        this.setConfig = setConfig;
        this.previousResult = config.result;
    }

    hasData() {
        return this.series?.length > 0
    }

    clear() {
        this.series = null;
        this.result = null;
        const newConfig = ChartState.getDefaultConfig()
        this.config = {...newConfig};
        this.setConfig({...newConfig});
    }

    processData(sType, result) {
        let newSeries;
        if (sType === "scatter") {
            newSeries = this.processScatter(sType, result);
        } else {
            newSeries = [];
            for (let i = 0; i < result.series?.length; i++) {
                let metric;
                for (let j = 0; j < result.metrics?.length; j++) {
                    if (result.metrics[j].name === result.series[i].metric) {
                        metric = result.metrics[j];
                        break;
                    }
                }
                let s = {
                    type: sType,
                    metric: result.series[i].metric,
                    categoryIndex: result.categories?.length === 1 ? i : result.series[i].categoryIndex,
                    category: result.categories?.length === 1 && result.categories[0] === "All" ? null : result.categories[result.series[i].categoryIndex],
                    name: result.series[i].name,
                    format: metric ? metric.format : null,
                    data: []
                }
                if (sType !== "bar") {
                    s.yAxisIndex = result.series[i].axis;
                } else {
                    s.xAxisIndex = result.series[i].axis;
                }
                if (result.categoryAxisValues) {
                    this.categoryAxisValues = result.categoryAxisValues;
                    for (let j = 0; j < result.series[0].data?.length; j++) {
                        s.data.push(result.series[i].data[j]);
                    }
                } else {
                    for (let j = 0; j < result.dates?.length; j++) {
                        s.data.push([result.dates[j], result.series[i].data[j]]);
                    }
                }
                newSeries.push(s);
            }
        }
        var newAxes = [];
        for (var i = 0; i < result.axes?.length; i++) {
            const axis = result.axes[i];
            var chartAxis = {
                name: axis.name ? axis.name : undefined, type: 'value', alignTicks: true, axisLabel: {
                    formatter: val => numeral(val).format(axis.format)
                },
            }
            if (sType !== "scatter") {
                if (sType === "bar") {
                    chartAxis.position = 'top';
                    chartAxis.axisLabel.align = 'bottom';
                } else {
                    chartAxis.position = 'left';
                    chartAxis.nameTextStyle = {padding: [0, 0, 0, calculatePadding(axis.name)]};
                    chartAxis.axisLabel.align = 'right';
                }
                if (i > 0) {
                    if (sType === "bar") {
                        chartAxis.position = 'bottom';
                        chartAxis.axisLabel.align = 'top';
                    } else {
                        chartAxis.position = 'right';
                        chartAxis.nameTextStyle = {padding: [0, calculatePadding(axis.name), 0, 0]};
                        chartAxis.axisLabel.align = 'left';
                    }
                    if (i > 1) {
                        chartAxis.offset = 80 * (i - 1);
                    }
                }
            }
            newAxes.push(chartAxis);
        }
        this.series = newSeries;
        this.valueAxis = newAxes;
        if (!this.config.worksheetID) this.drillAttributes = result.drillAttributes;
        this.changeDrillAttributes = result.changeDrillAttributes;
        this.categories = result.categories;
        this.series = newSeries;
        if (result.categoryAxis) this.config.categoryAxis = result.categoryAxis;
        if (sType === this.config.seriesType && newSeries && newSeries?.length > 0) this.configureSeries(sType, this.config);
        this.config.allowedKPIs = result.allowedKPIs
        this.config.allowedReportSeriesTables = result.allowedReportSeriesTables
        this.setConfig({...this.config});
        return newSeries;
    }

    processScatter(sType, result) {
        if (result.metrics?.length < 2) return;
        var categorySeries = [];
        for (var cat = 0; cat < result.categories?.length; cat++) {
            var name = result.categories?.length === 1 && result.categories[0] === "All" ? null : result.categories[result.series[cat].categoryIndex];
            var s = {
                type: sType,
                categoryIndex: result.categories?.length === 1 ? 0 : result.series[cat].categoryIndex,
                name: name,
                data: []
            }
            var series = [];
            var countSeries = 0;
            for (var metricIndex = 0; metricIndex < 2; metricIndex++) {
                for (var seriesIndex = 0; seriesIndex < result.series?.length; seriesIndex++) {
                    if (result.metrics[metricIndex].name !== result.series[seriesIndex].metric) continue;
                    if (result.series[seriesIndex].categoryIndex !== cat) continue;
                    series[metricIndex] = result.series[seriesIndex];
                    countSeries++;
                }
            }
            if (countSeries === 2) {
                for (var row = 0; row < series[0].data?.length; row++) {
                    s.data.push([series[0].data[row], series[1].data[row]]);
                }
                var metric0 = this.getMetric(series[0].metric);
                var metric1 = this.getMetric(series[1].metric);
                s.formats = ["", ""];
                if (metric0) {
                    s.formats[0] = metric0.format;
                }
                if (metric1) {
                    s.formats[1] = metric1.format;
                }
            } else {
                if (series[0]) {
                    for (var row = 0; row < series[0].data?.length; row++) {
                        s.data.push([series[0].data[row], 0]);
                    }
                } else {
                    for (row = 0; row < series[1].data?.length; row++) {
                        s.data.push([0, series[1].data[row]]);
                    }
                }
            }
            categorySeries.push(s);
        }
        return categorySeries;
    }

    processServerResult(serverResult, object, loadingCallback) {
        if (serverResult === "No time series found") {
            object.config.loading = false;
            this.setConfig({...object.config});
            return;
        }
        object.result = serverResult;
        object.processData(object.config.seriesType, serverResult);
        object.config.loading = false;
        if (serverResult.timeSeriesNotFound) {
            object.config.tableTimeSeries = false;
            object.config.disableTimeSeries = true;
        }
        this.setConfig({...object.config});
        if (loadingCallback) loadingCallback();
    }

    getResults(config, loadingCallback, prompts) {
        if (!this.server) return;
        this.config = config;
        this.config.loading = true;
        var {
          calendarType,
          selectedItems,
          period,
          drillAttribute,
          filter,
          savedFilter,
          selectedDates,
          categoryAxis,
          timeRange,
          view,
          worksheetID,
          rangeName
        } = config;
        let metrics = [];
        // console.log(selectedItems)
        if (!worksheetID) {
          for (let i = 0; i < selectedItems?.length; i++) {
            let metric;
            if (selectedItems[i].kpi) {
              metric = {
                metricName: selectedItems[i].kpi, reportSeriesTableID: selectedItems[i].reportSeriesTableID,
              }
            } else {
              metric = {
                measureName: selectedItems[i].columnName,
                reportSeriesTableID: selectedItems[i].reportSeriesTableID,
              }
            }
            if (selectedDates) {
              let byDate = selectedDates.get(selectedItems[i].reportSeriesTableID + ":" + selectedItems[i].columnName);
              if (byDate) {
                metric.byDate = byDate;
              }
            }
            metrics.push(metric);
          }
        } else {
          selectedItems.forEach(item => {
            metrics.push({measureName: item.columnName})
          })
        }
        let action;
        if (categoryAxis === "Time" && !config.disableTimeSeries) {
          action = {
            "action": "getTimeSeries",
            "metrics": metrics,
            "calendarType": calendarType,
            "period": period,
            "split": view === 'chart',
            "process": false
          }
        } else {
          action = {
            "action": "getDataset",
            "metrics": metrics,
            "period": period,
            "categoryAxis": categoryAxis
          };
        }
        if (worksheetID && rangeName) {
          action.worksheetID = worksheetID;
          action.rangeName = rangeName;
        }
        if (timeRange) {
          action.timeRange = timeRange;
          if (action.timeRange === "Custom") {
            if (this.config.from) {
              action.start = dayjs(this.config.from).format('MM/DD/YYYY')
            }
            if (this.config.to) {
              action.end = dayjs(this.config.to).format('MM/DD/YYYY')
            }
          }
        }
        if (prompts?.length > 0) {
          const validPrompts = []
          prompts.forEach(prompt => {
            if (Array.isArray(prompt)) {
              prompt.forEach(p => {
                if (p.filterValue.values.length > 0 && p.filterValue.values[0] !== 'All') validPrompts.push(p)
              })
            } else {
              if (prompt.filterValue.values.length > 0 && prompt.filterValue.values[0] !== 'All') validPrompts.push(prompt)
            }
          })
          action.prompts = packFilter(validPrompts)
        }
        if (drillAttribute) action.drillAttribute = drillAttribute;
        if (filter || savedFilter) {
          if (savedFilter) {
            action.filter = combineFilters(filter, savedFilter.filter);
          } else {
            action.filter = filter;
          }
        } else {
          action.filter = undefined;
        }
        this.server.postData(
          action,
          (result, object) => {
            // console.log("got result back: ", result.dataset);
            // console.log("pre result: ", this.previousDataset);
            //
            // // Sort function for deep comparison
            // const sortDataset = (dataset) => {
            //     if (!dataset) return null;
            //     if (dataset.metrics) {
            //         dataset.metrics.sort((a, b) => a.name.localeCompare(b.name));
            //     }
            //     if (dataset.series) {
            //         dataset.series.sort((a, b) => a.name.localeCompare(b.name));
            //         dataset.series.forEach(series => {
            //             if (series.data && Array.isArray(series.data)) {
            //                 series.data.sort((a, b) => a - b);
            //             }
            //         });
            //     }
            //     return dataset;
            // };
            //
            // const sortedNewDataset = sortDataset(_.cloneDeep(result.dataset));
            // const sortedPreviousDataset = this.previousDataset ? sortDataset(_.cloneDeep(this.previousDataset)) : null;

            // if (!_.isEqual(sortedNewDataset, sortedPreviousDataset)) {
            //     this.previousDataset = sortedNewDataset; // Update previousDataset
            //
            // } else {
            //     console.log("same so skipping");
            // }

              if (config.worksheetID) this.drillAttributes = result.sheetColumns?.filter(col => !col.isMeasure).map(col => col.columnName);
              if (result.dataset) {
                  this.processServerResult(result.dataset, object, loadingCallback);
              } else {
                  this.processServerResult(result, object, loadingCallback);
              }
          },
          this,
          null,
          true
        );
      }

    getTheme(themeID) {
        if (this.workspaceMetadata && this.workspaceMetadata.themes) {
            for (let themeIndex = 0; themeIndex < this.workspaceMetadata.themes.length; themeIndex++) {
                if (this.workspaceMetadata.themes[themeIndex].themeID === themeID) {
                    return this.workspaceMetadata.themes[themeIndex];
                }
            }
        }
        return undefined;
    }

    configureSeries(newSeriesType, config) {
        if (!this.series) return;
        if (!newSeriesType) newSeriesType = "column";
        var numDataPoints = this.series[0].data?.length;
        this.config = config;
        if ((this.config.seriesType === "scatter" && newSeriesType !== "scatter") || (this.config.seriesType !== "scatter" && newSeriesType === "scatter") || (this.config.seriesType === "bar" && newSeriesType !== "bar") || (this.config.seriesType !== "bar" && newSeriesType === "bar")) {
            this.series = this.processData(newSeriesType, this.result);
        }
        this.config.seriesType = newSeriesType;
        let numSeries = this.series?.length;
        let newSeries = [];
        for (let i = 0; i < numSeries; i++) {
            if (this.series[i].waterfallPlaceholder) {
                continue;
            }
            newSeries.push(this.series[i]);
        }
        this.series = newSeries;
        numSeries = this.series?.length;
        for (let i = 0; i < numSeries; i++) {
            var t = this.config.seriesTypeMap ? this.config.seriesTypeMap.get(this.series[i].metric) : undefined;
            var type = t ? t : this.config.seriesType;
            switch (type) {
                case "bar":
                case "column":
                    this.series[i].type = "bar";
                    if (this.config.stacked) {
                        if (this.categories && this.categories?.length > 1) {
                            this.series[i].stack = this.series[i].metric;
                        } else {
                            this.series[i].stack = "All";
                        }
                    } else {
                        this.series[i].stack = undefined;
                    }
                    this.series[i].itemStyle = {
                        emphasis: {
                            barBorderRadius: [3, 3]
                        },
                        normal: {
                            barBorderRadius: [3, 3, 3, 3]
                        }
                    }
                    this.series[i].areaStyle = undefined;
                    if (numDataPoints && numDataPoints > 50) {
                        this.series[i].barGap = '0%';
                        this.series[i].barCategoryGap = '40%';
                    } else if (numDataPoints && numDataPoints > 20) {
                        this.series[i].barGap = '10%';
                        this.series[i].barCategoryGap = '40%';
                    } else {
                        this.series[i].barGap = '10%';
                        this.series[i].barCategoryGap = '40%';
                    }
                    break;
                case "line":
                    this.series[i].type = "line";
                    this.series[i].stack = undefined;
                    this.series[i].areaStyle = undefined;
                    this.series[i].barGap = undefined;
                    this.series[i].barCategoryGap = undefined;
                    break;
                case "area":
                    this.series[i].type = "line";
                    this.series[i].stack = "all";
                    this.series[i].areaStyle = {};
                    this.series[i].barGap = undefined;
                    this.series[i].barCategoryGap = undefined;
                    break;
                case "scatter":
                    this.series[i].type = "scatter";
                    this.series[i].stack = undefined;
                    this.series[i].areaStyle = {};
                    this.series[i].barGap = undefined;
                    this.series[i].barCategoryGap = undefined;
                    break;
                case "waterfall":
                    this.series[i].type = "bar";
                    this.series[i].stack = "all";
                    this.series[i].itemStyle = {color: 'transparent'};
                    let positive = {
                        name: "positive",
                        type: "bar",
                        stack: "all",
                        data: [],
                        itemStyle: {color: '#009262'},
                        waterfallPlaceholder: true
                    }
                    let negative = {
                        name: "negative",
                        type: "bar",
                        stack: "all",
                        data: [],
                        itemStyle: {color: '#EB382A'}, //C33025
                        waterfallPlaceholder: true
                    }
                    let lastVal = 0;
                    let newData = [];
                    for (let j = 0; j < this.series[i].data.length; j++) {
                        if (this.series[i].data[j] >= 0) {
                            if (j === 0 || j === this.series[i].data.length - 1) {
                                positive.data.push({value: this.series[i].data[j], itemStyle: {color: '#2B65D9'}});
                            } else {
                                positive.data.push(this.series[i].data[j]);
                            }
                            negative.data.push(0);
                            newData.push(lastVal);
                        } else {
                            if (j === 0 || j === this.series[i].data.length - 1) {
                                negative.data.push({value: -this.series[i].data[j], itemStyle: {color: '#2B65D9'}});
                            } else {
                                negative.data.push(-this.series[i].data[j]);
                            }
                            positive.data.push(0);
                            newData.push(lastVal + this.series[i].data[j]);
                        }
                        lastVal += this.series[i].data[j];
                    }
                    this.series[i].data = newData;
                    this.series.push(positive);
                    this.series.push(negative);
                    break;
                case 'pie':
                case 'donut':
                    this.series[i].type = "pie";
                    this.series[i].stack = "all";
                    this.series[i].areaStyle = {};
                    this.series[i].barGap = undefined;
                    this.series[i].barCategoryGap = undefined;
                    if (this.series[i].data.some(d => !d.name)) {
                        this.series[i].data = [...this.series[i].data].map((d, j) => (
                            {value: d, name: this.categoryAxisValues ? this.categoryAxisValues[j] : ''})
                        )
                    }
                    break;
                case 'pictorialBar':
                    this.series[i].type = 'pictorialBar';
                    break;
                default:
                    break;
            }
        }
        if (this.categories) {
            let catLegendData = [];
            let catIndices = [];
            for (let i = 0; i < this.series?.length; i++) {
                if (this.categories?.length > 1 && (this.config.seriesType === "bar" || this.config.seriesType === "column") && this.config.stacked) {
                    if (catIndices.indexOf(this.series[i].categoryIndex) < 0) {
                        var item = {
                            name: this.series[i].name, icon: 'circle',
                        }
                        catLegendData.push(item);
                        catIndices.push(this.series[i].categoryIndex);
                    }
                } else {
                    item = {
                        name: this.series[i].name, icon: 'circle',
                    }
                    catLegendData.push(item);
                    catIndices.push(i);
                }
            }
            if (catLegendData.length > 10) catLegendData = catLegendData.slice(0, 10)
            this.categoryLegendData = catLegendData;
        }
        this.setConfig({...config})
    }

    getOption(themeId) {
        let categoryAxisSettings;
        if (this.categoryAxis === "Time") {
            categoryAxisSettings = {name: "Date", type: "time"};
        } else {
            categoryAxisSettings = {name: this.categoryAxis, type: "category", data: this.categoryAxisValues}
            if (this.categoryAxisValues) {
                if (this.categoryAxisValues.length > 4) categoryAxisSettings.axisLabel = {rotate: 45}
                if (this.categoryAxisValues.length > 10) categoryAxisSettings.axisLabel = {rotate: 90}
            }
        }
        let theme;
        if (themeId) {
            this.config.themeID = themeId
            theme = this.getTheme(themeId)
        } else {
            if (this.config.themeID) theme = this.getTheme(this.config.themeID)
            else theme = undefined
        }
        const option = {
            animation: false,
            series: this.series,
            tooltip: {
                trigger: 'item',
                axisPointer: {type: 'shadow'},
                order: "valueDesc"
            }, legend: {
                orient: 'horizontal',
                top: 'bottom',
                data: this.categoryLegendData,
            },
            backgroundColor: 'transparent',
            title: {
                text: this.config.chartTitle
            }
        };
        let darkTheme = false;
        if (theme) {
            if (theme.colorScheme && theme.colorScheme.backgroundColor) {
                option.backgroundColor = theme.colorScheme.backgroundColor;
                if (theme.colorScheme.darkTheme) {
                    darkTheme = true;
                    option.textStyle = {color: "#FFFFFF"};
                    option.legend.textStyle = {color: "#FFFFFF"};
                }
            }
            option.color = theme.colorScheme.colors.map(c => c.val)
        }
        if (this.config.seriesType === 'waterfall') {
            option.legend = undefined;
        } else if ((this.config.seriesType !== "bar" && this.config.seriesType !== "column") || !this.config.stacked) {
            option.legend.formatter = function (name) {
                return name
            };
        } else {
            option.legend.formatter = function (name) {
                var index = name.indexOf(' / ');
                if (index >= 0) {
                    return name.slice(index + 3);
                } else {
                    return name;
                }
            }
        }
        if (this.config.seriesType === "bar") {
            option.yAxis = categoryAxisSettings;
            option.xAxis = this.valueAxis;
        } else if (this.config.seriesType === "scatter") {
            if (this.valueAxis[0].name === this.result.metrics[0].name) {
                option.yAxis = this.valueAxis[this.valueAxis?.length === 1 ? 0 : 1];
                option.xAxis = this.valueAxis[0];
            } else if (this.valueAxis.length === 1) {
                option.yAxis = this.valueAxis[0];
                option.xAxis = this.valueAxis[0];
            } else {
                option.yAxis = this.valueAxis[0];
                option.xAxis = this.valueAxis[1];
            }
            option.xAxis.position = 'bottom';
            option.yAxis.position = 'left';
        } else {
            option.xAxis = categoryAxisSettings;
            option.yAxis = this.valueAxis;
        }
        if (darkTheme) {
            this.setAxisTheme(option.xAxis, "#FFFFFF");
            if (Array.isArray(option.yAxis)) {
                for (let i = 0; i < option.yAxis.length; i++) {
                    this.setAxisTheme(option.yAxis[i], "#FFFFFF");
                }
            } else {
                this.setAxisTheme(option.yAxis, "#FFFFFF");
            }
        } else {
            this.setAxisTheme(option.xAxis, "#6E7079");
            if (Array.isArray(option.yAxis)) {
                for (let i = 0; i < option.yAxis.length; i++) {
                    this.setAxisTheme(option.yAxis[i], "#6E7079");
                }
            } else {
                this.setAxisTheme(option.yAxis, "#6E7079");
            }
        }
        option.tooltip.formatter = (event) => this.tooltipFormatter(event)
        return option;
    }

    setAxisTheme(axis, color) {
        axis.nameTextStyle = {color: color};
        axis.axisLabel = {color: color};
        axis.axisLine = {lineStyle: {color: color}};
    }

    tooltipFormatter(event) {
        if (this.config.seriesType === "scatter") {
            let s = event.marker + "<strong>" + (this.config.categoryAxis === "Time" ? this.result.dates[event.dataIndex] : this.result.categoryAxisValues[event.dataIndex]) + "</strong>" + (this.categories?.length > 1 ? "</br>" + event.seriesName : "") + "</br>";
            if (this.series[event.seriesIndex].formats && this.series[event.seriesIndex].formats?.length === 2) {
                s += numeral(event.data[0]).format(this.series[event.seriesIndex].formats[0]);
                s += ", " + numeral(event.data[1]).format(this.series[event.seriesIndex].formats[1]);
            } else {
                s += numeral(event.data[0]).format();
                s += ", " + numeral(event.data[1]).format();
            }
            return s;
        } else {
            let s = event.marker + "<strong>" + (this.config.categoryAxis === "Time" ? event.data[0] : this.categoryAxisValues[event.dataIndex]) +
                (this.config.seriesType !== 'waterfall' ? "</strong></br>" + event.seriesName + "</br>" : "</br>");
            let value = this.config.categoryAxis === "Time" ? event.data[1] : typeof (event.data) === 'number' ? event.data : event.data.value;
            s += numeral(value).format(this.series[event.seriesIndex].format);
            return s;
        }
    }

    getMetric(metricName) {
        if (!this.result || !this.result.metrics) return null;
        for (var i = 0; i < this.result.metrics?.length; i++) {
            if (this.result.metrics[i].name === metricName) return this.result.metrics[i];
        }
        return null;
    }

    getSeries(seriesName) {
        if (!this.series) return null;
        for (var i = 0; i < this.series?.length; i++) {
            if (this.series[i].name === seriesName) return this.series[i];
        }
        return null;
    }

    addFilterItem(filterItem) {
        if (this.config.filter === null) {
            this.config.filter = filterItem;
            return filterItem;
        } else if (this.config.filter.boperator) {
            this.config.filter.filters.push(filterItem);
            return this.config.filter;
        } else {
            var newFilter = {
                boperator: "And", filters: [this.config.filter, filterItem]
            }
            this.config.filter = newFilter;
            return newFilter;
        }
    }

    removeFilterItem(filterItem) {
        if (this.config.filter === null) {
            return null;
        } else if (this.config.filter.boperator) {
            var newFilters = [];
            for (var i = 0; i < this.config.filter.filters?.length; i++) {
                if (!areEquals(this.config.filter.filters[i], filterItem)) {
                    newFilters.push(this.config.filter.filters[i])
                }
            }
            if (newFilters?.length === 0) {
                this.config.filter = null;
                return null;
            }
            this.config.filter.filters = newFilters;
        } else {
            if (areEquals(this.config.filter, filterItem)) {
                this.config.filter = null;
                return null;
            }
        }
        return this.config.filter;
    }

    getAvailableDrillAttributes() {
        if (this.drillAttributes) {
            return this.drillAttributes.filter(att => !this.config.usedDrillAttributes.includes(att))
        }
        return []
    }

    setChartStateConfig(config) {
        this.config = config
    }
}
