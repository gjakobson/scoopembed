import dayjs from 'dayjs'
import numeral from 'numeral'
import {packFilter} from "@/utils/Filter";

const addColDef = (colId, parts, res, request) => {
    if (parts.length === 0) return []
    const first = parts[0]
    const existing = res.find((r) => 'groupId' in r && r.groupId === first)
    if (existing) {
        existing['children'] = addColDef(colId, parts.slice(1), existing.children, request)
    } else {
        const colDef = {}
        const isGroup = parts.length > 1
        if (isGroup) {
            colDef['groupId'] = first
            colDef['headerName'] = first
        } else {
            const valueCol = request.valueCols.find((r) => r.field === first)
            if (valueCol) {
                colDef['colId'] = colId
                colDef['headerName'] = valueCol.displayName
                colDef['field'] = colId
                //Using server-side formatting, but there was also a bug in that the formats were being set to bad defaults
                colDef['valueFormatter'] = (params) => {
                    return valueCol.aggFunc
                        ? numeral(params.value).format(valueCol.aggFunc)
                        : params.value
                }
            }
        }
        const children = addColDef(colId, parts.slice(1), [], request)
        if (children.length > 0) {
            colDef['children'] = children
        }
        res.push(colDef)
    }
    return res
}

const createPivotResultColumns = (request, pivotFields) => {
    if (request.pivotMode && request.pivotCols.length > 0) {
        const pivotResultCols = []
        pivotFields?.forEach((field) =>
            addColDef(field, field.split('_'), pivotResultCols, request)
        )
        return pivotResultCols
    }
    return []
}

const addPivotResultCols = (request, pivotResultFields, api) => {
    const pivotResultColumns = createPivotResultColumns(request, pivotResultFields)
    api.setPivotResultColumns(pivotResultColumns)
}

