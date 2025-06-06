import ReactECharts from "echarts-for-react";
import styles from './Insigth.module.css';
import { ScoopTheme } from '@/styles/Style';
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import _, {clone, cloneDeep, isNumber} from "lodash";
import {loadFromSavedInsight, fetchInsight} from '../../api/InsightAPI';
import ChartState from "../../../utils/ChartState";
import CaretRight from '../../../../public/icons/CaretRight.svg?url';
import CloseIcon from '../../../../public/icons/CloseIcon.svg?url';
import CloseIconWhite from '../../../../public/icons/CloseIconWhite.svg?url';
import {useApi} from "@/pages/api/api";
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";
import {getDefaultChartPreferences, isLightColor, SORTING} from "@/utils/utils";
import {
    AXIS_DEFAULT_VALUES, AXIS_TEXT_DEFAULT_VALUES,
    BAR_DEFAULT_VALUES, GAUGE_DEFAULT_VALUES, LABEL_DEFAULT_VALUES,
    LEGEND_DEFAULT_VALUES, LINE_DEFAULT_VALUES, PIE_DEFAULT_VALUES, RADIAL_DEFAULT_VALUES,
    TITLE_DEFAULT_VALUES
} from "@/utils/styleConsts";
import {KPI} from "@/components/KPI/KPI";
import {ServerSideGrid} from "@/components/InsightsGrid/ServerSideGrid";

