import dayjs from "dayjs";
import numeral from "numeral";
import {areEquals, combineFilters, packFilter} from "./Filter";
import {DEFAULT_CHART_PREFERENCES} from "@/utils/styleConsts";
import {cloneDeep} from "lodash";
import {backwardsFlag} from "@/pages/api/InsightAPI";
import {SORTING} from "@/utils/utils";
import {getFormatter} from "@/utils/kpiUtils";

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
            seriesType: 'column',
            stacked: true,
            seriesTypeMap: new Map(),
            categoryAxis: 'Time',
            sorting: {
                sortBy: '',
                sortOrder: SORTING.NAT,
            },
            period: 'Daily',
            timeRange: 'Last Year',
            calendarType: 'Rolling',
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
                nonPivotState: { rowGroupCols: [] },
                pivotState: { rowGroupCols: [], pivotCols: [] },
                pinnedCols: [],
            },
            selectedTables: [],
            displayRows: 'All',
            tableTimeSeries: true,
            disableTimeSeries: false,
            allowedKPIs: undefined,
            allowedReportSeriesTables: undefined,
            styleOverrides: cloneDeep(DEFAULT_CHART_PREFERENCES),
            themeID: undefined,
            kpiCompareType: 'percentage',
            kpiCompareTarget: undefined,
            metricsOrder: [],
            backwardsFlag: backwardsFlag,
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
        let newSeries
        if (sType === 'scatter') {
            newSeries = this.processScatter(sType, result)
        } else {
            newSeries = []
            for (let i = 0; i < result.series?.length; i++) {
                let metric
                for (let j = 0; j < result.metrics?.length; j++) {
                    if (result.metrics[j].name === result.series[i].metric) {
                        metric = result.metrics[j]
                        break
                    }
                }
                let s = {
                    type: sType,
                    metric: result.series[i].metric,
                    categoryIndex:
                        result.categories?.length === 1 ? i : result.series[i].categoryIndex,
                    category:
                        result.categories?.length === 1 && result.categories[0] === 'All'
                            ? null
                            : result.categories[result.series[i].categoryIndex],
                    name: result.series[i].name,
                    format: metric ? metric.format : null,
                    data: [],
                }
                if (sType !== 'bar') {
                    s.yAxisIndex = result.series[i].axis
                } else {
                    s.xAxisIndex = result.series[i].axis
                }
                if (result.categoryAxisValues) {
                    this.categoryAxisValues = result.categoryAxisValues
                    for (let j = 0; j < result.series[0].data?.length; j++) {
                        s.data.push(result.series[i].data[j])
                    }
                } else {
                    for (let j = 0; j < result.dates?.length; j++) {
                        s.data.push([result.dates[j], result.series[i].data[j]])
                    }
                }
                newSeries.push(s)
            }
        }
        var newAxes = []
        for (var i = 0; i < result.axes?.length; i++) {
            const axis = result.axes[i]
            var chartAxis = {
                name: axis.name ? this.axisNameFormatter(axis.name) : undefined,
                type: 'value',
                alignTicks: true,
                axisLabel: {
                    formatter: (val) => numeral(val).format(axis.format),
                },
            }
            if (sType !== 'scatter') {
                if (this.config.metricsOrder.length > 0) {
                    let pos = this.config.metricsOrder.find((m) => {
                        if (axis.name.includes('/')) {
                            return (
                                m.name.includes(axis.name.split('/')[0].trim()) &&
                                m.name.includes(axis.name.split('/')[1].trim())
                            )
                        } else {
                            return m.name === axis.name
                        }
                    })?.position
                    if (!pos) {
                        if (i > 0) {
                            pos = 'right'
                        } else {
                            pos = 'left'
                        }
                    }
                    if (sType === 'bar') {
                        if (pos === 'left') pos = 'top'
                        if (pos === 'right') pos = 'bottom'
                        chartAxis.position = pos
                        chartAxis.axisLabel.align = pos === 'bottom' ? 'top' : 'bottom'
                    } else {
                        chartAxis.position = pos
                        chartAxis.nameTextStyle = {
                            padding: [0, 0, 0, calculatePadding(axis.name)],
                        }
                        chartAxis.axisLabel.align = pos === 'right' ? 'left' : 'right'
                    }
                } else {
                    if (sType === 'bar') {
                        chartAxis.position = 'top'
                        chartAxis.axisLabel.align = 'bottom'
                    } else {
                        chartAxis.position = 'left'
                        chartAxis.nameTextStyle = {
                            padding: [0, 0, 0, calculatePadding(axis.name)],
                        }
                        chartAxis.axisLabel.align = 'right'
                    }
                    if (i > 0) {
                        if (sType === 'bar') {
                            chartAxis.position = 'bottom'
                            chartAxis.axisLabel.align = 'top'
                        } else {
                            chartAxis.position = 'right'
                            chartAxis.nameTextStyle = {
                                padding: [0, calculatePadding(axis.name), 0, 0],
                            }
                            chartAxis.axisLabel.align = 'left'
                        }
                        if (i > 1) {
                            chartAxis.offset = 80 * (i - 1)
                        }
                    }
                }
            }
            newAxes.push(chartAxis)
        }
        this.series = newSeries
        this.valueAxis = newAxes
        if (result.drillAttributes) this.drillAttributes = result.drillAttributes
        this.changeDrillAttributes = result.changeDrillAttributes
        this.categories = result.categories
        this.series = newSeries
        if (result.categoryAxis) this.config.categoryAxis = result.categoryAxis
        if (sType === this.config.seriesType && newSeries && newSeries?.length > 0)
            this.configureSeries(sType, this.config)
        this.config.allowedKPIs = result.allowedKPIs
        this.config.allowedReportSeriesTables = result.allowedReportSeriesTables
        this.setConfig({ ...this.config })
        return newSeries
    }

    processScatter(sType, result) {
        if (result.metrics?.length < 2) return
        var categorySeries = []
        for (var cat = 0; cat < result.categories?.length; cat++) {
            var name =
                result.categories?.length === 1 && result.categories[0] === 'All'
                    ? null
                    : result.categories[result.series[cat].categoryIndex]
            var s = {
                type: sType,
                categoryIndex:
                    result.categories?.length === 1 ? 0 : result.series[cat].categoryIndex,
                name: name,
                data: [],
            }
            var series = []
            var countSeries = 0
            for (var metricIndex = 0; metricIndex < 2; metricIndex++) {
                for (var seriesIndex = 0; seriesIndex < result.series?.length; seriesIndex++) {
                    if (result.metrics[metricIndex].name !== result.series[seriesIndex].metric)
                        continue
                    if (result.series[seriesIndex].categoryIndex !== cat) continue
                    series[metricIndex] = result.series[seriesIndex]
                    countSeries++
                }
            }
            if (countSeries === 2) {
                for (var row = 0; row < series[0].data?.length; row++) {
                    s.data.push([series[0].data[row], series[1].data[row]])
                }
                var metric0 = this.getMetric(series[0].metric)
                var metric1 = this.getMetric(series[1].metric)
                s.formats = ['', '']
                if (metric0) {
                    s.formats[0] = metric0.format
                }
                if (metric1) {
                    s.formats[1] = metric1.format
                }
            } else {
                if (series[0]) {
                    for (var row = 0; row < series[0].data?.length; row++) {
                        s.data.push([series[0].data[row], 0])
                    }
                } else {
                    for (row = 0; row < series[1].data?.length; row++) {
                        s.data.push([0, series[1].data[row]])
                    }
                }
            }
            categorySeries.push(s)
        }
        return categorySeries
    }

    processServerResult(serverResult, object, loadingCallback) {
        if (serverResult === 'No time series found') {
            object.config.loading = false
            this.setConfig({ ...object.config })
            return
        }
        object.result = serverResult
        object.processData(object.config.seriesType, serverResult)
        object.config.loading = false
        if (serverResult.timeSeriesNotFound) {
            object.config.tableTimeSeries = false
            object.config.disableTimeSeries = true
        }
        this.setConfig({ ...object.config })
        if (loadingCallback) loadingCallback()
    }

    handleServerCall(result, object, config, loadingCallback) {
        if (result.dataset) {
            this.processServerResult(result.dataset, object, loadingCallback)
        } else {
            this.processServerResult(result, object, loadingCallback)
        }
    }

    getResults(config, loadingCallback, prompts) {
        if (!this.server) return
        this.config = config
        this.config.loading = true
        let {
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
            sortColumns,
            displayRows,
        } = config
        let metrics = []
        for (let i = 0; i < selectedItems?.length; i++) {
            let metric
            if (selectedItems[i].worksheetID) {
                metric = selectedItems[i]
            } else if (selectedItems[i].kpi) {
                metric = {
                    metricName: selectedItems[i].kpi,
                    reportSeriesTableID: selectedItems[i].reportSeriesTableID,
                }
            } else {
                metric = {
                    measureName: selectedItems[i].columnName,
                    reportSeriesTableID: selectedItems[i].reportSeriesTableID,
                }
            }
            if (selectedDates) {
                if (selectedItems[i].worksheetID) {
                    let byDate = selectedDates.get(
                        selectedItems[i].worksheetID + ':' + selectedItems[i].measureName
                    )
                    if (byDate) metric.byDate = byDate
                } else {
                    let byDate = selectedDates.get(
                        selectedItems[i].reportSeriesTableID + ':' + selectedItems[i].columnName
                    )
                    if (byDate) metric.byDate = byDate
                }
            }
            metrics.push(metric)
        }
        let action
        if (categoryAxis === 'Time' && !config.disableTimeSeries) {
            action = {
                action: 'getTimeSeries',
                metrics: metrics,
                calendarType: calendarType,
                period: period,
                split: view === 'chart',
                process: false,
            }
        } else {
            action = {
                action: 'getDataset',
                metrics: metrics,
                period: period,
                categoryAxis: categoryAxis,
                sortColumns: sortColumns
            }
        }
        if (timeRange) {
            action.timeRange = timeRange
            if (action.timeRange === 'Custom') {
                if (this.config.fromPeriod) action.fromPeriod = this.config.fromPeriod
                if (this.config.toPeriod) action.toPeriod = this.config.toPeriod
                if (!this.config.fromPeriod && !this.config.toPeriod) {
                    if (this.config.from) {
                        action.start = dayjs(this.config.from).format('MM/DD/YYYY')
                    }
                    if (this.config.to) {
                        action.end = dayjs(this.config.to).format('MM/DD/YYYY')
                    }
                }
            }
        }
        if (prompts?.length > 0) {
            const validPrompts = []
            prompts.forEach((prompt) => {
                if (Array.isArray(prompt)) {
                    prompt.forEach((p) => {
                        if (p.filterValue.values.length > 0 && p.filterValue.values[0] !== 'All')
                            validPrompts.push(p)
                    })
                } else {
                    if (
                        prompt.filterValue.values.length > 0 &&
                        prompt.filterValue.values[0] !== 'All'
                    )
                        validPrompts.push(prompt)
                }
            })
            action.prompts = packFilter(validPrompts)
        }
        if (drillAttribute) action.drillAttribute = drillAttribute
        if (displayRows) action.limit = displayRows
        if (filter || savedFilter) {
            if (savedFilter) {
                action.filter = combineFilters(filter, savedFilter.filter)
            } else {
                action.filter = filter
            }
        } else {
            action.filter = undefined
        }
        if (action.metrics.some((m) => m.worksheetID)) {
            this.server.sheetPostData(
                action,
                (result, object) => this.handleServerCall(result, object, config, loadingCallback),
                this
            )
        } else {
            this.server.postData(
                action,
                (result, object) => this.handleServerCall(result, object, config, loadingCallback),
                this
            )
        }
    }

    getTheme(themeID) {
        if (this.workspaceMetadata && this.workspaceMetadata.themes) {
            for (
                let themeIndex = 0;
                themeIndex < this.workspaceMetadata.themes.length;
                themeIndex++
            ) {
                if (this.workspaceMetadata.themes[themeIndex].themeID === themeID) {
                    return this.workspaceMetadata.themes[themeIndex]
                }
            }
        }
        return undefined
    }

    configureSeries(newSeriesType, config) {
        if (!this.series) return
        if (!newSeriesType) newSeriesType = 'column'
        let numDataPoints = this.series[0].data?.length
        this.config = config
        if (
            (this.config.seriesType === 'scatter' && newSeriesType !== 'scatter') ||
            (this.config.seriesType !== 'scatter' && newSeriesType === 'scatter') ||
            (this.config.seriesType === 'bar' && newSeriesType !== 'bar') ||
            (this.config.seriesType !== 'bar' && newSeriesType === 'bar') ||
            (this.config.seriesType === 'heatmap' && newSeriesType !== 'heatmap')
        ) {
            this.series = this.processData(newSeriesType, this.result)
        }
        this.config.seriesType = newSeriesType
        let numSeries = this.series?.length
        let newSeries = []
        for (let i = 0; i < numSeries; i++) {
            if (this.series[i].waterfallPlaceholder) continue
            newSeries.push(this.series[i])
        }
        this.series = newSeries
        numSeries = this.series?.length
        for (let i = 0; i < numSeries; i++) {
            var t = this.config.seriesTypeMap
                ? this.config.seriesTypeMap.get(this.series[i].metric)
                : undefined
            var type = t ? t : this.config.seriesType
            switch (type) {
                case 'bar':
                case 'column':
                    this.series[i].type = 'bar'
                    if (this.config.stacked) {
                        if (this.categories && this.categories?.length > 1) {
                            this.series[i].stack = this.series[i].metric
                        } else {
                            this.series[i].stack = 'All'
                        }
                    } else {
                        this.series[i].stack = undefined
                    }
                    this.series[i].itemStyle = {
                        emphasis: {
                            barBorderRadius: [3, 3],
                        },
                        normal: {
                            barBorderRadius: [3, 3, 3, 3],
                        },
                    }
                    this.series[i].areaStyle = undefined
                    if (numDataPoints && numDataPoints > 50) {
                        this.series[i].barGap = '0%'
                        this.series[i].barCategoryGap = '40%'
                    } else if (numDataPoints && numDataPoints > 20) {
                        this.series[i].barGap = '10%'
                        this.series[i].barCategoryGap = '40%'
                    } else {
                        this.series[i].barGap = '10%'
                        this.series[i].barCategoryGap = '40%'
                    }
                    break
                case 'line':
                    this.series[i].type = 'line'
                    this.series[i].stack = undefined
                    this.series[i].areaStyle = undefined
                    this.series[i].barGap = undefined
                    this.series[i].barCategoryGap = undefined
                    break
                case 'area':
                    this.series[i].type = 'line'
                    this.series[i].stack = config.stacked ? 'all' : undefined
                    this.series[i].areaStyle = {}
                    this.series[i].barGap = undefined
                    this.series[i].barCategoryGap = undefined
                    break
                case 'pie':
                case 'donut':
                    this.series[i].type = 'pie'
                    this.series[i].stack = 'all'
                    this.series[i].areaStyle = {}
                    this.series[i].barGap = undefined
                    this.series[i].barCategoryGap = undefined
                    if (this.series[i].data.some((d) => !d.name)) {
                        this.series[i].data = [...this.series[i].data].map((d, j) => ({
                            value: d,
                            name: this.categoryAxisValues ? this.categoryAxisValues[j] : '',
                        }))
                    }
                    break
                case 'radialBar':
                    if (this.series[i].data.some((d) => !d.name)) {
                        this.series[i].data = [...this.series[i].data].map((d, j) => ({
                            value: d,
                            name: this.categoryAxisValues ? this.categoryAxisValues[j] : '',
                        }))
                    }
                    break
                case 'pictorialBar':
                    this.series[i].type = 'pictorialBar'
                    break
                case 'scatter':
                    this.series[i].type = 'scatter'
                    this.series[i].stack = undefined
                    this.series[i].areaStyle = {}
                    this.series[i].barGap = undefined
                    this.series[i].barCategoryGap = undefined
                    break
                case 'waterfall':
                    this.series[i].type = 'bar'
                    this.series[i].stack = 'all'
                    this.series[i].itemStyle = { color: 'transparent' }
                    let positive = {
                        name: 'positive',
                        type: 'bar',
                        stack: 'all',
                        data: [],
                        itemStyle: { color: '#009262' },
                        waterfallPlaceholder: true,
                    }
                    let negative = {
                        name: 'negative',
                        type: 'bar',
                        stack: 'all',
                        data: [],
                        itemStyle: { color: '#EB382A' }, //C33025
                        waterfallPlaceholder: true,
                    }
                    let lastVal = 0
                    let newData = []
                    for (let j = 0; j < this.series[i].data.length; j++) {
                        if (this.series[i].data[j] >= 0) {
                            if (j === 0 || j === this.series[i].data.length - 1) {
                                positive.data.push({
                                    value: this.series[i].data[j],
                                    itemStyle: { color: '#2B65D9' },
                                })
                            } else {
                                positive.data.push(this.series[i].data[j])
                            }
                            negative.data.push(0)
                            newData.push(lastVal)
                        } else {
                            if (j === 0 || j === this.series[i].data.length - 1) {
                                negative.data.push({
                                    value: -this.series[i].data[j],
                                    itemStyle: { color: '#2B65D9' },
                                })
                            } else {
                                negative.data.push(-this.series[i].data[j])
                            }
                            positive.data.push(0)
                            newData.push(lastVal + this.series[i].data[j])
                        }
                        lastVal += this.series[i].data[j]
                    }
                    this.series[i].data = newData
                    this.series.push(positive)
                    this.series.push(negative)
                    break
                default:
                    break
            }
        }
        if (this.categories) {
            let catLegendData = []
            let catIndices = []
            for (let i = 0; i < this.series?.length; i++) {
                if (
                    this.categories?.length > 1 &&
                    (this.config.seriesType === 'bar' || this.config.seriesType === 'column') &&
                    this.config.stacked
                ) {
                    if (catIndices.indexOf(this.series[i].categoryIndex) < 0) {
                        let item = {
                            name: this.series[i].name,
                        }
                        catLegendData.push(item)
                        catIndices.push(this.series[i].categoryIndex)
                    }
                } else {
                    let item = {
                        name: this.series[i].name,
                    }
                    catLegendData.push(item)
                    catIndices.push(i)
                }
            }
            this.categoryLegendData = catLegendData
        }
        this.setConfig({ ...config })
    }

    getOption(themeId) {
        let categoryAxisSettings
        if (this.config.categoryAxis === 'Time') {
            categoryAxisSettings = { type: 'category', data: this.result.dates }
        } else {
            categoryAxisSettings = {
                name: this.categoryAxis,
                type: 'category',
                data: this.categoryAxisValues,
            }
            if (this.categoryAxisValues) {
                if (this.categoryAxisValues.length > 4)
                    categoryAxisSettings.axisLabel = { rotate: 45 }
                if (this.categoryAxisValues.length > 10)
                    categoryAxisSettings.axisLabel = { rotate: 90 }
            }
        }
        let theme
        if (themeId) {
            this.config.themeID = themeId
            theme = this.getTheme(themeId)
        } else {
            if (this.config.themeID) theme = this.getTheme(this.config.themeID)
            else theme = undefined
        }
        const parsedSeries =
            this.config.categoryAxis === 'Time' &&
            (this.config.seriesType === 'bar' || this.config.seriesType === 'scatter')
                ? this.series.map((s) => {
                    return {
                        ...s,
                        data: s.data.map((d) => {
                            return Array.isArray(d) ? [...d].reverse() : d
                        }),
                        yAxisIndex: undefined,
                    }
                })
                : this.series
        const option = {
            animation: false,
            series: parsedSeries,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    crossStyle: {
                        color: '#999',
                        width: 1,
                        type: 'dashed',
                    },
                },
                order: 'valueDesc',
                confine: true,
            },
            legend: {
                orient: 'horizontal',
                top: 'bottom',
                data: this.categoryLegendData,
            },
            backgroundColor: '#FFF',
            title: {
                text: this.config.chartTitle,
                left: '50%',
            },
        }
        let darkTheme = false
        if (theme) {
            if (theme.colorScheme && theme.colorScheme.backgroundColor) {
                option.backgroundColor = theme.colorScheme.backgroundColor
                if (theme.colorScheme.darkTheme) {
                    darkTheme = true
                    option.textStyle = { color: '#FFFFFF' }
                    option.legend.textStyle = { color: '#FFFFFF' }
                }
            }
            option.color = theme.colorScheme.colors.map((c) => c.val)
        }
        if (this.config.seriesType === 'waterfall') {
            option.legend = undefined
        } else if (
            (this.config.seriesType !== 'bar' && this.config.seriesType !== 'column') ||
            !this.config.stacked
        ) {
            option.legend.formatter = function (name) {
                return name
            }
        } else {
            option.legend.formatter = function (name) {
                var index = name.indexOf(' / ')
                if (index >= 0) {
                    return name.slice(index + 3)
                } else {
                    return name
                }
            }
        }
        if (this.config.seriesType === 'bar') {
            option.xAxis = Array.isArray(this.valueAxis) ? this.valueAxis : [this.valueAxis]
            option.yAxis = [categoryAxisSettings]
        } else if (this.config.seriesType === 'scatter' && this.valueAxis) {
            if (this.valueAxis[0].name === this.result.metrics[0].name) {
                option.yAxis = [this.valueAxis[this.valueAxis?.length === 1 ? 0 : 1]]
                option.xAxis = [this.valueAxis[0]]
            } else if (this.valueAxis.length === 1) {
                option.yAxis = [this.valueAxis[0]]
                option.xAxis = [this.valueAxis[0]]
            } else {
                option.yAxis = [this.valueAxis[0]]
                option.xAxis = [this.valueAxis[1]]
            }
            option.xAxis[0].position = 'bottom'
            option.yAxis[0].position = 'left'
        } else {
            option.xAxis = [categoryAxisSettings]
            option.yAxis = Array.isArray(this.valueAxis) ? this.valueAxis : [this.valueAxis]
        }
        option.xAxis.forEach((axis) => {
            if (axis?.splitLine) axis.splitLine = { show: false }
        })
        option.yAxis.forEach((axis) => {
            if (axis?.splitLine) axis.splitLine = { show: false }
        })

        const axisColor = darkTheme ? '#FFFFFF' : '#6E7079'

        option.xAxis.forEach((axis) => {
            if (axis) this.setAxisTheme(axis, axisColor)
        })
        option.yAxis.forEach((axis) => {
            if (axis) this.setAxisTheme(axis, axisColor)
        })

        if (this.config.seriesType === 'heatmap') {
            option.xAxis = [
                {
                    type: 'category',
                    data: this.categoryAxisValues,
                    splitArea: { show: true },
                },
            ]
            option.yAxis = [
                {
                    type: 'category',
                    data: this.categories,
                    splitArea: { show: true },
                },
            ]
            option.series = [
                {
                    name: this.result.series[0].metric,
                    data: this.categories
                        .map((catValue, i) => {
                            return this.categoryAxisValues.map((cat, j) => {
                                return [cat, catValue, this.result.series[i]?.data[j]]
                            })
                        })
                        .flat(),
                    type: 'heatmap',
                    label: { show: true },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                    format: this.result?.metrics[0]?.format || null,
                },
            ]
            this.series = option.series
            const values = option.series[0].data
                .map((row) => row[2])
                .filter((value) => value !== null)
                .map((value) => Number(value))
            const maxValue = Math.max(...values)
            option.visualMap = {
                min: 0,
                max: maxValue,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '5%',
            }
        }

        option.tooltip.formatter = (event) => this.tooltipFormatter(event)
        option.label = {
            formatter: (params) => this.labelFormatter(params),
        }

        return option
    }

    invertAxis() {
        this.config.inverted = !this.config.inverted
        this.checkAndFormatAxisPosition(this.valueAxis)
        this.setConfig({ ...this.config })
    }

    checkAndFormatAxisPosition(axis) {
        if (this.config.seriesType === 'column') {
            if (Array.isArray(axis)) {
                axis.forEach((a) => {
                    const newPos = a.position === 'left' ? 'right' : 'left'
                    a.position = newPos
                    a.axisLabel.align = newPos === 'left' ? 'right' : 'left'
                })
            } else {
                const newPos = axis.position === 'left' ? 'right' : 'left'
                axis.position = newPos
                axis.axisLabel.align = newPos === 'left' ? 'right' : 'left'
            }
        }
        if (this.config.seriesType === 'bar') {
            if (Array.isArray(axis)) {
                axis.forEach((a) => {
                    const newPos = a.position === 'bottom' ? 'top' : 'bottom'
                    a.position = newPos
                    a.axisLabel.align = newPos === 'bottom' ? 'top' : 'bottom'
                })
            } else {
                const newPos = axis.position === 'bottom' ? 'top' : 'bottom'
                axis.position = newPos
                axis.axisLabel.align = newPos === 'bottom' ? 'top' : 'bottom'
            }
        }
    }

    setAxisTheme(axis, color) {
        axis.nameTextStyle = axis.nameTextStyle
            ? { ...axis.nameTextStyle, color: color }
            : { color: color }
        axis.axisLabel = axis.axisLabel ? { ...axis.axisLabel, color: color } : { color: color }
        axis.axisLine = axis.axisLine
            ? { ...axis.axisLine, lineStyle: { color: color } }
            : { lineStyle: { color: color } }
    }

    labelFormatter(params) {
        const formatOrEmpty = (value, short) => {
            if (value === 0) return null
            const formattedVal = getFormatter(
                this.series[params.seriesIndex]?.format,
                short
            )?.format(value)
            if (params?.data?.name && this.config.seriesType === 'pie')
                return `${params?.data?.name} \n ${formattedVal}`
            return formattedVal
        }

        if (Array.isArray(params.data)) {
            if (params.data.length === 2) {
                return formatOrEmpty(params.data[1])
            } else if (params.data.length === 3) {
                return formatOrEmpty(params.data[2], true)
            } else {
                return formatOrEmpty(params.data[0])
            }
        } else if (params?.data?.value !== undefined) {
            return formatOrEmpty(params.data.value)
        } else {
            return formatOrEmpty(params.data) || ''
        }
    }

    tooltipFormatter(event) {
        if (!Array.isArray(event)) {
            event = [event]
        }
        if (this.config.seriesType === 'scatter') {
            const firstEvent = event[0]
            if (!firstEvent || !firstEvent.data) {
                return ''
            }

            let s =
                firstEvent.marker +
                '<strong>' +
                (this.config.categoryAxis === 'Time'
                    ? this.result.dates[firstEvent.dataIndex]
                    : this.result.categoryAxisValues[firstEvent.dataIndex]) +
                '</strong>' +
                (this.categories?.length > 1 ? '</br>' + firstEvent.seriesName : '') +
                '</br>'

            if (
                this.series[firstEvent.seriesIndex].formats &&
                this.series[firstEvent.seriesIndex].formats.length === 2
            ) {
                s += getFormatter(this.series[firstEvent.seriesIndex].formats[0]).format(
                    firstEvent.data?.[0] || 0
                )
                s +=
                    ', ' +
                    getFormatter(this.series[firstEvent.seriesIndex].formats[1]).format(
                        firstEvent.data?.[1] || 0
                    )
            } else {
                s += getFormatter().format(firstEvent.data?.[0] || 0)
                s += ', ' + getFormatter().format(firstEvent.data?.[1] || 0)
            }
            return s
        } else {
            let s = ''
            if (
                (this.config.seriesType === 'pie' || this.config.seriesType === 'donut') &&
                this.config.categoryAxis === 'Time'
            ) {
                let sharedLabel = ''
                event.forEach((item, index) => {
                    if (item.data) {
                        if (index === 0) {
                            sharedLabel = '<strong>' + item.data.name + '</strong></br>'
                        }
                        s +=
                            item.marker +
                            getFormatter(this.series[item.seriesIndex].format).format(
                                item.data.value
                            ) +
                            '</br>'
                    }
                })
                s = sharedLabel + s
            } else if (this.config.seriesType === 'heatmap') {
                const item = event[0]
                s +=
                    item.marker +
                    getFormatter(this.series[item.seriesIndex].format).format(item.data[2]) +
                    '</br>' +
                    '<strong>' +
                    item.name +
                    '</strong></br>'
            } else {
                let sharedLabel = ''
                let seriesValues = ''
                event.forEach((item, index) => {
                    if (item.data) {
                        let categoryLabel =
                            this.config.categoryAxis === 'Time'
                                ? Array.isArray(item.data.value)
                                    ? item.data.value[0]
                                    : item.data[0]
                                : this.categoryAxisValues[item.dataIndex]

                        let value =
                            this.config.categoryAxis === 'Time'
                                ? Array.isArray(item.data.value)
                                    ? item.data.value[1]
                                    : item.data[1]
                                : typeof item.data === 'number'
                                    ? item.data
                                    : item.data.value
                        if (value > 0) {
                            if (index === 0) {
                                sharedLabel = '<strong>' + categoryLabel + '</strong></br>'
                            }
                            seriesValues +=
                                item.marker +
                                item.seriesName +
                                ': ' +
                                getFormatter(this.series[item.seriesIndex].format).format(value) +
                                '</br>'
                        }
                    }
                })
                s = sharedLabel + seriesValues
            }
            return s
        }
    }

    axisNameFormatter(axisName) {
        return axisName.split('/').join('\n')
    }

    getMetric(metricName) {
        if (!this.result || !this.result.metrics) return null
        for (var i = 0; i < this.result.metrics?.length; i++) {
            if (this.result.metrics[i].name === metricName) return this.result.metrics[i]
        }
        return null
    }

    getSeries(seriesName) {
        if (!this.series) return null
        for (var i = 0; i < this.series?.length; i++) {
            if (this.series[i].name === seriesName) return this.series[i]
        }
        return null
    }

    addFilterItem(filterItem) {
        if (this.config.filter === null) {
            this.config.filter = filterItem
            return filterItem
        } else if (this.config.filter.boperator) {
            this.config.filter.filters.push(filterItem)
            return this.config.filter
        } else {
            var newFilter = {
                boperator: 'And',
                filters: [this.config.filter, filterItem],
            }
            this.config.filter = newFilter
            return newFilter
        }
    }

    removeFilterItem(filterItem) {
        if (this.config.filter === null) {
            return null
        } else if (this.config.filter.boperator) {
            var newFilters = []
            for (var i = 0; i < this.config.filter.filters?.length; i++) {
                if (!areEquals(this.config.filter.filters[i], filterItem)) {
                    newFilters.push(this.config.filter.filters[i])
                }
            }
            if (newFilters?.length === 0) {
                this.config.filter = null
                return null
            }
            this.config.filter.filters = newFilters
        } else {
            if (areEquals(this.config.filter, filterItem)) {
                this.config.filter = null
                return null
            }
        }
        return this.config.filter
    }

    getAvailableDrillAttributes() {
        if (this.drillAttributes) {
            return this.drillAttributes.filter(
                (att) => !this.config.usedDrillAttributes.includes(att)
            )
        }
        return []
    }

    setChartStateConfig(config) {
        this.config = config
    }

    setDrillAttributes(attributes) {
        this.drillAttributes = attributes
    }
}