export const gridDataSource = (
    server,
    chartConfig,
    setChartConfig,
    autoSizeAll,
    prompts,
    setColumnLoading,
    assignAllowed,
    innerState
) => {
    const {
        calendarType,
        period,
        timeRange,
        filter,
        selectedTableColumns,
        selectedTableKpis,
        displayRows,
        tableTimeSeries,
    } = chartConfig
    const body = {
        metrics: [],
        filter: filter,
        limit: displayRows,
    }
    selectedTableKpis.forEach((kpi) => {
        body.metrics.push({
            metricName: kpi.metricName,
            reportSeriesTableID: kpi.reportSeriesTableID,
        })
    })
    selectedTableColumns
        .filter((col) => col.isMeasure)
        .forEach((col) => {
            if (col.worksheetID) {
                const metric = {
                    measureName: col.columnName,
                    worksheetID: col.worksheetID,
                    rangeName: col.rangeName,
                    byDate: col.byDate,
                }
                body.metrics.push(metric)
            } else {
                const metric = {
                    measureName: col.columnName,
                    reportSeriesTableID: col.reportSeriesTableID,
                }
                if (col.byDate && col.byDate.selectedDate !== 'Snapshot Date')
                    metric.byDate = col.byDate.selectedDate
                body.metrics.push(metric)
            }
        })
    const worksheetCall = body.metrics.some((m) => m.worksheetID)
    if (timeRange) {
        body.timeRange = timeRange
        if (body.timeRange === 'Custom') {
            if (chartConfig.from) body.start = dayjs(chartConfig.from).format('MM/DD/YYYY')
            if (chartConfig.to) body.end = dayjs(chartConfig.to).format('MM/DD/YYYY')
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
        body.prompts = packFilter(validPrompts)
    }

    function updateSheetColumns(r) {
        if (r.sheetColumns) {
            for (let i = 0; i < chartConfig.selectedTableColumns.length; i++) {
                for (let j = 0; j < r.sheetColumns.length; j++) {
                    if (
                        r.sheetColumns[j].columnName ===
                        chartConfig.selectedTableColumns[i].columnName
                    ) {
                        if (r.sheetColumns[j].format) {
                            chartConfig.selectedTableColumns[i].format = r.sheetColumns[j].format
                        }
                    }
                }
            }
        }
    }

    return {
        getRows: (params) => {
            const { groupKeys, pivotCols, pivotMode, rowGroupCols } = params.request
            delete body.period
            delete body.calendarType
            delete body.split
            delete body.process
            if (tableTimeSeries) {
                body.period = period
                body.calendarType = calendarType
            }
            if (pivotMode) {
                body.action = 'getPivotDataset'
                body.drillAttributes = rowGroupCols
                    .map((col) => (col.id === 'date' ? 'SCOOP_TSTAMP' : col.id))
                    .slice(0, groupKeys.length + 1)
                body.groupKeys = groupKeys
                if (pivotCols.length > 0) {
                    pivotCols?.forEach((col) => {
                        body.drillAttributes.push(col.id === 'date' ? 'SCOOP_TSTAMP' : col.id)
                    })
                }
                body.pivotCols = pivotCols.map((col) =>
                    col.id === 'date' ? 'SCOOP_TSTAMP' : col.id
                )
                if (worksheetCall) {
                    server.sheetPostData(body, (r) => {
                        const rowData = r.dataset
                        if (pivotCols.length > 0) {
                            rowData?.forEach((row, i) => {
                                const temp = {}
                                Object.keys(row)?.forEach(
                                    (key) => (temp[key.split(':')[0]] = row[key])
                                )
                                rowData[i] = temp
                            })
                        }
                        const pivotResultFields = []
                        if (pivotCols.length > 0) {
                            rowData?.forEach((row, i) => {
                                Object.keys(row)?.forEach((key) => {
                                    if (
                                        key !== 'date' &&
                                        !pivotResultFields.includes(key) &&
                                        key.includes('_')
                                    )
                                        pivotResultFields.push(key)
                                })
                            })
                        }
                        addPivotResultCols(params.request, pivotResultFields, params.api)
                        params.success({ rowData: rowData })
                        assignAllowed(
                            r.allowedReportSeriesTables,
                            r.allowedKPIs,
                            chartConfig,
                            innerState
                        )
                        setTimeout(autoSizeAll, 0)
                        if (setColumnLoading) setColumnLoading(false)
                    })
                } else {
                    server.postData(body, (r) => {
                        const rowData = r.dataset
                        if (pivotCols.length > 0) {
                            rowData?.forEach((row, i) => {
                                const temp = {}
                                Object.keys(row)?.forEach(
                                    (key) => (temp[key.split(':')[0]] = row[key])
                                )
                                rowData[i] = temp
                            })
                        }
                        const pivotResultFields = []
                        if (pivotCols.length > 0) {
                            rowData?.forEach((row, i) => {
                                Object.keys(row)?.forEach((key) => {
                                    if (
                                        key !== 'date' &&
                                        !pivotResultFields.includes(key) &&
                                        key.includes('_')
                                    )
                                        pivotResultFields.push(key)
                                })
                            })
                        }
                        addPivotResultCols(params.request, pivotResultFields, params.api)
                        params.success({ rowData: rowData })
                        assignAllowed(
                            r.allowedReportSeriesTables,
                            r.allowedKPIs,
                            chartConfig,
                            innerState
                        )
                        setTimeout(autoSizeAll, 0)
                        if (setColumnLoading) setColumnLoading(false)
                    })
                }
            } else {
                if (rowGroupCols.length > 0) {
                    body.action = 'getPivotDataset'
                    body.pivotCols = []
                    let drillAttributes = rowGroupCols
                        .map((col) => (col.id === 'date' ? 'SCOOP_TSTAMP' : col.id))
                        .slice(0, groupKeys.length + 1)
                    const nonGrouped = params.api.getColumnDefs()
                        .filter((col) => !col.aggFunc)
                        .filter(
                            (col) =>
                                !drillAttributes.includes(
                                    col.field === 'date' ? 'SCOOP_TSTAMP' : col.field
                                )
                        )
                        .map((col) => (col.field === 'date' ? 'SCOOP_TSTAMP' : col.field))
                    if (groupKeys.length === drillAttributes.length) {
                        drillAttributes = drillAttributes.concat(nonGrouped)
                    }
                    body.drillAttributes = drillAttributes
                    body.groupKeys = groupKeys
                    if (worksheetCall) {
                        server.sheetPostData(body, (r) => {
                            params.success({ rowData: r.dataset })
                            updateSheetColumns(r)
                            assignAllowed(
                                r.allowedReportSeriesTables,
                                r.allowedKPIs,
                                chartConfig,
                                innerState
                            )
                            setTimeout(autoSizeAll, 0)
                            if (setColumnLoading) setColumnLoading(false)
                        })
                    } else {
                        server.postData(body, (r) => {
                            params.success({ rowData: r.dataset })
                            updateSheetColumns(r)
                            assignAllowed(
                                r.allowedReportSeriesTables,
                                r.allowedKPIs,
                                chartConfig,
                                innerState
                            )
                            setTimeout(autoSizeAll, 0)
                            if (setColumnLoading) setColumnLoading(false)
                        })
                    }
                } else {
                    body.drillAttributes = [...params.api.getColumnDefs()]
                        .filter((col) => col.field !== 'date' && !col.aggFunc)
                        .map((col) => col.field)
                    if (!tableTimeSeries) {
                        body.action = 'getDataset'
                        if (worksheetCall) {
                            server.sheetPostData(body, (r) => {
                                const rowData = []
                                r.dataset?.rows?.forEach((row) => {
                                    const temp = {}
                                    r.dataset?.columns?.forEach((col, i) => {
                                        temp[col.columnName || col] = row[i]
                                    })
                                    rowData.push(temp)
                                })
                                updateSheetColumns(r)
                                params.success({ rowData: rowData })
                                assignAllowed(
                                    r.allowedReportSeriesTables,
                                    r.allowedKPIs,
                                    chartConfig,
                                    innerState
                                )
                                setTimeout(autoSizeAll, 0)
                                if (setColumnLoading) setColumnLoading(false)
                            })
                        } else {
                            server.postData(body, (r) => {
                                const rowData = []
                                r.dataset?.rows?.forEach((row) => {
                                    const temp = {}
                                    r.dataset?.columns?.forEach((col, i) => {
                                        temp[col.columnName || col] = row[i]
                                    })
                                    rowData.push(temp)
                                })
                                updateSheetColumns(r)
                                params.success({ rowData: rowData })
                                assignAllowed(
                                    r.allowedReportSeriesTables,
                                    r.allowedKPIs,
                                    chartConfig,
                                    innerState
                                )
                                setTimeout(autoSizeAll, 0)
                                if (setColumnLoading) setColumnLoading(false)
                            })
                        }
                    } else {
                        body.action = 'getTimeSeries'
                        body.process = false
                        body.split = false
                        if (worksheetCall) {
                            server.sheetPostData(body, (r) => {
                                const rowData = []
                                r.dataset?.data?.forEach((row) => {
                                    const temp = {}
                                    r.dataset?.columns?.forEach((col, i) => {
                                        temp[col.columnName || col] = row[i]
                                    })
                                    rowData.push(temp)
                                })
                                updateSheetColumns(r)
                                if (r.timeSeriesNotFound) {
                                    let newConfig = { ...chartConfig }
                                    newConfig.tableTimeSeries = false
                                    newConfig.disableTimeSeries = true
                                    setChartConfig(newConfig)
                                }
                                params.success({ rowData: rowData })
                                assignAllowed(
                                    r.allowedReportSeriesTables,
                                    r.allowedKPIs,
                                    chartConfig,
                                    innerState
                                )
                                setTimeout(autoSizeAll, 0)
                                if (setColumnLoading) setColumnLoading(false)
                            })
                        } else {
                            server.postData(body, (r) => {
                                const rowData = []
                                r.dataset?.data?.forEach((row) => {
                                    const temp = {}
                                    r.dataset?.columns?.forEach((col, i) => {
                                        temp[col.columnName || col] = row[i]
                                    })
                                    rowData.push(temp)
                                })
                                updateSheetColumns(r)
                                if (r.timeSeriesNotFound) {
                                    let newConfig = { ...chartConfig }
                                    newConfig.tableTimeSeries = false
                                    newConfig.disableTimeSeries = true
                                    setChartConfig(newConfig)
                                }
                                params.success({ rowData: rowData })
                                assignAllowed(
                                    r.allowedReportSeriesTables,
                                    r.allowedKPIs,
                                    chartConfig,
                                    innerState
                                )
                                setTimeout(autoSizeAll, 0)
                                if (setColumnLoading) setColumnLoading(false)
                            })
                        }
                    }
                }
            }
        },
    }
}
