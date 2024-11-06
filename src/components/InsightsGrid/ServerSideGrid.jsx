import React, { useEffect, useMemo, useRef, useState } from 'react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import { Box } from '@mui/material'
import InsightsGridDrillCell from './InsightsGridDrillCell/InsightsGridDrillCell'
import numeral from 'numeral'
import {gridDataSource} from "@/utils/GridDataSource";
import { LicenseManager } from 'ag-grid-enterprise'
import {TABLE_DEFAULT_VALUES} from "@/utils/styleConsts";
import {propExistsOnObject} from "@/utils/utils";

const getColumnDefs = (
    tableTimeSeries,
    tableState,
    selectedTableColumns,
    nonPivotColumnsOrder,
    pivotColumnsOrder,
    selectedTableKpis,
    clickable,
    handleMenuClick,
    worksheetID,
    filter
) => {
    try {
        let cols = []
        if (tableTimeSeries && !worksheetID) {
            cols.push({
                field: 'date',
                rowGroup: tableState?.pivot
                    ? tableState?.pivotState.rowGroupCols.includes('date')
                    : false,
                pivot: tableState?.pivot
                    ? tableState?.pivotState.pivotCols.includes('date')
                    : false,
                enableRowGroup: true,
                enablePivot: true,
                menuTabs: ['generalMenuTab'],
                sort: tableState.sorting ? tableState.sorting['date'] : 'none',
                comparator: (a, b) => new Date(b) - new Date(a),
            })
        }
        const kpiCols = selectedTableKpis.map((kpi) => {
            return {
                field: kpi.metricName,
                valueFormatter: (params) =>
                    kpi.format
                        ? numeral(params.value).format(kpi.format.formatString)
                        : params.value,
                // hack to get format on generated pivot cols
                aggFunc: kpi.format?.formatString || 'default',
                enablePivot: true,
                type: 'rightAligned',
                menuTabs: ['generalMenuTab'],
                sort: tableState.sorting ? tableState.sorting[kpi.metricName] : 'none',
                lockPosition: 'right',
            }
        })
        const selectedCols = selectedTableColumns.map((col) => {
            if (!col.isMeasure) {
                const filters = filter ? filter.filters || [filter] : []
                const includeCellRenderer = filters.some((f) => f.attributeName === col.columnName)
                return {
                    field: col.columnName,
                    cellRenderer: includeCellRenderer ? InsightsGridDrillCell : undefined,
                    rowGroup: tableState?.pivot
                        ? tableState?.pivotState.rowGroupCols.includes(col.columnName)
                        : false,
                    pivot: tableState?.pivot
                        ? tableState?.pivotState.pivotCols.includes(col.columnName)
                        : false,
                    enableRowGroup: true,
                    enablePivot: true,
                    sort: tableState.sorting ? tableState.sorting[col.columnName] : 'none',
                    cellRendererParams: includeCellRenderer
                        ? {
                              onClick: (e, value) => {
                                  let temp = { event: {} }
                                  temp.event.event = { ...e }
                                  temp.seriesName = value
                                  temp.drillColumn = col
                                  handleMenuClick(temp)
                              },
                          }
                        : undefined,
                    menuTabs: ['generalMenuTab'],
                }
            } else {
                return {
                    field: col.columnName,
                    valueFormatter: (params) =>
                        col.format ? numeral(params.value).format(col.format) : params.value,
                    // hack to get format on generated pivot cols
                    aggFunc: col.format || 'default',
                    enablePivot: true,
                    menuTabs: ['generalMenuTab'],
                    type: 'rightAligned',
                    sort: tableState.sorting ? tableState.sorting[col.columnName] : 'none',
                    lockPosition: 'right',
                }
            }
        })
        cols.push(...kpiCols)
        cols.push(...selectedCols)
        if (tableState.pivot) {
            if (pivotColumnsOrder?.length > 0) {
                const columnsIndex = {}
                pivotColumnsOrder.forEach((col, i) => {
                    columnsIndex[col] = i
                })
                const nonPivot = cols.filter((col) => !col.pivot && !col.aggFunc)
                const rest = cols.filter((col) => col.aggFunc || col.pivot)
                nonPivot.sort(
                    (a, b) =>
                        (columnsIndex[a.field] ?? nonPivot.length) -
                        (columnsIndex[b.field] ?? nonPivot.length)
                )
                return [...nonPivot, ...rest]
            }
        } else {
            if (nonPivotColumnsOrder?.length > 0) {
                const columnsIndex = {}
                nonPivotColumnsOrder.forEach((col, i) => {
                    columnsIndex[col] = i
                })
                cols.sort(
                    (a, b) =>
                        (columnsIndex[a.field] ?? cols.length) -
                        (columnsIndex[b.field] ?? cols.length)
                )
                return cols
            }
        }
        return cols
    } catch (e) {
        console.error('Error: ', e)
        return []
    }
}

