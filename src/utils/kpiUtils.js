import dayjs from 'dayjs'
import {combineFilters, packFilter} from "@/utils/Filter";
import {getDefaultChartPreferences} from "@/utils/utils";
import {KPI_DEFAULT_VALUES} from "@/utils/styleConsts";

export const getKPIData = (config, server, prompts, callback) => {
    const {
        calendarType,
        selectedItems,
        period,
        drillAttribute,
        filter,
        savedFilter,
        selectedDates,
        tableTimeSeries,
        timeRange,
        from,
        to,
        view,
        worksheetID,
        rangeName,
    } = config
    const metrics = []
    selectedItems.forEach((item) => {
        let metric = {}
        if (item.worksheetID) {
            metric = item
        } else {
            metric = { reportSeriesTableID: item.reportSeriesTableID }
            if (item.kpi) metric.metricName = item.kpi
            else metric.measureName = item.columnName
        }
        if (selectedDates) {
            if (item.worksheetID) {
                let byDate = selectedDates.get(item.worksheetID + ':' + item.measureName)
                if (byDate) metric.byDate = byDate
            } else {
                let byDate = selectedDates.get(item.reportSeriesTableID + ':' + item.columnName)
                if (byDate) metric.byDate = byDate
            }
        }
        metrics.push(metric)
    })
    const action = {
        metrics,
        period,
        limit: 2,
    }
    if (tableTimeSeries) {
        action.action = 'getTimeSeries'
        action.calendarType = calendarType
        action.split = view !== 'table'
        action.process = false
    } else {
        action.action = 'getDataset'
    }
    if (worksheetID && rangeName) {
        action.worksheetID = worksheetID
        action.rangeName = rangeName
    }
    if (timeRange) {
        action.timeRange = timeRange
        if (action.timeRange === 'Custom') {
            if (from) action.start = dayjs(this.config.from).format('MM/DD/YYYY')
            if (to) action.end = dayjs(this.config.to).format('MM/DD/YYYY')
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
                if (prompt.filterValue.values.length > 0 && prompt.filterValue.values[0] !== 'All')
                    validPrompts.push(prompt)
            }
        })
        action.prompts = packFilter(validPrompts)
    }
    if (drillAttribute) action.drillAttribute = drillAttribute
    if (filter || savedFilter) {
        if (savedFilter) action.filter = combineFilters(filter, savedFilter.filter)
        else action.filter = filter
    }
    if (action.metrics.some((m) => m.worksheetID)) server.sheetPostData(action, (r) => callback(r))
    else server.postData(action, (r) => callback(r))
}

export const getCompareDiff = (current, target, compareType) => {
    if (compareType === 'percentage') {
        const currentPercentage = (current * 100) / target
        if (currentPercentage > 100) return (currentPercentage - 100).toFixed(2) + '%'
        if (currentPercentage < 100) return (100 - currentPercentage).toFixed(2) + '%'
        return 0
    } else {
        const diff = current - target
        return diff % 1 !== 0 ? diff.toFixed(2) : diff
    }
}

export const getCompareDirection = (current, target) => {
    if (current > target) return 'up'
    if (current < target) return 'down'
    return 'equal'
}

export const getKPITitle = (config) => {
    if (config.chartTitle) return config.chartTitle
    if (config.selectedItems.length > 0) {
        const selectedItem = config.selectedItems[0]
        if (selectedItem.kpi) return selectedItem.kpi
        if (selectedItem.columnName) return selectedItem.columnName
    }
    return 'Untitled KPI'
}

const getFontSize = (
    container,
    prop,
    override,
    chartPreference,
    defaultValue,
    dimensions
) => {
    const fontSize = override?.fontSize || chartPreference?.fontSize || defaultValue
    if (container) {
        const height = container.offsetHeight
        const width = container.offsetWidth
        return ((fontSize / dimensions.width) * width + (fontSize / dimensions.height) * height) / 2
    } else {
        return fontSize
    }
}

const getNumericValue = (overrides, chartPreferences, defaultTheme, prop) => {
    if (overrides.kpi?.body && overrides.kpi.body[prop] !== undefined)
        return overrides.kpi.body[prop]
    if (chartPreferences?.kpi?.body && chartPreferences.kpi.body[prop] !== undefined)
        return chartPreferences.kpi.body[prop]
    return defaultTheme.kpi.body[prop]
}