const InsightComponent = ({
    isDev,
    token,
    workspaceID,
    userID,
    server,
    insightKey,
    workspaceMetadata,
    socketConnected,
    sendMessage,
    serverUpdate,
    screenshot,
    urlPrompt,
    designID
}) => {

    const itemID = `${userID}-${workspaceID}-${insightKey}`
    const { postData } = useApi(isDev, token, userID, workspaceID);
    const [config, setConfig] = useState(ChartState.getDefaultConfig());
    const [chartState, setChartState] = useState(new ChartState(server, config, setConfig));
    const hasFetched = useRef(false);
    const fetchingRef = useRef(new Set());
    const [style, setStyle] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [seriesName, setSeriesName] = useState(null);
    const [drillColumn, setDrillColumn] = useState(null);
    const [drillingHistory, setDrillingHistory] = useState([]);
    const openMenu = Boolean(anchorEl);
    const [loading, setLoading] = useState(true);
    const [registered, setRegistered] = useState(false);
    const [activePrompts, setActivePrompts] = useState([]);
    const [isWorksheetChart, setIsWorksheetChart] = useState(false);
    const container = typeof window !== 'undefined' ?
        document.getElementById('scoop-element-container') :
        {offsetWidth: 0, offsetHeight: 0}
    const [theme, setTheme] = useState('')

    // Example of url prompts
    // const array = [
    //     {
    //         attributeName: "Close Date",
    //         operator: "GreaterThanOrEquals",
    //         filterValue: {
    //             values: [
    //                 "2023-09-01"
    //             ]
    //         }
    //     },
    //     {
    //         attributeName: "Close Date",
    //         operator: "LessThanOrEquals",
    //         filterValue: {
    //             values: [
    //                 "2024-08-31"
    //             ]
    //         }
    //     }
    // ]
    //
    // console.log(btoa(JSON.stringify(array)))

    useEffect(() => {
        if (workspaceMetadata) setTheme(getTheme())
    }, [workspaceMetadata, chartState?.config.themeID])

    useEffect(() => {
        setLoading(true)
        fetchInsight(insightKey, postData)
            .then((result) => {
                if (result.savedObject.worksheetID) setIsWorksheetChart(true)
                loadFromSavedInsight(
                    result.savedObject,
                    setConfig,
                    chartState,
                    insightKey,
                    workspaceID,
                    urlPrompt ? JSON.parse(atob(urlPrompt)) : null,
                    workspaceMetadata,
                    () => setLoading(false)
                );
            })
            .catch(error => {
                console.error("Error fetching insight:", error);
            })
            .finally(() => {
                fetchingRef.current.delete(insightKey);
            })
    }, []);

    useEffect(() => {
        if (socketConnected && !loading && !registered) {
            const action = {
                action: 'registerItem',
                groupID: designID,
                itemID: itemID
            }
            if (config.worksheetID) action.worksheetID = config.worksheetID
            sendMessage(JSON.stringify(action))
            setRegistered(true)
        }
    }, [socketConnected, loading, config]);

    useEffect(() => {
        if (serverUpdate?.action === 'updatePrompts' && serverUpdate.prompts && !isWorksheetChart) {
            hasFetched.current = false
            if (serverUpdate.prompts.filters) {
                updateInsight([...serverUpdate.prompts.filters])
                setActivePrompts([...serverUpdate.prompts.filters])
            } else {
                updateInsight([serverUpdate.prompts])
                setActivePrompts([serverUpdate.prompts])
            }
        }
        if (serverUpdate?.action === 'refresh' && isWorksheetChart) {
            hasFetched.current = false
            updateInsight()
        }
    }, [serverUpdate, isWorksheetChart])

    useEffect(() => {
        if (workspaceMetadata) {
            const cs = chartState;
            cs.workspaceMetadata = workspaceMetadata;
            setChartState(cs);
        }
    }, [workspaceMetadata]);

    const getTheme = () => {
        const themeID = chartState?.config.themeID
        if (themeID) {
            if (themeID === 'defaultTheme') {
                return {
                    themeID: 'defaultTheme',
                    themeName: 'Default theme',
                    colorScheme: {
                        backgroundColor: '#FFFFFF',
                        colors: ScoopTheme.color,
                        darkTheme: false,
                    },
                }
            }
            if (workspaceMetadata) {
                let theme = workspaceMetadata.themes.find((t) => t.themeID === themeID)
                if (theme) return theme
            }
        }
        return undefined
    }

    const updateInsight = (prompts) => {
        if (!hasFetched.current && insightKey && postData) {
            setLoading(true)
            hasFetched.current = true
            fetchInsight(insightKey, postData)
                .then((result) => {
                    loadFromSavedInsight(
                        result.savedObject,
                        setConfig,
                        chartState,
                        insightKey,
                        workspaceID,
                        prompts,
                        workspaceMetadata,
                        () => setLoading(false)
                    );
                })
                .catch(error => {
                    console.error("Error fetching insight:", error);
                })
                .finally(() => {
                    fetchingRef.current.delete(insightKey);
                })
        }
    };

    const handleMenuClick = (event) => {
        if (typeof window !== 'undefined') {
            setAnchorEl(event.event.event.currentTarget);
            if (config.view === 'chart') {
                setStyle({
                    position: 'absolute',
                    left: event.event.event.clientX + 'px',
                    top: event.event.event.clientY + 'px',
                    minHeight: 300 + 'px'
                });
            } else {
                setDrillColumn(event.drillColumn);
            }
            setSeriesName(event.seriesName);
        }
    };

    const handleTableMenuClose = (event, col) => {
        setAnchorEl(null);
        if (event.key === "Escape" || event.currentTarget.textContent === "") return;
        let newFilter = {
            attributeName: drillColumn.columnName, operator: "Equals", filterValue: {
                values: [seriesName]
            }
        };
        let curFilter = chartState.addFilterItem(newFilter);
        config.selectedTableColumns.push(col);
        config.filter = curFilter;
        if (drillingHistory.length === 0) {
            setDrillingHistory([
                {attribute: drillColumn.columnName},
                {attribute: event.currentTarget.textContent, filter: newFilter}
            ]);
        } else {
            setDrillingHistory([
                ...drillingHistory,
                {attribute: event.currentTarget.textContent, filter: newFilter}
            ]);
        }
        setConfig({...config});
    };

    const handleChartMenuClose = (event) => {
        setAnchorEl(null);
        if (event.key === "Escape" || event.currentTarget.textContent === "") return;
        if (chartState.config.drillAttribute) {
            chartState.config.usedDrillAttributes.push(chartState.config.drillAttribute);
            let series = chartState.getSeries(seriesName);
            if (series) {
                let newFilter = {
                    attributeName: config.drillAttribute, operator: "Equals", filterValue: {
                        values: [series.category]
                    }
                };
                let curFilter = chartState.addFilterItem(newFilter);
                config.drillAttribute = event.currentTarget.textContent;
                config.filter = curFilter;
                setDrillingHistory([
                    ...drillingHistory,
                    {attribute: event.currentTarget.textContent, filter: newFilter}
                ]);
                chartState.getResults(config, null, activePrompts);
            }
        } else {
            config.drillAttribute = event.currentTarget.textContent;
            setDrillingHistory([
                ...drillingHistory,
                {attribute: event.currentTarget.textContent}
            ]);
            chartState.getResults(config, null, activePrompts);
        }
        setConfig({...config});
    };

    function onChartClick(event) {
        handleMenuClick(event);
    }

    const onEvents = {
        'click': onChartClick
    };

    function validChart() {
        if (config.view === 'kpi') return config.selectedItems.length > 0
        if (
            config.view === 'table' &&
            (config.selectedTableColumns.length > 0 || config.selectedTableKpis.length > 0)
        )
            return true
        if (
            chartState.config.seriesType === 'scatter' &&
            chartState.config.selectedItems &&
            chartState.config.selectedItems?.length !== 2
        )
            return false
        return (
            chartState.series &&
            chartState.series?.length > 0 &&
            ((chartState.result.dates && chartState.result.dates?.length > 0) ||
                chartState.series[0].data?.length > 0)
        )
    }

    const getChartDrillItems = () => {
        if (!chartState) {
            return [];
        }
        let drillAtts = [];
        if (chartState.drillAttributes?.length > 0) {
            drillAtts = chartState.drillAttributes?.map((item) => {
                if (
                    item === chartState.categoryAxis ||
                    item === chartState.config.drillAttribute ||
                    !chartState.getAvailableDrillAttributes().includes(item) ||
                    chartState.config.selectedTableColumns.includes(item)
                ) {
                    return null;
                }
                return (<MenuItem key={item} value={item} onClick={handleChartMenuClose}>{item}</MenuItem>);
            });
        }
        let changeDrillAtts = [];
        return [...drillAtts, ...changeDrillAtts];
    };

    const getTableDrillItems = () => {
        const tables = [];
        workspaceMetadata?.inboxes?.forEach(inbox => {
            inbox.tables.forEach(table => {
                if (config.selectedTables.includes(table.reportSeriesTableID)) tables.push(table);
            });
        });
        const columns = _.intersection(...tables.map(table => table.columns.map(col => ({...col, reportSeriesTableID: table.reportSeriesTableID}))));
        const availableDrills = columns.filter(column => !column.isMeasure && !config.selectedTableColumns.some(col => col.columnName === column.columnName));
        return availableDrills.map(col => <MenuItem key={col.columnName} onClick={(e) => handleTableMenuClose(e, col)}>{col.columnName}</MenuItem>);
    };

    const handleDeleteDrillingStep = (step, i) => {
        const newConfig = {...config};
        const newDrillingHistory = [...drillingHistory];
        if (config.view === 'chart') {
            if (drillingHistory.length === 1) {
                newConfig.drillAttribute = undefined;
                setDrillingHistory([]);
            } else {
                newConfig.drillAttribute = newDrillingHistory[i - 1].attribute;
                newConfig.filter = chartState.removeFilterItem(step.filter);
                newDrillingHistory.splice(i, 1);
                newConfig.usedDrillAttributes.splice(newConfig.usedDrillAttributes.indexOf(step.attribute), 1);
                setDrillingHistory(newDrillingHistory);
            }
            setConfig(newConfig);
            chartState.getResults(newConfig, null, activePrompts);
        } else {
            const deleteIndex = newConfig.selectedTableColumns.findIndex(col => col.columnName === step.attribute);
            newConfig.selectedTableColumns.splice(deleteIndex, 1);
            newConfig.filter = chartState.removeFilterItem(step.filter);
            if (drillingHistory.length === 2) {
                setDrillingHistory([]);
            } else {
                newDrillingHistory.splice(i, 1);
                setDrillingHistory(newDrillingHistory);
            }
            setConfig(newConfig);
        }
    };

    const navigateToStep = (step, i) => {
        const newConfig = {...config};
        let newDrillingHistory = [...drillingHistory];
        const toDeleteSteps = newDrillingHistory.slice(i + 1);
        if (config.view === 'chart') {
            toDeleteSteps.forEach(s => {
                newConfig.filter = chartState.removeFilterItem(s.filter);
                newConfig.usedDrillAttributes.splice(newConfig.usedDrillAttributes.indexOf(s.attribute), 1);
            });
            newConfig.drillAttribute = step.attribute;
            newDrillingHistory = newDrillingHistory.slice(0, i + 1);
            setDrillingHistory(newDrillingHistory);
            setConfig(newConfig);
            chartState.getResults(newConfig, null, activePrompts);
        } else {
            toDeleteSteps.forEach(s => {
                const deleteIndex = newConfig.selectedTableColumns.findIndex(col => col.columnName === s.attribute);
                newConfig.selectedTableColumns.splice(deleteIndex, 1);
                newConfig.filter = chartState.removeFilterItem(s.filter);
            });
            newDrillingHistory = newDrillingHistory.slice(0, i + 1);
            setDrillingHistory(newDrillingHistory);
            setConfig(newConfig);
        }
    };

    const isStepClickable = (i) => {
        if (config.view === 'chart') return i < drillingHistory.length - 1;
        else return i > 0 && i < drillingHistory.length - 1;
    };

    const applyFontScale = (overrides, width, height) => {
        overrides.title.textStyle.fontSize =
            (((overrides.title.textStyle.fontSize ?? TITLE_DEFAULT_VALUES.textStyle.fontSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.title.textStyle.fontSize || TITLE_DEFAULT_VALUES.textStyle.fontSize) /
                    overrides.dimensions.height) *
                height) /
            2

        overrides.legend.textStyle.fontSize =
            (((overrides.legend.textStyle.fontSize || LEGEND_DEFAULT_VALUES.textStyle.fontSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.legend.textStyle.fontSize || LEGEND_DEFAULT_VALUES.textStyle.fontSize) /
                    overrides.dimensions.height) *
                height) /
            2

        overrides.legend.itemSize =
            (((overrides.legend.itemSize || LEGEND_DEFAULT_VALUES.itemSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.legend.itemSize || LEGEND_DEFAULT_VALUES.itemSize) /
                    overrides.dimensions.height) *
                height) /
            2

        if (config.seriesType === 'pie' || config.seriesType === 'donut') {
            overrides.label.fontSize =
                (((overrides.label.fontSize || LABEL_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.width) *
                    width +
                    ((overrides.label.fontSize || LABEL_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.height) *
                    height) /
                2

            overrides.label.fontSize =
                (((overrides.label.fontSize || LABEL_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.width) *
                    width +
                    ((overrides.label.fontSize || LABEL_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.height) *
                    height) /
                2
        }
        overrides.radialBar.radiusAxis.axisLabel.fontSize =
            (((overrides.radialBar.radiusAxis.axisLabel.fontSize ||
                        RADIAL_DEFAULT_VALUES.radiusAxis.axisLabel.fontSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.radialBar.radiusAxis.axisLabel.fontSize ||
                        RADIAL_DEFAULT_VALUES.radiusAxis.axisLabel.fontSize) /
                    overrides.dimensions.height) *
                height) /
            2

        overrides.radialBar.label.fontSize =
            (((overrides.radialBar.label.fontSize || RADIAL_DEFAULT_VALUES.label.fontSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.radialBar.label.fontSize || RADIAL_DEFAULT_VALUES.label.fontSize) /
                    overrides.dimensions.height) *
                height) /
            2

        overrides.gauge.detail.fontSize =
            (((overrides.gauge.detail.fontSize || GAUGE_DEFAULT_VALUES.detail.fontSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.gauge.detail.fontSize || GAUGE_DEFAULT_VALUES.detail.fontSize) /
                    overrides.dimensions.height) *
                height) /
            2

        overrides.gauge.title.fontSize =
            (((overrides.gauge.title.fontSize || GAUGE_DEFAULT_VALUES.title.fontSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.gauge.title.fontSize || GAUGE_DEFAULT_VALUES.title.fontSize) /
                    overrides.dimensions.height) *
                height) /
            2

        overrides.gauge.axisLabel.fontSize =
            (((overrides.gauge.axisLabel.fontSize || GAUGE_DEFAULT_VALUES.axisLabel.fontSize) /
                    overrides.dimensions.width) *
                width +
                ((overrides.gauge.axisLabel.fontSize || GAUGE_DEFAULT_VALUES.axisLabel.fontSize) /
                    overrides.dimensions.height) *
                height) /
            2

        overrides.xAxis.forEach((axis) => {
            axis.axisLabel.fontSize =
                (((axis.axisLabel.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.width) *
                    width +
                    ((axis.axisLabel.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.height) *
                    height) /
                2

            axis.nameTextStyle.fontSize =
                (((axis.nameTextStyle.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.width) *
                    width +
                    ((axis.nameTextStyle.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.height) *
                    height) /
                2
        })

        overrides.yAxis.forEach((axis) => {
            axis.axisLabel.fontSize =
                (((axis.axisLabel.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.width) *
                    width +
                    ((axis.axisLabel.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.height) *
                    height) /
                2

            axis.nameTextStyle.fontSize =
                (((axis.nameTextStyle.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.width) *
                    width +
                    ((axis.nameTextStyle.fontSize || AXIS_TEXT_DEFAULT_VALUES.fontSize) /
                        overrides.dimensions.height) *
                    height) /
                2
        })
    }

    const applyLegendIconSizeTransformation = (option) => {
        const size = option.legend.itemSize || 10
        option.legend.itemWidth = size
        option.legend.itemHeight = size
        delete option.legend.itemSize
    }

    const ensureAxisOverrides = (optionAxis, overridesAxis, referenceAxis) => {
        if (optionAxis.length > overridesAxis.length) {
            optionAxis.forEach((_, i) => {
                overridesAxis[i] = overridesAxis[i] || { ...referenceAxis[0] }
            })
        }
    }

    const applyColumnResize = (option, overrides) => {
        if (
            (config.seriesType === 'bar' || config.seriesType === 'column') &&
            chartState.categoryLegendData?.length > 1
        ) {
            let divisor = 1
            if (chartState.categoryAxisValues > 1 && !config.stacked)
                divisor = chartState.categoryAxisValues?.length - 1
            if (chartState.categoryLegendData && !config.stacked)
                divisor = divisor + chartState.categoryLegendData?.length - 1
            if (config.selectedItems.length > 1 && config.stacked) {
                const uniqueSeries = _.uniqBy(config.selectedItems, 'kpi')
                divisor = uniqueSeries.length
            }
            const barGapPercentage = parseFloat(overrides.bar?.barGap?.split('%')[0] || '10')
            option.series.forEach((s, i) => {
                const availableSpace = 100 - (divisor - 1) * (barGapPercentage / divisor)
                let barWidth =
                    (overrides.bar?.barWidth?.split('%')[0] || BAR_DEFAULT_VALUES.barWidth) /
                    divisor
                barWidth = (barWidth * availableSpace) / 100
                if (barWidth) {
                    option.series[i] = {
                        ...s,
                        ...overrides.bar,
                        barWidth: `${barWidth}%`,
                    }
                }
            })
        } else if (config.seriesTypeMap.size > 0) {
            const columnNames = Array.from(config.seriesTypeMap.entries())
                .filter(
                    ([columnName, columnType]) => columnType === 'bar' || columnType === 'column'
                )
                .map(([columnName]) => columnName)
            if (columnNames.length > 0) {
                const divisor = columnNames.length
                const barGapPercentage = parseFloat(overrides.bar?.barGap?.split('%')[0] || '10')
                option.series.forEach((s, i) => {
                    const availableSpace = 100 - (divisor - 1) * barGapPercentage
                    let barWidth =
                        (overrides.bar?.barWidth?.split('%')[0] || BAR_DEFAULT_VALUES.barWidth) /
                        divisor
                    barWidth = (barWidth * availableSpace) / 100
                    if (barWidth && columnNames.includes(s.name)) {
                        option.series[i] = {
                            ...s,
                            ...overrides.bar,
                            barWidth: `${barWidth}%`,
                        }
                    }
                })
            }
        }
    }

    const dataContainsNegatives = (option) => {
        return option.series.some((s) =>
            s.data.some((d) => {
                if (typeof d === 'number') {
                    return d < 0
                } else if (d && Array.isArray(d) && d.length > 1) {
                    return d[1] < 0
                } else if (typeof d === 'object' && d !== null) {
                    return d.value < 0
                }
                return false
            })
        )
    }

    const adjustBorderRadius = (radius) => {
        const tempRadius = [...radius]
        return [tempRadius[2], tempRadius[0], tempRadius[1], tempRadius[3]]
    }

    const applyStringBreak = (str) => {
        if (!str || typeof str !== 'string') return str
        const middle = Math.floor(str.length / 2)
        let leftPos = str.lastIndexOf(' ', middle)
        let rightPos = str.indexOf(' ', middle)
        if (leftPos === -1) leftPos = 0
        if (rightPos === -1) rightPos = str.length
        const breakPoint = middle - leftPos <= rightPos - middle ? leftPos : rightPos
        if (breakPoint > 0 && breakPoint < str.length) {
            return str.slice(0, breakPoint) + '\n' + str.slice(breakPoint + 1)
        } else {
            return str.slice(0, middle) + '\n' + str.slice(middle)
        }
    }

    const getOptionWithOverrides = () => {
        const defaultTheme = JSON.parse(getDefaultChartPreferences())
        let option = _.cloneDeep(chartState.getOption())
        if (theme) option = _.cloneDeep(chartState.getOption(theme.themeID))
        let overrides = _.cloneDeep(config.styleOverrides)
        let baseTheme = JSON.parse(getDefaultChartPreferences())

        // Make sure that overrides axis length are up to date and match the option axis length
        if (config.seriesType === 'bar') {
            ensureAxisOverrides(option.yAxis, overrides.xAxis, overrides.xAxis)
            ensureAxisOverrides(option.xAxis, overrides.yAxis, overrides.yAxis)
        } else {
            ensureAxisOverrides(option.yAxis, overrides.yAxis, overrides.yAxis)
            ensureAxisOverrides(option.xAxis, overrides.xAxis, overrides.xAxis)
        }

        if (theme && theme.chartPreferences) {
            let preferences =
                typeof theme.chartPreferences === 'string'
                    ? JSON.parse(theme.chartPreferences)
                    : theme.chartPreferences
            //Convert to arrays for backwards compatibility
            if (!Array.isArray(preferences.yAxis))
                preferences.yAxis = cloneDeep([preferences.yAxis])
            if (!Array.isArray(preferences.xAxis))
                preferences.xAxis = cloneDeep([preferences.xAxis])
            // Apply preferences style to each of the axes.
            overrides.yAxis.forEach((axis, i) => {
                if (preferences.yAxis[i])
                    overrides.yAxis[i] = _.merge(
                        _.cloneDeep(preferences.yAxis[i]),
                        _.cloneDeep(axis)
                    )
                else
                    overrides.yAxis[i] = _.merge(
                        _.cloneDeep(preferences.yAxis[0]),
                        _.cloneDeep(axis)
                    )
            })
            overrides.xAxis.forEach((axis, i) => {
                if (preferences.xAxis[i])
                    overrides.xAxis[i] = _.merge(
                        _.cloneDeep(preferences.xAxis[i]),
                        _.cloneDeep(axis)
                    )
                else
                    overrides.xAxis[i] = _.merge(
                        _.cloneDeep(preferences.xAxis[0]),
                        _.cloneDeep(axis)
                    )
            })
            preferences = _.omit(preferences, 'xAxis')
            preferences = _.omit(preferences, 'yAxis')
            overrides = _.merge(_.cloneDeep(preferences), _.cloneDeep(overrides))
        } else {
            // Apply default theme to each of the axes.
            overrides.yAxis.forEach(
                (axis, i) =>
                    (overrides.yAxis[i] = _.merge(_.cloneDeep(baseTheme.yAxis), _.cloneDeep(axis)))
            )
            overrides.xAxis.forEach(
                (axis, i) =>
                    (overrides.xAxis[i] = _.merge(_.cloneDeep(baseTheme.xAxis), _.cloneDeep(axis)))
            )
            baseTheme = _.omit(baseTheme, 'xAxis')
            baseTheme = _.omit(baseTheme, 'yAxis')
            overrides = _.merge(_.cloneDeep(baseTheme), _.cloneDeep(overrides))
        }
        if (config.seriesType === 'bar') {
            let radius = overrides.bar?.itemStyle?.borderRadius || [5, 5, 0, 0]
            if (overrides.bar?.itemStyle?.borderRadius) {
                overrides.bar.itemStyle.borderRadius = adjustBorderRadius(radius)
            }
        }

        // remove position overrides if present (backwards comp)
        overrides.xAxis.forEach((a) => {
            if (a.position) delete a.position
        })
        overrides.yAxis.forEach((a) => {
            if (a.position) delete a.position
        })

        // remove axis for pie and donut
        if (
            config.seriesType === 'pie' ||
            config.seriesType === 'donut' ||
            config.seriesType === 'gauge' ||
            config.seriesType === 'radialBar'
        ) {
            overrides.xAxis.forEach((axis) => (axis.show = false))
            overrides.yAxis.forEach((axis) => (axis.show = false))
            overrides.legend.icon = 'none'
            option.tooltip.trigger = 'item'
            if (overrides.grid?.tooltip?.axisPointer) {
                overrides.grid.tooltip.trigger = 'item'
            }
        } else if (
            config.stacked &&
            (config.seriesType === 'bar' || config.seriesType === 'column')
        ) {
            option.tooltip.trigger = 'item'
            if (overrides.grid?.tooltip?.axisPointer) {
                overrides.grid.tooltip.trigger = 'item'
            }
        }

        if (config.seriesType === 'heatmap') {
            option.tooltip.trigger = 'item'
            if (overrides.grid?.tooltip?.axisPointer) {
                overrides.grid.tooltip.trigger = 'item'
            }
        }

        overrides.yAxis.forEach((axis) => {
            if (axis.show === undefined) axis.show = AXIS_DEFAULT_VALUES.show
            if (axis.splitLine.show === undefined)
                axis.splitLine.show = AXIS_DEFAULT_VALUES.splitLine.show
            if (axis.splitLine.lineStyle.color === undefined)
                axis.splitLine.lineStyle.color = AXIS_DEFAULT_VALUES.splitLine.lineStyle.color
            if (axis.splitLine.lineStyle.type === undefined)
                axis.splitLine.lineStyle.type = AXIS_DEFAULT_VALUES.splitLine.lineStyle.type
            if (axis.splitLine.lineStyle.width === undefined)
                axis.splitLine.lineStyle.width = AXIS_DEFAULT_VALUES.splitLine.lineStyle.width
        })

        // apply pie/donut configs (this has to be done before the font scale)
        if (config.seriesType === 'donut') {
            overrides.donut = _.merge(
                JSON.parse(getDefaultChartPreferences()).donut,
                overrides.donut
            )
            option.series.forEach((s, i) => {
                option.series[i] = { ...s, ...overrides.donut }
            })
        } else {
            overrides.pie = _.merge(JSON.parse(getDefaultChartPreferences()).pie, overrides.pie)
            if (option.series.some((s) => s.type === 'pie')) {
                option.series.forEach((s, i) => {
                    option.series[i] = { ...s, ...overrides.pie }
                })
            }
        }

        // apply font scale
        const height = container.offsetHeight
        const width = container.offsetWidth
        applyFontScale(overrides, width, height)

        if (config.seriesType === 'bar') {
            const xAxisOverrides = overrides.yAxis || []
            const yAxisOverrides = overrides.xAxis || []
            option.xAxis.forEach((axisObject, i) => {
                if (xAxisOverrides[i]) {
                    option.xAxis[i] = {
                        ...axisObject,
                        ...xAxisOverrides[i],
                        position: 'bottom',
                        axisLabel: {
                            ...axisObject.axisLabel,
                            ...xAxisOverrides[i]?.axisLabel,
                            align: 'bottom',
                        },
                    }
                }
            })
            option.yAxis.forEach((axisObject, i) => {
                if (yAxisOverrides[i]) {
                    option.yAxis[i] = {
                        ...axisObject,
                        ...yAxisOverrides[i],
                        position: 'left',
                        axisLabel: {
                            ...axisObject.axisLabel,
                            ...yAxisOverrides[i]?.axisLabel,
                            align: 'right',
                        },
                    }
                }
            })
            if (option.series.some((s) => s.yAxisIndex !== undefined)) {
                option.series.forEach((s, i) => {
                    s.xAxisIndex = s.yAxisIndex
                    delete s.yAxisIndex
                })
            }
        } else {
            // Distributing the overrides to xAxis and yAxis for every other charts
            option.yAxis.forEach((axisObject, i) => {
                option.yAxis[i] = _.merge(axisObject, overrides.yAxis[i])
            })
            option.xAxis.forEach((axisObject, i) => {
                delete overrides.xAxis[i].name
                option.xAxis[i] = _.merge(axisObject, overrides.xAxis[i])
            })
            if (option.series.some((s) => s.xAxisIndex !== undefined)) {
                option.series.forEach((s, i) => {
                    s.yAxisIndex = s.xAxisIndex
                    delete s.xAxisIndex
                })
            }
        }

        // apply bar/waterfall configs
        if (config.seriesType === 'waterfall') {
            option.series.forEach((s, i) => {
                if (s.name === 'positive') {
                    option.series[i].itemStyle = {
                        color: overrides.waterfall?.upColor || defaultTheme.waterfall.upColor,
                    }
                    option.series[i].data[0] = {
                        ...option.series[i].data[0],
                        itemStyle: {
                            color:
                                overrides.waterfall.startColor || defaultTheme.waterfall.startColor,
                        },
                    }
                }
                if (s.name === 'negative') {
                    option.series[i].itemStyle = {
                        color: overrides.waterfall.downColor || defaultTheme.waterfall.downColor,
                    }
                    const lastIndex = option.series[i].data.length - 1
                    option.series[i].data[lastIndex] = {
                        ...option.series[i].data[lastIndex],
                        itemStyle: {
                            color: overrides.waterfall.endColor || defaultTheme.waterfall.endColor,
                        },
                    }
                }
            })
        } else {
            if (option.series.some((s) => s.type === 'bar')) {
                option.series.forEach((s, i) => {
                    option.series[i] = { ...s, ...overrides.bar }
                })
            }
        }

        // apply line configs
        if (option.series.some((s) => s.type === 'line')) {
            option.series.forEach((s, i) => {
                option.series[i] = { ...s, ...overrides.line }
            })
        }

        if (config.seriesType === 'radialBar') {
            overrides.radialBar = _.merge(
                JSON.parse(getDefaultChartPreferences()).radialBar,
                overrides.radialBar
            )
            option = {
                ...option,
                angleAxis: {
                    ...overrides.radialBar.angleAxis,
                    data: { ...chartProperties?.categoryAxisValues },
                },
                polar: overrides.radialBar.polar,
                radiusAxis: overrides.radialBar.radiusAxis,
            }
            const showAsStacked = overrides.radialBar.stack
            option.series.forEach((s, i) => {
                if (showAsStacked) option.series[i].stack = 'total'
                option.series[i].coordinateSystem = 'polar'
                option.series[i].type = 'bar'
                option.series[i].label = {
                    position: 'middle',
                    formatter: '{b}: {c}',
                    ...overrides.radialBar.label,
                }
                option.series[i] = {
                    ...s,
                    emphasis: overrides.radialBar.emphasis,
                    itemStyle: overrides.radialBar.itemStyle,
                    barWidth: overrides.radialBar.barWidth,
                }
            })
        }

        // apply pictorial configs
        if (config.seriesType === 'pictorialBar') {
            const xAxisCopy = _.cloneDeep(option.xAxis)
            const yAxisCopy = _.cloneDeep(option.yAxis)

            if (overrides.pictorialBar.showAsBar) {
                option.xAxis = yAxisCopy
                option.yAxis = xAxisCopy

                option.series.forEach((seriesItem) => {
                    if (seriesItem.yAxisIndex !== undefined) {
                        seriesItem.xAxisIndex = seriesItem.yAxisIndex
                        delete seriesItem.yAxisIndex
                    }
                })
            } else {
                option.xAxis = xAxisCopy
                option.yAxis = yAxisCopy

                option.series.forEach((seriesItem) => {
                    if (seriesItem.xAxisIndex !== undefined) {
                        seriesItem.yAxisIndex = seriesItem.xAxisIndex
                        delete seriesItem.xAxisIndex
                    }
                })
            }
            option.series.forEach((series, seriesIndex) => {
                if (!overrides.pictorialBar.data[seriesIndex]) {
                    overrides.pictorialBar.data[seriesIndex] = []
                }

                series.barGap = overrides.pictorialBar.barGap
                series.barCategoryGap = overrides.pictorialBar.barCategoryGap

                series.data.forEach((d, i) => {
                    if (typeof d === 'number') {
                        series.data[i] = Object.assign(
                            { value: d },
                            overrides.pictorialBar.data[seriesIndex][i]
                        )
                    } else {
                        series.data[i] = Object.assign(
                            {},
                            d,
                            overrides.pictorialBar.data[seriesIndex][i]
                        )
                    }
                })
            })
        }

        // apply pie/donut configs
        if (
            (config.seriesType === 'donut' || config.seriesType === 'pie') &&
            config.categoryAxis === 'Time'
        ) {
            option.series.forEach((series, i) => {
                series.data.forEach((d, j) => {
                    option.series[i].data[j] = {
                        name: d.value[0],
                        value: d.value[1],
                    }
                })
            })
        }

        if (config.seriesType === 'gauge') {
            overrides.gauge = _.merge(
                JSON.parse(getDefaultChartPreferences()).gauge,
                overrides.gauge
            )
            overrides.tooltip.show = false
            overrides.legend.show = false
            option.series.forEach((s, i) => {
                s.type = 'gauge'
                if (
                    overrides.gauge?.data &&
                    overrides.gauge.data[0]?.value &&
                    isNumber(overrides.gauge.data[0].value)
                ) {
                    option.series[i].data = overrides.gauge?.data
                } else {
                    const name = chartState?.categoryAxisValues[0] || ''
                    let value = (
                        ((chartState?.series[0]?.data[0]?.value || chartState?.series[0]?.data[0]) * 100) /
                        chartState?.series[0]?.data.reduce((a, b) => a + (b.value || b), 0)
                    ).toFixed(3)
                    option.series[i].data = [{ value, name }]
                }
                option.series[i] = {
                    ...s,
                    ...overrides.gauge,
                    data: option.series[i].data,
                }
            })
        }

        applyColumnResize(option, overrides)

        //Remove radius for bar or column charts if they are stacked
        if (
            config.stacked &&
            (config.seriesType === 'bar' || config.seriesType === 'column') &&
            config.drillAttribute
        ) {
            const stacks = {}

            option.series.forEach((series, i) => {
                const stackName = series.stack || `stack_${i}`
                if (!stacks[stackName]) stacks[stackName] = []

                const hasValidData = Array.isArray(series.data)
                    ? series.data.some((d) => d !== 0 && d !== null)
                    : series.data !== 0 && series.data !== null

                if (hasValidData) stacks[stackName].push(series)
            })

            Object.values(stacks).forEach((stackSeries) => {
                const radiusSeries = []
                for (let i = 0; i < stackSeries[0]?.data.length; i++) {
                    let lastValidIndex = -1
                    stackSeries.forEach((series, j) => {
                        const value = Array.isArray(series.data[i])
                            ? series.data[i][1]
                            : series.data[i]
                        if (value !== 0 && value !== null) {
                            lastValidIndex = j
                        }
                    })
                    if (lastValidIndex !== -1) {
                        radiusSeries.push({
                            data: i,
                            series: lastValidIndex,
                        })
                    }
                }

                stackSeries.forEach((series, index) => {
                    series.data = series.data.map((d, i) => {
                        const isTop = radiusSeries.some((r) => r.data === i && r.series === index)
                        const value = typeof d === 'object' ? d?.value || d : d
                        const itemStyle = isTop
                            ? {
                                borderRadius: overrides.bar?.itemStyle?.borderRadius || [
                                    5, 5, 0, 0,
                                ],
                            }
                            : { borderRadius: [0, 0, 0, 0] }

                        return {
                            value,
                            itemStyle,
                        }
                    })
                })
            })
        }

        // apply max legends and max chars
        const max = overrides.legend?.maxLegends || LEGEND_DEFAULT_VALUES.maxLegends
        const maxChars =
            overrides.legend?.textStyle.maxCharacters ||
            LEGEND_DEFAULT_VALUES.textStyle.maxCharacters
        const maxAxisLabelChars =
            overrides.xAxis[0]?.axisLabel?.maxCharacters || AXIS_TEXT_DEFAULT_VALUES.maxCharacters
        if (option.legend?.data?.length > 0) {
            option.legend.formatter = (s) =>
                s.length > maxChars ? s.substring(0, maxChars) + '...' : s
            if (max !== 'all') option.legend.data = option?.legend?.data?.slice(0, max)
        }
        const targetAxis = config.seriesType === 'bar' ? 'yAxis' : 'xAxis'
        option[targetAxis] = option[targetAxis].map((axis) => ({
            ...axis,
            axisLabel: {
                ...axis.axisLabel,
                formatter: (s) =>
                    s.length > maxAxisLabelChars ? s.substring(0, maxAxisLabelChars) + '...' : s,
            },
        }))

        // omit props we dont wanna merge
        ;[
            'waterfall',
            'bar',
            'line',
            'pie',
            'donut',
            'pictorialBar',
            'gauge',
            'radialBar',
            'table',
            'xAxis',
            'yAxis',
        ].forEach((key) => {
            overrides = _.omit(overrides, [key])
        })
        option = _.merge(option, overrides)

        applyLegendIconSizeTransformation(option)

        if (dataContainsNegatives(option)) {
            const axis = config.seriesType === 'bar' ? 'xAxis' : 'yAxis'
            option[axis].forEach((axis) => {
                axis.min = function (value) {
                    const absMax = Math.max(Math.abs(value.min), Math.abs(value.max))
                    return -Math.ceil(absMax)
                }
                axis.max = function (value) {
                    const absMax = Math.max(Math.abs(value.min), Math.abs(value.max))
                    return Math.ceil(absMax)
                }
            })
            if (
                config.stacked &&
                (config.seriesType === 'bar' || config.seriesType === 'column') &&
                config.drillAttribute
            ) {
                option.series.forEach((s, i) => {
                    const defaultRadius = s.itemStyle?.borderRadius || [5, 5, 0, 0]
                    s.data = s.data.map((d, j) => {
                        let value
                        if (Array.isArray(d)) {
                            value = d[1]
                        } else if (typeof d === 'object' && d !== null) {
                            value = d.value
                        } else {
                            value = d
                        }
                        const adjustedRadius = [...defaultRadius]
                        if (value < 0 && d?.itemStyle?.borderRadius !== [0, 0, 0, 0]) {
                            const tempRadius = [...defaultRadius]
                            if (config.seriesType === 'bar') {
                                adjustedRadius[0] = tempRadius[1]
                                adjustedRadius[3] = tempRadius[2]
                                adjustedRadius[1] = tempRadius[0]
                                adjustedRadius[2] = tempRadius[3]
                            } else {
                                adjustedRadius[0] = tempRadius[2]
                                adjustedRadius[1] = tempRadius[3]
                                adjustedRadius[2] = tempRadius[0]
                                adjustedRadius[3] = tempRadius[1]
                            }
                            d.itemStyle.borderRadius = adjustedRadius
                            const fixRoundedTopIndex = i - 1
                            const fixTopData = option.series[fixRoundedTopIndex].data[j]
                            let fixedValue
                            if (Array.isArray(fixTopData)) {
                                fixedValue = fixTopData[1]
                            } else if (typeof fixTopData === 'object' && fixTopData !== null) {
                                fixedValue = fixTopData.value
                            } else {
                                fixedValue = fixTopData
                            }
                            const adjustedFixedRadius = [...defaultRadius]
                            if (config.seriesType === 'bar') {
                                adjustedFixedRadius[0] = defaultRadius[3]
                                adjustedFixedRadius[2] = defaultRadius[1]
                            }
                            option.series[fixRoundedTopIndex].data[j] = {
                                value: fixedValue,
                                itemStyle: {
                                    borderRadius: adjustedFixedRadius,
                                },
                            }
                        }
                        return {
                            value,
                            itemStyle: {
                                borderRadius: d?.itemStyle?.borderRadius || [5, 5, 0, 0],
                            },
                        }
                    })
                })
            } else {
                option.series.forEach((s) => {
                    const defaultRadius = s.itemStyle?.borderRadius || [5, 5, 0, 0]
                    s.data = s.data.map((d) => {
                        let value
                        if (Array.isArray(d)) {
                            value = d[1]
                        } else if (typeof d === 'object' && d !== null) {
                            value = d.value
                        } else {
                            value = d
                        }
                        const adjustedRadius = [...defaultRadius]
                        if (value < 0) {
                            const tempRadius = [...defaultRadius]
                            if (config.seriesType === 'bar') {
                                adjustedRadius[0] = tempRadius[1]
                                adjustedRadius[3] = tempRadius[2]
                                adjustedRadius[1] = tempRadius[0]
                                adjustedRadius[2] = tempRadius[3]
                            } else {
                                adjustedRadius[0] = tempRadius[2]
                                adjustedRadius[1] = tempRadius[3]
                                adjustedRadius[2] = tempRadius[0]
                                adjustedRadius[3] = tempRadius[1]
                            }
                        }
                        return {
                            value,
                            itemStyle: {
                                borderRadius: adjustedRadius,
                            },
                        }
                    })
                })
            }
            option.series.forEach((s) => {
                const defaultRadius = s.itemStyle?.borderRadius || [5, 5, 0, 0]
                s.data = s.data.map((d) => {
                    let value
                    if (Array.isArray(d)) {
                        value = d[1]
                    } else if (typeof d === 'object' && d !== null) {
                        value = d.value
                    } else {
                        value = d
                    }
                    const adjustedRadius = [...defaultRadius]
                    if (value < 0) {
                        const tempRadius = [...defaultRadius]
                        if (config.seriesType === 'bar') {
                            adjustedRadius[0] = tempRadius[1]
                            adjustedRadius[3] = tempRadius[2]
                            adjustedRadius[1] = tempRadius[0]
                            adjustedRadius[2] = tempRadius[3]
                        } else {
                            adjustedRadius[0] = tempRadius[2]
                            adjustedRadius[1] = tempRadius[3]
                            adjustedRadius[2] = tempRadius[0]
                            adjustedRadius[3] = tempRadius[1]
                        }
                    }
                    return {
                        value: d,
                        itemStyle: {
                            borderRadius: adjustedRadius,
                        },
                    }
                })
            })
        }

        // apply legend position
        const legendPosition = overrides.legend?.scoopPosition || 'bottom'
        switch (legendPosition) {
            case 'top':
                option.grid.top = '20%'
                option.grid.bottom = '5%'
                option.grid.left = '10%'
                option.grid.right = '10%'
                option.legend.left = 'center'
                option.legend.top = '10%'
                option.legend.orient = 'horizontal'
                break
            case 'bottom':
                option.grid.top = '15%'
                option.grid.bottom = '15%'
                option.grid.left = '10%'
                option.grid.right = '10%'
                option.legend.left = 'center'
                option.legend.top = 'bottom'
                option.legend.orient = 'horizontal'
                break
            case 'left':
                option.grid.top = '10%'
                option.grid.bottom = '5%'
                option.grid.left = '20%'
                option.grid.right = '10%'
                option.legend.left = 'left'
                option.legend.top = 'middle'
                option.legend.orient = 'vertical'
                break
            case 'right':
                option.grid.top = '10%'
                option.grid.bottom = '5%'
                option.grid.left = '10%'
                option.grid.right = '20%'
                option.legend.left = 'right'
                option.legend.top = 'middle'
                option.legend.orient = 'vertical'
                break
        }

        // fix sorting for bar charts
        if (
            config.sortColumns.some((sortingOption) =>
                ['asc', 'desc'].includes(sortingOption.order)
            ) &&
            config.seriesType === 'bar'
        ) {
            option.series.forEach((series) => {
                if (series.data) series.data = series.data.toReversed()
            })
            option.yAxis.forEach((axis) => {
                if (axis.data) axis.data = axis.data.toReversed()
            })
        }

        // check for axis title removal
        if (config.selectedItems.length > 4) {
            if (config.seriesType === 'bar') {
                option.xAxis.forEach((axis) => {
                    axis.name = ''
                })
            }
            if (config.seriesType === 'column') {
                option.yAxis.forEach((axis) => {
                    axis.name = ''
                })
            }
        } else {
            if (config.seriesType === 'bar') {
                option.xAxis.forEach((axis) => {
                    axis.name = axis.name.split(' ').join('\n')
                })
            }
            if (config.seriesType === 'column') {
                // option.yAxis.forEach((axis) => {
                //     axis.name = applyStringBreak(axis.name)
                // })
                if (option.title.text.split(' ').length > 3) {
                    option.title.text = applyStringBreak(option.title.text)
                    option.grid.top = '20%'
                }
            }
        }

        // reduce legend left padding
        option.legend.textStyle.padding = [0, 0, 0, -3]

        // Apply label config to all series
        for (const s of option.series) {
            if (config.seriesType === 'column' || config.seriesType === 'bar') {
                s.label = {
                    position: config.styleOverrides?.bar?.position || BAR_DEFAULT_VALUES.position,
                }
            } else if (config.seriesType === 'line') {
                s.label = {
                    position: config.styleOverrides?.line?.position || LINE_DEFAULT_VALUES.position,
                }
            } else if (config.seriesType === 'pie') {
                s.label = {
                    position: config.styleOverrides?.pie?.position || PIE_DEFAULT_VALUES.position,
                    show: config.styleOverrides?.label?.show ?? LABEL_DEFAULT_VALUES.show,
                }
            }
        }

        if (config.seriesType === 'heatmap') {
            option.grid.left = '5%'
            option.grid.top = '10%'
            option.grid.right = '5%'
            delete option.label.color
            option.xAxis[0].axisLabel.rotate = option.xAxis[0].data.length > 5 ? 45 : 0
            option.xAxis[0].axisLabel.fontSize = option.xAxis[0].data.length > 5 ? 12 : 14
            option.yAxis[0].axisLabel.fontSize = option.yAxis[0].data.length > 10 ? 12 : 14
            option.series[0].label.fontSize = option.xAxis[0].data.length > 5 ? 8 : 12
            option.series[0].label.rotate = option.xAxis[0].data.length > 5 ? 45 : 0
            // option.series[0].label.overflow = 'truncate'
            // option.series[0].label.width = 20
        }

        if (option.title.top === '0%' && (screenshot || urlPrompt)) {
            option.title.top = '5%'
        }
        if (option.legend.top === 'bottom' && (screenshot || urlPrompt)) {
            option.legend.top = '90%'
        }

        return option
    }

    const getScreenshotBgColor = () => {
        if (screenshot) {
            if (theme?.colorScheme?.backgroundColor === 'rgba(0,0,0,0)' ||
                theme?.colorScheme?.backgroundColor === '#00000000' ||
                theme?.colorScheme?.backgroundColor.slice(-2) === '00') {
                if (theme.colorScheme.darkTheme) return 'black'
                else return 'white'
            } else if (config.styleOverrides?.backgroundColor === '#00000000') {
                let color = '#FFFFFF'
                const textColor = config.styleOverrides.xAxis?.axisLabel?.color
                if (textColor) color = textColor.length > 7 ? textColor.slice(-2) : textColor
                if (isLightColor(color)) return 'black'
                else return 'white'
            } else {
                return 'white'
            }
        }
        return 'transparent'
    }

    const getBreadcrumbFontColor = () => {
        if (theme) {
            return theme.colorScheme.darkTheme ? 'white' : 'black'
        } else if (config.styleOverrides.xAxis?.axisLabel?.color) {
            return config.styleOverrides.xAxis.axisLabel.color
        } else {
            return 'black'
        }
    }

    const renderInsight = () => {
        switch (config.view) {
            case 'table':
                return (
                    <ServerSideGrid
                        handleMenuClick={handleMenuClick}
                        config={config}
                        setConfig={setConfig}
                        container={container}
                        server={server}
                        clickable={true}
                        prompts={activePrompts}
                        theme={theme}
                        screenshot={screenshot}
                    />
                )
            case 'chart':
                return (
                    <ReactECharts
                        option={getOptionWithOverrides()}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{height: '100%', width: '100%'}}
                        theme={ScoopTheme}
                        onEvents={onEvents}
                    />
                )
            case 'kpi':
                return (
                    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
                        <KPI
                            config={config}
                            setConfig={setConfig}
                            server={server}
                            theme={theme}
                            container={container}
                        />
                    </Box>
                )
        }
    }

    const renderNoData = () => {
        return (
            <Box
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'grid',
                    placeContent: 'center',
                    color: theme?.colorScheme?.darkTheme ? 'white' : 'black',
                }}
            >
                <Typography className={'inter'}>No data found for current configuration</Typography>
            </Box>
        )
    }

    return (
        <>
            <Box sx={{width: '100%', height: '100%', backgroundColor: getScreenshotBgColor()}}>
                {
                    loading ?
                        <div style={{width: '100%', height: '100%', display: 'grid', placeContent: 'center'}}>
                            <ScoopLoader size={container.offsetWidth * 0.1} />
                        </div> : (validChart() ? renderInsight() : renderNoData())
                }
            </Box>
            {
                drillingHistory.length > 0 &&
                <Box
                    className={styles.drillingBreadcrumbsContainer}
                    sx={{
                        backgroundColor: theme?.colorScheme?.backgroundColor ||
                            config.styleOverrides?.backgroundColor ||
                            'white'
                    }}
                >
                    {
                        drillingHistory.map((step, i) => (
                            <Box
                                key={i + step.attribute}
                                className={styles.drillStep}
                                sx={{color: getBreadcrumbFontColor()}}
                            >
                                <Typography
                                    className={`${isStepClickable(i) ? styles.clickableStep : ''}`}
                                    mr={'5px'}
                                    fontSize={'12px'}
                                    onClick={() => isStepClickable(i) ? navigateToStep(step, i) : null}
                                >
                                    {
                                        i < drillingHistory.length - 1 ?
                                            step.attribute + ' = ' + drillingHistory[i + 1].filter.filterValue.values[0] :
                                            step.attribute
                                    }
                                </Typography>
                                {
                                    i + 1 === drillingHistory.length &&
                                    <IconButton sx={{padding: '4px'}} onClick={() => handleDeleteDrillingStep(step, i)}>
                                        <Image
                                            src={isLightColor(getBreadcrumbFontColor()) ? CloseIconWhite : CloseIcon}
                                            height={12}
                                            alt={'delete'}
                                        />
                                    </IconButton>
                                }
                                {
                                    i < drillingHistory.length - 1 &&
                                    <Image
                                        src={CaretRight}
                                        alt={'caret-right'}
                                        style={{marginRight: '5px'}}
                                    />
                                }
                            </Box>
                        ))
                    }
                </Box>
            }
            <Menu
                id={'basic-menu'}
                anchorEl={anchorEl}
                container={typeof window !== 'undefined' ? document.getElementById('slide-container') : null}
                open={openMenu}
                onClose={handleChartMenuClose}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                style={style}
            >
                {config.view === 'table' ? getTableDrillItems() : getChartDrillItems()}
            </Menu>
        </>
    );
}

export default InsightComponent;
