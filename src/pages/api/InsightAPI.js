// import { updateInsightContent, updateInsightTitle } from '../../../store/actions';

export function loadFromSavedInsight(insight, setConfig, chartState, setIsChartASkeleton, dispatch, id, selectedItemToLoad, workspaceID, insightPrompts, workspaceMetadata) {
    if (!insight) {
        chartState.clear();
        return;
    }
    if (!(insight.seriesTypeMap instanceof Map))
        insight.seriesTypeMap = new Map();
    // START temp backwards stuff
    if (!insight.selectedTableKpis) {
        insight.selectedTableColumns = []
        insight.selectedTableKpis = []
        insight.selectedTables = []
        insight.displayRows = 50
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
    if (!insight.worksheetColumns) insight.worksheetColumns = []
    if (!insight.styleOverrides) insight.styleOverrides = {xAxis: {splitLine: {show: false}}}
    // END temp backwards stuff
    if (!(insight.selectedDates instanceof Map))
        insight.selectedDates = new Map(Object.entries(insight.selectedDates));
    setConfig(insight);
    if (insight.view === 'table') {
        chartState.getResults({...insight, view: 'chart'}, () => {chartState.getResults({...insight});});
    } else {
        chartState.getResults(insight, null, insightPrompts)
    }
    setIsChartASkeleton(false);
    // dispatch(updateInsightContent(id, { "insightKey": selectedItemToLoad, "workspaceID": workspaceID }));
    // if (typeof insight.insightName !== 'undefined') {
    //     dispatch(updateInsightTitle(id, insight.insightName));
    // }
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
        if (result) return JSON.parse(result.savedObject); // Return the parsed insight object
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