export const getKPIStyles = (theme, config, container) => {
    const defaultTheme = JSON.parse(
        theme
            ? getDefaultChartPreferences(theme.colorScheme.darkTheme)
            : getDefaultChartPreferences()
    )
    const overrides = config.styleOverrides
    const chartPreferences = theme?.chartPreferences
        ? JSON.parse(theme.chartPreferences)
        : undefined
    // CONTAINER
    const containerStyles = {
        padding: getNumericValue(overrides, chartPreferences, defaultTheme, 'padding'),
        backgroundColor:
            overrides?.backgroundColor || theme?.colorScheme?.backgroundColor || '#FFFFFFFF',
        borderRadius: getNumericValue(overrides, chartPreferences, defaultTheme, 'borderRadius'),
        boxShadow: '0 -2px 8px 0 rgba(20, 9, 42, 0.10)',
    }
    // TITLE
    const titleStyles = {
        ...KPI_DEFAULT_VALUES.title,
        color:
            overrides.kpi?.title?.fontColor ||
            chartPreferences?.kpi?.title?.fontColor ||
            defaultTheme.kpi.title.fontColor,
        fontSize: getFontSize(
            container,
            'title',
            overrides.kpi?.title,
            chartPreferences?.kpi?.title,
            defaultTheme.kpi.title.fontSize,
            overrides.dimensions
        ),
        fontFamily:
            overrides.kpi?.title?.fontFamily ||
            chartPreferences?.kpi?.title?.fontFamily ||
            defaultTheme.kpi.title.fontFamily,
        fontWeight:
            overrides.kpi?.title?.fontWeight ||
            chartPreferences?.kpi?.title?.fontWeight ||
            defaultTheme.kpi.title.fontWeight,
    }
    // VALUE
    const valueStyles = {
        ...KPI_DEFAULT_VALUES.value,
        color:
            overrides.kpi?.value?.fontColor ||
            chartPreferences?.kpi?.value?.fontColor ||
            defaultTheme.kpi.value.fontColor,
        fontSize: getFontSize(
            container,
            'value',
            overrides.kpi?.value,
            chartPreferences?.kpi?.value,
            defaultTheme.kpi.value.fontSize,
            overrides.dimensions
        ),
        fontFamily:
            overrides.kpi?.value?.fontFamily ||
            chartPreferences?.kpi?.value?.fontFamily ||
            defaultTheme.kpi.value.fontFamily,
        fontWeight:
            overrides.kpi?.value?.fontWeight ||
            chartPreferences?.kpi?.value?.fontWeight ||
            defaultTheme.kpi.value.fontWeight,
    }
    // COMPARE
    const compareStyles = {
        ...KPI_DEFAULT_VALUES.compare,
        color:
            overrides.kpi?.compare?.fontColor ||
            chartPreferences?.kpi?.compare?.fontColor ||
            defaultTheme.kpi.compare.fontColor,
        fontSize: getFontSize(
            container,
            'compare',
            overrides.kpi?.compare,
            chartPreferences?.kpi?.compare,
            defaultTheme.kpi.compare.fontSize,
            overrides.dimensions
        ),
        fontFamily:
            overrides.kpi?.compare?.fontFamily ||
            chartPreferences?.kpi?.compare?.fontFamily ||
            defaultTheme.kpi.compare.fontFamily,
        fontWeight:
            overrides.kpi?.compare?.fontWeight ||
            chartPreferences?.kpi?.compare?.fontWeight ||
            defaultTheme.kpi.compare.fontWeight,
        positiveColor:
            overrides.kpi?.compare?.positiveColor ||
            chartPreferences?.kpi?.compare?.positiveColor ||
            defaultTheme.kpi.compare.positiveColor,
        negativeColor:
            overrides.kpi?.compare?.negativeColor ||
            chartPreferences?.kpi?.compare?.negativeColor ||
            defaultTheme.kpi.compare.negativeColor,
    }
    return { containerStyles, titleStyles, valueStyles, compareStyles }
}

export const getFormatter = (format, short) => {
    let options = {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true,
    }
    if (format.includes('$')) {
        options.style = 'currency'
        options.currency = 'USD'
    }
    if (format.includes('%')) options.style = 'percent'
    const decimalPointIndex = format.indexOf('.')
    const commaIndex = format.indexOf(',')
    if (decimalPointIndex !== -1) {
        const decimalPart = format.slice(decimalPointIndex + 1).replace(/\D/g, '')
        options.minimumFractionDigits = decimalPart.length
        options.maximumFractionDigits = decimalPart.length
    }
    if (commaIndex !== -1) options.useGrouping = true
    const shortFormats = ['K', 'M', 'B']
    if (shortFormats.some((s) => format.includes(s)) || short) {
        options.notation = 'compact'
    }
    return new Intl.NumberFormat('en-US', options)
}

export const getFormattedKPIValue = (value, format) => {
    const formatter = getFormatter(format)
    return formatter.format(value)
}
