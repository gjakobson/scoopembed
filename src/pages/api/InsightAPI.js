import {DEFAULT_CHART_PREFERENCES} from "@/utils/styleConsts";
import {cloneDeep, merge} from "lodash";

export const backwardsFlag = '2.1.8'

export const SORTING = {
    ASC: 'ascending',
    DESC: 'descending',
    NAT: 'natural',
}

export const SORTING_OPTIONS = [
    { label: 'Ascending', value: SORTING.ASC },
    { label: 'Descending', value: SORTING.DESC },
    { label: 'Natural', value: SORTING.NAT },
]

export const DEFAULT_SORTING = {
    sortOrder: SORTING.NAT,
    sortBy: '',
}

export const removeFontScaleFactors = (insight) => {
    if (insight.styleOverrides?.title?.textStyle?.fontScaleFactor) {
        delete insight.styleOverrides.title.textStyle.fontScaleFactor
    }
    if (insight.styleOverrides?.legend?.textStyle?.fontScaleFactor) {
        delete insight.styleOverrides.legend.textStyle.fontScaleFactor
    }
    if (insight.styleOverrides?.legend?.fontScaleFactor) {
        delete insight.styleOverrides.legend.fontScaleFactor
    }
    insight.styleOverrides.yAxis.forEach((axis) => {
        if (axis.axisLabel?.fontScaleFactor) {
            delete axis.axisLabel.fontScaleFactor
        }
        if (axis.nameTextStyle?.fontScaleFactor) {
            delete axis.nameTextStyle.fontScaleFactor
        }
    })
    insight.styleOverrides.xAxis.forEach((axis) => {
        if (axis.axisLabel?.fontScaleFactor) {
            delete axis.axisLabel.fontScaleFactor
        }
        if (axis.nameTextStyle?.fontScaleFactor) {
            delete axis.nameTextStyle.fontScaleFactor
        }
    })
    if (insight.styleOverrides?.pie?.label?.fontScaleFactor) {
        delete insight.styleOverrides.pie.label.fontScaleFactor
    }
    if (insight.styleOverrides?.donut?.label?.fontScaleFactor) {
        delete insight.styleOverrides.donut.label.fontScaleFactor
    }
}