export const ServerSideGrid = ({
    handleMenuClick,
    container,
    server,
    config,
    setConfig,
    clickable,
    prompts,
    setColumnLoading,
    screenshot,
    theme
}) => {

    LicenseManager.setLicenseKey(
        'Using_this_{AG_Grid}_Enterprise_key_{AG-054218}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Scoop_Analytics,_Inc}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{Scoop_Analytics}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{Scoop_Analytics}_need_to_be_licensed___{Scoop_Analytics}_has_been_granted_a_Deployment_License_Add-on_for_{1}_Production_Environment___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{25_February_2025}____[v3]_[01]_MTc0MDQ0MTYwMDAwMA==1552ac22a0d8105022c71a9bce2b8bba'
    )

    const {
        selectedTableColumns,
        nonPivotColumnsOrder,
        pivotColumnsOrder,
        selectedTableKpis,
        tableTimeSeries,
        tableState,
        worksheetID,
        filter,
    } = config
    const [innerTableState, setInnerTableState] = useState(tableState)
    const [gridReady, setGridReady] = useState(false)
    const gridRef = useRef()
    const containerStyle = useMemo(
        () => ({
            width: '100%',
            height: screenshot ? ((container.offsetHeight) - 40) : (container.offsetHeight || '100%'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
        }),
        [container]
    )
    const gridContainerRef = useRef()
    const [gridContainerStyle, setGridContainerStyle] = useState({
        height: '100%',
        maxWidth: '100%',
        width: '100%',
    })
    const [columnDefs, setColumnDefs] = useState(
        getColumnDefs(
            tableTimeSeries,
            innerTableState,
            selectedTableColumns,
            nonPivotColumnsOrder,
            pivotColumnsOrder,
            selectedTableKpis,
            clickable,
            handleMenuClick,
            worksheetID,
            filter
        )
    )
    const defaultColDef = useMemo(() => {
        return {
            resizable: true,
            suppressMenu: true,
            suppressMovable: true,
        }
    }, [])

    const getProp = (prop) => {
        if (prop === 'backgroundColor') {
            if (config.styleOverrides.backgroundColor) return config.styleOverrides.backgroundColor
            return theme?.colorScheme?.backgroundColor || TABLE_DEFAULT_VALUES[prop]
        }
        let preferences = theme?.chartPreferences
        if (typeof preferences === 'string') preferences = JSON.parse(preferences)
        if (propExistsOnObject(config.styleOverrides.table, prop))
            return config.styleOverrides.table[prop]
        if (propExistsOnObject(preferences?.table, prop)) return preferences?.table[prop]
        return TABLE_DEFAULT_VALUES[prop]
    }

    useEffect(() => {
        if (gridContainerRef.current && config.styleOverrides.table) {
            const e = gridContainerRef.current
            e.style.setProperty('--grid-body-background-color', getProp('backgroundColor'))
            e.style.setProperty('--grid-header-background-color', getProp('headerBackgroundColor'))
            e.style.setProperty('--grid-header-font-color', getProp('headerFontColor'))
            e.style.setProperty('--grid-font-color', getProp('fontColor'))
            e.style.setProperty('--grid-header-font-size', `${getProp('headerFontSize')}px`)
            e.style.setProperty('--grid-font-size', `${getProp('fontSize')}px`)
            e.style.setProperty('--grid-font-family', getProp('fontFamily'))
            e.style.setProperty('--grid-header-font-family', getProp('headerFontFamily'))
            e.style.setProperty('--grid-font-weight', getProp('fontWeight'))
            e.style.setProperty('--grid-header-font-weight', getProp('headerFontWeight'))
            config.styleOverrides.table.hideBorder
                ? e.style.setProperty('--grid-border', 'none')
                : e.style.setProperty('--grid-border', '1px solid #E6E4E6')
        }
    }, [config])

    const autoSizeAll = () => {
        const allColumnIds = gridRef.current?.api.getColumns().map((column) => column.getId())
        gridRef.current?.api.autoSizeColumns(allColumnIds)
        setGridContainerStyle({
            ...gridContainerStyle,
            width: '100%'
        })
    }

    const assignAllowed = (allowedTables, allowedKpis, chartConfig, innerState) => {
        const newConfig = chartConfig
        newConfig.allowedReportSeriesTables = allowedTables
        newConfig.allowedKPIs = allowedKpis
        newConfig.tableState = innerState
        setConfig(newConfig)
    }

    // This effect handles the grid's data source update,
    // but only after both the grid is ready and the server token is set.
    useEffect(() => {
        if (gridReady && server.token) {
            const gridApi = gridRef.current.api
            updateServer({ api: gridApi })
            // Consider moving groupNonPivotRows logic here if it depends on server.token
            // groupNonPivotRows({ api: gridApi });
        }
    }, [gridReady, server.token])

    useEffect(() => {
        setConfig({ ...config, tableState: innerTableState })
    }, [innerTableState])

    useEffect(() => {
        if (gridRef.current.api) {
            // UPDATE BOTH PIVOT AND NON PIVOT STATES
            const tempState = { ...innerTableState }
            if (!tempState.pivotState) tempState.pivotState = { rowGroupCols: [], pivotCols: [] }
            if (!tempState.nonPivotState) tempState.nonPivotState = { rowGroupCols: [] }
            const pivotRowGroupCols = tempState.pivotState.rowGroupCols
            const nonPivotRowGroupCols = tempState.nonPivotState.rowGroupCols
            const pivotCols = tempState.pivotState.pivotCols
            // ADD NEW ROW GROUP COLUMNS TO PIVOT STATE
            const pivotRowGroupAddedCols = selectedTableColumns
                // REMEMBER TO ALSO FILTER KPIS
                .filter((c) => !c.isMeasure)
                .filter(
                    (c) =>
                        !pivotRowGroupCols.includes(c.columnName) &&
                        !pivotCols.includes(c.columnName)
                )
            pivotRowGroupAddedCols?.forEach((col) =>
                tempState.pivotState.rowGroupCols.push(col.columnName)
            )
            // DELETE UNSELECTED COLUMNS FROM PIVOT AND NON PIVOT ROW GROUPS STATES
            const deletedPivotRowGroupCols = pivotRowGroupCols.filter(
                (colId) => !selectedTableColumns.some((c) => c.columnName === colId)
            )
            deletedPivotRowGroupCols?.forEach((colId) => {
                if (colId !== 'date')
                    tempState.pivotState.rowGroupCols.splice(
                        tempState.pivotState.rowGroupCols.indexOf(colId),
                        1
                    )
            })
            const deletedNonPivotRowGroupCols = nonPivotRowGroupCols.filter(
                (colId) => !selectedTableColumns.some((c) => c.columnName === colId)
            )
            deletedNonPivotRowGroupCols?.forEach((colId) => {
                if (colId !== 'date')
                    tempState.nonPivotState.rowGroupCols.splice(
                        tempState.nonPivotState.rowGroupCols.indexOf(colId),
                        1
                    )
            })
            // DELETE UNSELECTED PIVOT COLUMNS FROM PIVOT
            const deletedPivotCols = pivotCols.filter(
                (colId) => !selectedTableColumns.some((c) => c.columnName === colId)
            )
            deletedPivotCols?.forEach((colId) => {
                if (colId !== 'date')
                    tempState.pivotState.pivotCols.splice(
                        tempState.pivotState.pivotCols.indexOf(colId),
                        1
                    )
            })
            // CLEAN OR ADD DATE COLUMN DEPENDING ON TIME SERIES FLAG
            const dateIndexPivotRowGroup = tempState.pivotState.rowGroupCols.indexOf('date')
            const dateIndexPivotPivot = tempState.pivotState.pivotCols.indexOf('date')
            const dateIndexNonPivotRowGroup = tempState.nonPivotState.rowGroupCols.indexOf('date')
            if (tableTimeSeries) {
                if (dateIndexPivotRowGroup === -1 && dateIndexPivotPivot === -1)
                    tempState.pivotState.rowGroupCols.push('date')
            } else {
                if (dateIndexPivotRowGroup > -1)
                    tempState.pivotState.rowGroupCols.splice(dateIndexPivotRowGroup, 1)
                if (dateIndexPivotPivot > -1)
                    tempState.pivotState.pivotCols.splice(dateIndexPivotPivot, 1)
                if (dateIndexNonPivotRowGroup > -1)
                    tempState.nonPivotState.rowGroupCols.splice(dateIndexNonPivotRowGroup, 1)
            }
            setInnerTableState(tempState)
            // CREATE NEW COLUMN DEFINITIONS
            const colDefs = getColumnDefs(
                tableTimeSeries,
                tempState,
                selectedTableColumns,
                nonPivotColumnsOrder,
                pivotColumnsOrder,
                selectedTableKpis,
                clickable,
                handleMenuClick,
                worksheetID,
                filter
            )
            gridRef.current.api.setGridOption('columnDefs', colDefs)
            if (!tempState.pivot)
                gridRef.current.api.setRowGroupColumns(tempState.nonPivotState.rowGroupCols)
            gridRef.current.api.refreshServerSide()
        }
    }, [selectedTableColumns.length, selectedTableKpis.length, tableTimeSeries])

    useEffect(() => {
        if (gridRef.current.api) {
            gridRef.current.api.setGridOption(
                'serverSideDatasource',
                gridDataSource(
                    server,
                    config,
                    setConfig,
                    autoSizeAll,
                    prompts,
                    setColumnLoading,
                    assignAllowed,
                    innerTableState
                )
            )
        }
    }, [
        config.displayRows,
        config.timeRange,
        config.period,
        config.calendarType,
        selectedTableColumns.length,
        selectedTableKpis.length,
        tableTimeSeries,
        innerTableState,
    ])

    const getMainMenuItems = (params) => {
        const generatedId = params.column.getId().split('-')
        const colId = generatedId[generatedId.length - 1]
        const columnDef = params.api
            .getColumns()
            .filter((col) => col.getColId() === colId)[0]
            .getColDef()
        const items = []
        if (!params.column.colDef.aggFunc) {
            let column = {}
            if (colId === 'date') column = colId
            else column = selectedTableColumns.filter((col) => col.columnName === colId)[0]
            items.push('separator')
        }
        if (columnDef.enablePivot && params.api.isPivotMode()) {
            items.push({
                name: 'Pivot',
                action: () => params.api.addPivotColumn(colId),
            })
            items.push('separator')
        }
        items.push(...params.defaultItems)
        return items
    }

    const updateServer = (e) => {
        e.api.setGridOption(
            'serverSideDatasource',
            gridDataSource(
                server,
                config,
                setConfig,
                autoSizeAll,
                prompts,
                setColumnLoading,
                assignAllowed,
                innerTableState
            )
        )
    }

    const handleColumnReorder = (e) => {
        const colOrder = e.api.getAllGridColumns().map((col) => col.getColId())
        let result = []
        if (innerTableState.pivot) {
            result = colOrder
                .filter((colId) => colId.includes('ag-Grid-AutoColumn'))
                .map((colId) => {
                    const split = colId.split('-')
                    return split[split.length - 1]
                })
            setTimeout(() => {
                const newColDefs = e.api.getColumnDefs().map((c) => {
                    if (c.rowGroup) c.rowGroupIndex = result.indexOf(c.colId)
                    return c
                })
                e.api.setGridOption('columnDefs', newColDefs)
                setConfig({ ...config, pivotColumnsOrder: result })
            }, 500)
        } else {
            result = colOrder
            setTimeout(() => setConfig({ ...config, nonPivotColumnsOrder: result }), 500)
        }
    }

    const onDragEnd = (e) => {
        if (
            innerTableState.pivot &&
            e.target.className ===
                'ag-drag-handle ag-column-drop-cell-drag-handle ag-column-drop-vertical-cell-drag-handle'
        ) {
            const colOrder = e.api
                .getAllGridColumns()
                .map((col) => col.getColId())
                .filter((colId) => colId.includes('ag-Grid-AutoColumn'))
                .map((colId) => {
                    const split = colId.split('-')
                    return split[split.length - 1]
                })
            setConfig({ ...config, pivotColumnsOrder: colOrder })
        }
    }

    const handlePivotToggle = (e) => {
        const tempState = { ...innerTableState }
        const allCols = e.api.getColumns().filter((col) => !col.getAggFunc())
        const pivot = e.api.columnModel.pivotMode
        const rowGroupCols = e.api.columnModel.rowGroupColumns.map((col) => col.colId)
        const pivotCols = e.api.columnModel.pivotColumns.map((col) => col.colId)
        if (pivot) {
            tempState.pivot = true
            tempState.nonPivotState.rowGroupCols = rowGroupCols
            setInnerTableState(tempState)
            e.api.setPivotColumns(innerTableState.pivotState.pivotCols)
            if (innerTableState.pivotState.pivotCols.length > 0)
                e.api.setRowGroupColumns(innerTableState.pivotState.rowGroupCols)
            else e.api.setRowGroupColumns(allCols)
        } else {
            tempState.pivot = false
            tempState.pivotState.rowGroupCols = rowGroupCols
            tempState.pivotState.pivotCols = pivotCols
            setInnerTableState(tempState)
            e.api.setPivotResultColumns([])
            e.api.setRowGroupColumns(innerTableState.nonPivotState.rowGroupCols)
        }
    }

    const groupNonPivotRows = (e) => {
        if (
            innerTableState &&
            !innerTableState.pivot &&
            innerTableState.nonPivotState.rowGroupCols.length > 0
        ) {
            e.api.setRowGroupColumns(innerTableState.nonPivotState.rowGroupCols)
        }
    }

    const pinColumns = (e) => {
        if (
            innerTableState &&
            innerTableState.pinnedCols &&
            innerTableState.pinnedCols.length > 0
        ) {
            const leftPinned = innerTableState.pinnedCols
                .filter((col) => col.side === 'left')
                .map((col) => (innerTableState.pivot ? 'ag-Grid-AutoColumn-' : '') + col.colId)
            e.api.setColumnsPinned(leftPinned, 'left')
            const rightPinned = innerTableState.pinnedCols
                .filter((col) => col.side === 'right')
                .map((col) => (innerTableState.pivot ? 'ag-Grid-AutoColumn-' : '') + col.colId)
            e.api.setColumnsPinned(rightPinned, 'right')
        }
    }

    const handleRowGroupChange = (e) => {
        const tempState = { ...innerTableState }
        const rowGroupCols = e.api.columnModel.rowGroupColumns.map((col) => col.colId)
        if (e.api.columnModel.pivotMode) {
            tempState.pivotState.rowGroupCols = rowGroupCols
            setInnerTableState(tempState)
        } else {
            tempState.nonPivotState.rowGroupCols = rowGroupCols
        }
    }

    const handleColumnPin = (e) => {
        const tempState = { ...innerTableState }
        if (!tempState.pinnedCols) tempState.pinnedCols = []
        let eventCol = e.column.getId()
        if (eventCol.includes('ag-Grid-AutoColumn')) eventCol = eventCol.split('-')[3]
        if (e.pinned) {
            if (tempState.pinnedCols.some((col) => col.colId === eventCol)) {
                const pinnedIndex = tempState.pinnedCols.findIndex((col) => col.colId === eventCol)
                tempState.pinnedCols[pinnedIndex] = {
                    colId: eventCol,
                    side: e.pinned,
                }
            } else {
                tempState.pinnedCols.push({ colId: eventCol, side: e.pinned })
                setInnerTableState(tempState)
            }
        } else {
            const unpinnedIndex = tempState.pinnedCols.findIndex((col) => col.colId === eventCol)
            tempState.pinnedCols.splice(unpinnedIndex, 1)
            setInnerTableState(tempState)
        }
    }

    const handlePivotColumnChange = (e) => {
        const tempState = { ...innerTableState }
        tempState.pivotState.rowGroupCols = e.api.columnModel.rowGroupColumns.map(
            (col) => col.colId
        )
        tempState.pivotState.pivotCols = e.api.columnModel.pivotColumns.map((col) => col.colId)
        setInnerTableState(tempState)
    }

    const handleSortChange = (e) => {
        const columnSorting = e.api
            .getColumnState()
            .map((col) => [col.colId, col.sort])
            .filter((col) => !col.includes(null))
        setInnerTableState({
            ...innerTableState,
            sorting: Object.fromEntries(columnSorting),
        })
    }

    const icons = {
        sortAscending: '<i class="ag-icon-small-up"/>',
        sortDescending: '<i class="ag-icon-small-down"/>',
        'config-arrows': '<span class="ag-icon ag-icon-arrows"></span>',
    }

    return (
        <Box style={containerStyle}>
            {columnDefs ? (
                <div
                    style={gridContainerStyle}
                    ref={gridContainerRef}
                    className={'ag-theme-alpine'}
                >
                    <AgGridReact
                        containerStyle={{
                            boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.15)',
                        }}
                        rowModelType={'serverSide'}
                        ref={gridRef}
                        onGridReady={(e) => {
                            setGridReady(true)
                            groupNonPivotRows(e)
                            pinColumns(e)
                        }}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        sideBar={null}
                        groupDisplayType={'multipleColumns'}
                        icons={icons}
                        pivotMode={innerTableState?.pivot || false}
                        onColumnPivotModeChanged={handlePivotToggle}
                        getMainMenuItems={getMainMenuItems}
                        onColumnRowGroupChanged={handleRowGroupChange}
                        onColumnPivotChanged={handlePivotColumnChange}
                        onColumnMoved={handleColumnReorder}
                        onColumnPinned={handleColumnPin}
                        onSortChanged={handleSortChange}
                        onDragStopped={onDragEnd}
                        suppressContextMenu
                        suppressAggFuncInHeader
                        showOpenedGroup
                        suppressServerSideInfiniteScroll
                    />
                </div>
            ) : (
                'No data found'
            )}
        </Box>
    )
}