export function loadFromSavedInsight(
    insight,
    setConfig,
    chartState,
    selectedItemToLoad,
    workspaceID,
    insightPrompts,
    workspaceMetadata,
    callBack
) {
    if (!insight) {
        chartState.clear();
        return;
    }
    if (Array.isArray(insight.seriesTypeMap)) insight.seriesTypeMap = new Map(insight.seriesTypeMap)
    if (!(insight.seriesTypeMap instanceof Map)) insight.seriesTypeMap = new Map()
    if (!insight.usedDrillAttributes) insight.usedDrillAttributes = []
    // START temp backwards stuff
    if (!insight.selectedTableKpis) {
        insight.selectedTableColumns = []
        insight.selectedTableKpis = []
        insight.selectedTables = []
        insight.tableTimeSeries = true
        if (insight.view === 'table') {
            insight.selectedItems.forEach((item) => {
                if (!insight.selectedTables.includes(item.reportSeriesTableID)){
                    insight.selectedTables.push(item.reportSeriesTableID)
                }
                if (!insight.selectedTableColumns.includes(item.kpi) || !insight.selectedTableColumns.includes(item.columnName)) {
                    if (item.columnName) {
                        // Measure
                        workspaceMetadata?.inboxes?.forEach(inbox => {
                            inbox.tables.forEach(table => {
                                if (table.reportSeriesTableID === item.reportSeriesTableID) {
                                    table.columns.forEach(col => {
                                        if (col.columnName === item.columnName || insight.tableDrillAttributes.includes(col.columnName)) {
                                            insight.selectedTableColumns.push({...col, reportSeriesTableID: table.reportSeriesTableID})
                                        }
                                    })
                                }
                            })
                        })
                    } else {
                        // KPI
                        workspaceMetadata.kpis.forEach(kpi => {
                            if (kpi.metricName === item.kpi) insight.selectedTableKpis.push(kpi)
                            workspaceMetadata?.inboxes?.forEach(inbox => {
                                inbox.tables.forEach(table => {
                                    if (table.reportSeriesTableID === kpi.reportSeriesTableID) {
                                        table.columns.forEach(col => {
                                            if (insight.tableDrillAttributes.includes(col.columnName)) {
                                                insight.selectedTableColumns.push({...col, reportSeriesTableID: table.reportSeriesTableID})
                                            }
                                        })
                                    }
                                })
                            })
                        })

                    }
                }
            })
        }
    }
    if (!insight.displayRows) insight.displayRows = 50
    if (!insight.worksheetColumns) insight.worksheetColumns = []
    if (!insight.styleOverrides) insight.styleOverrides = {...DEFAULT_CHART_PREFERENCES}
    merge(insight.styleOverrides, DEFAULT_CHART_PREFERENCES)
    // FOR BACKWARDS COMPATIBILITY
    if (!Array.isArray(insight.styleOverrides.xAxis))
        insight.styleOverrides.xAxis = [cloneDeep(insight.styleOverrides.xAxis)]
    if (!Array.isArray(insight.styleOverrides.yAxis))
        insight.styleOverrides.yAxis = [cloneDeep(insight.styleOverrides.yAxis)]
    // ADD FONT DIMENSIONS AND REMOVE FONT-SCALE-FACTORS
    if (!insight.styleOverrides.dimensions) {
        if (insight.styleOverrides.title.textStyle.fontScaleFactor) {
            if (insight.view !== 'kpi') {
                insight.styleOverrides.dimensions = {
                    width:
                        (insight.styleOverrides.title.textStyle.fontSize ??
                            TITLE_DEFAULT_VALUES.textStyle.fontSize) /
                        insight.styleOverrides.title.textStyle.fontScaleFactor.x,
                    height:
                        (insight.styleOverrides.title.textStyle.fontSize ??
                            TITLE_DEFAULT_VALUES.textStyle.fontSize) /
                        insight.styleOverrides.title.textStyle.fontScaleFactor.y,
                }
            } else {
                insight.styleOverrides.dimensions = { width: 200, height: 200 }
            }
        } else {
            if (insight.view !== 'kpi') {
                insight.styleOverrides.dimensions = {
                    width: 900,
                    height: 600,
                }
            } else {
                insight.styleOverrides.dimensions = { width: 200, height: 200 }
            }
        }
        removeFontScaleFactors(insight)
    }
    if (!insight.styleOverrides.pie || !insight.styleOverrides.donut) {
        insight.styleOverrides.pie = {...DEFAULT_CHART_PREFERENCES.pie}
        insight.styleOverrides.donut = {...DEFAULT_CHART_PREFERENCES.donut}
    }
    if (!insight.styleOverrides.pie.itemStyle) {
        insight.styleOverrides.pie.itemStyle = {
            ...DEFAULT_CHART_PREFERENCES.pie.itemStyle,
        }
        insight.styleOverrides.donut.itemStyle = {
            ...DEFAULT_CHART_PREFERENCES.donut.itemStyle,
        }
    }
    if (!insight.styleOverrides.pie.label) {
        insight.styleOverrides.pie.label = {
            ...DEFAULT_CHART_PREFERENCES.pie.label,
        }
        insight.styleOverrides.donut.label = {
            ...DEFAULT_CHART_PREFERENCES.donut.label,
        }
    }
    if (!insight.sortColumns) insight.sortColumns = []
    if (!insight.kpiCompareType) {
        insight.kpiCompareType = 'percentage'
        insight.kpiCompareTarget = undefined
    }
    if (insight.worksheetID && !insight.backwardsFlag) {
        insight.backwardsFlag = backwardsFlag
        insight.selectedTableColumns = insight.selectedTableColumns.map((c) => {
            if (c.isMeasure && c.reportSeriesTableID.includes('orphan'))
                return {
                    ...c,
                    worksheetID: insight.worksheetID,
                    rangeName: insight.rangeName,
                }
            else return c
        })
        insight.selectedItems = insight.selectedItems
            .map((i) => ({
                measureName: i.columnName,
                worksheetID: insight.worksheetID,
                rangeName: insight.rangeName,
            }))
            .filter((i) => i.measureName)
    }
    if (!insight.metricsOrder) insight.metricsOrder = []
    // END temp backwards stuff
    if (!(insight.selectedDates instanceof Map)) {
        if (insight.selectedDates) {
            insight.selectedDates = new Map(Object.entries(insight.selectedDates))
        } else {
            insight.selectedDates = new Map()
        }
    }
    setConfig(insight);
    if (insight.view === 'table') {
        chartState.getResults(
            {...insight, view: 'chart'},
            () => chartState.getResults({...insight}, callBack, insightPrompts),
            insightPrompts
        )
    } else {
        chartState.getResults(insight, callBack, insightPrompts)
    }
}

export const fetchInsight = async (insightKey, postData) => {
    // Perform the API call and return the result
    const action = {
        "action": "getObject",
        "class": "scoop.insight.Insight",
        "key": insightKey
    };
    try {
        const result = await postData(action);
        if (result) return {savedObject: JSON.parse(result.savedObject), insightName: result.insightName}; // Return the parsed insight object
    } catch (error) {
        throw error; // Rethrow the error for handling in the component
    }
};

export const saveInsight = async (insightKey, insightName, workspaceID, userID, config, postData, callBack) => {
    // Perform the API call to save the insight
    // Map is not saving to Json, converting it to object
    config.selectedDates = Object.fromEntries(config.selectedDates)
    const action = {
        "action": "putObject",
        "class": "scoop.insight.Insight",
        "value": {
            "insightName": insightName,
            "insightKey": insightKey,
            "workspaceID": workspaceID,
            "savedObject": JSON.stringify(config),
        },
        "workspaceID": workspaceID,
        "userID": userID
    };
    try {
        const result = await postData(action);
        if (result.result === "Object saved") {
            callBack()
        }
    } catch (error) {
        throw error; // Rethrow the error for handling in the component
    }
};
