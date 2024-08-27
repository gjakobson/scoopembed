import ReactECharts from "echarts-for-react";
import styles from './Insigth.module.css';
import { ScoopTheme } from '@/styles/Style';
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import _ from "lodash";
import {loadFromSavedInsight, fetchInsight} from '../../api/InsightAPI';
import ChartState from "../../../utils/ChartState";
import CaretRight from '../../../../public/icons/CaretRight.svg?url';
import CloseIcon from '../../../../public/icons/CloseIcon.svg?url';
import CloseIconWhite from '../../../../public/icons/CloseIconWhite.svg?url';
import {useApi} from "@/pages/api/api";
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";
import {socket} from "@/socket";
import {getDefaultTheme, isLightColor, SORTING} from "@/utils/utils";

const getTheme = (config, chartState) => {
    if (config && config.themeID) {
        let theme = chartState.getTheme(config.themeID);
        if (theme) return theme;
    }
    return undefined;
}

const InsightComponent = ({
    token,
    workspaceID,
    userID,
    server,
    insightKey,
    workspaceMetadata,
    socketConnected,
    serverUpdate,
    screenshot,
    designID
}) => {

    const itemID = `${userID}-${workspaceID}-${insightKey}`
    const { postData } = useApi(token, userID, workspaceID);
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
    const theme = getTheme(config, chartState)

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
                    null,
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
            socket.send(JSON.stringify(action))
            setRegistered(true)
        }
    }, [socketConnected, loading, config]);

    useEffect(() => {
        console.log(isWorksheetChart)
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

    const updateInsight = (prompts) => {
        if (!hasFetched.current && insightKey && postData) {
            setLoading(true)
            hasFetched.current = true
            fetchInsight(insightKey, postData)
                .then((result) => {
                    //setInsightName(result.insightName)
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
        if (!chartState) return false;
        return chartState.series && chartState.series.length > 0 && ((chartState.result.dates && chartState.result.dates.length > 0) || chartState.series[0].data.length > 0);
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
        if (overrides.title?.textStyle?.fontScaleFactor?.x && overrides.title.textStyle.fontScaleFactor?.y) {
            overrides.title.textStyle.fontSize =
                (overrides.title.textStyle.fontScaleFactor.x * width +
                    overrides.title.textStyle.fontScaleFactor.y * height) / 2;
        }

        if (overrides.legend?.textStyle?.fontScaleFactor?.x && overrides.legend.textStyle.fontScaleFactor?.y) {
            overrides.legend.textStyle.fontSize =
                (overrides.legend.textStyle.fontScaleFactor.x * width +
                    overrides.legend.textStyle.fontScaleFactor.y * height) / 2;
        }

        if (overrides.xAxis?.axisLabel?.fontScaleFactor?.x && overrides.xAxis.axisLabel.fontScaleFactor?.y) {
            overrides.xAxis.axisLabel.fontSize =
                (overrides.xAxis.axisLabel.fontScaleFactor.x * width +
                    overrides.xAxis.axisLabel.fontScaleFactor.y * height) / 2;
        }

        if (overrides.yAxis?.axisLabel?.fontScaleFactor?.x && overrides.yAxis.axisLabel.fontScaleFactor?.y) {
            overrides.yAxis.axisLabel.fontSize =
                (overrides.yAxis.axisLabel.fontScaleFactor.x * width +
                    overrides.yAxis.axisLabel.fontScaleFactor.y * height) / 2;
        }

        if (overrides.xAxis?.nameTextStyle?.fontScaleFactor?.x && overrides.xAxis.nameTextStyle.fontScaleFactor?.y) {
            overrides.xAxis.nameTextStyle.fontSize =
                (overrides.xAxis.nameTextStyle.fontScaleFactor.x * width +
                    overrides.xAxis.nameTextStyle.fontScaleFactor.y * height) / 2;
        }

        if (overrides.yAxis?.nameTextStyle?.fontScaleFactor?.x && overrides.yAxis.nameTextStyle.fontScaleFactor?.y) {
            overrides.yAxis.nameTextStyle.fontSize =
                (overrides.yAxis.nameTextStyle.fontScaleFactor.x * width +
                    overrides.yAxis.nameTextStyle.fontScaleFactor.y * height) / 2;
        }
    }

    const getOptionWithOverrides = () => {
        let option = _.cloneDeep(chartState.getOption())
        if (theme) option = _.cloneDeep(chartState.getOption(theme.themeID))
        let overrides = _.cloneDeep(config.styleOverrides)
        if (theme && theme.chartPreferences) {
            let preferences = typeof theme.chartPreferences === 'string' ? JSON.parse(theme.chartPreferences) : theme.chartPreferences
            overrides = _.merge(_.cloneDeep(preferences), _.cloneDeep(overrides))
        } else {
            option = _.merge(_.cloneDeep(JSON.parse(getDefaultTheme())), option)
        }
        // remove axis for pie and donut
        if (config.seriesType === 'pie' || config.seriesType === 'donut' || config.seriesType === 'gauge' || config.seriesType === 'radialBar') {
            overrides.xAxis.show = false
            overrides.yAxis.show = false
            overrides.legend.icon = 'none'
        }
        // apply font scale
        const height = container.offsetHeight
        const width = container.offsetWidth
        applyFontScale(overrides, width, height);
        //check x axis.show is undefined
        if (overrides.xAxis.show === undefined) {
            overrides.xAxis.show = true
        }
        //check y axis.show is undefined
        if (overrides.yAxis.show === undefined) {
            overrides.yAxis.show = true
        }
        // distribute axis configs
        if ((Array.isArray(option.yAxis) && overrides.yAxis)) {
            option.yAxis.forEach((axisObject, i) => {
                option.yAxis[i] = { ...axisObject, ...overrides.yAxis }
            })
            overrides = _.omit(overrides, ['yAxis'])
        } else {
            if (config.seriesType === 'pictorialBar') option.yAxis = { ...option.yAxis, ...overrides.yAxis }
        }
        if (Array.isArray(option.xAxis) && overrides.xAxis) {
            option.xAxis.forEach((axisObject, i) => {
                option.xAxis[i] = { ...axisObject, ...overrides.xAxis }
            })
            overrides = _.omit(overrides, ['xAxis'])
        } else {
            if (config.seriesType === 'pictorialBar') option.xAxis = { ...option.xAxis, ...overrides.xAxis }
        }
        // apply bar/waterfall configs
        if (config.seriesType === 'waterfall') {
            option.series.forEach((s, i) => {
                if (s.name === 'positive') {
                    option.series[i].itemStyle = { color: overrides.waterfall.upColor }
                    option.series[i].data[0] = {
                        ...option.series[i].data[0],
                        itemStyle: { color: overrides.waterfall.startColor }
                    }
                }
                if (s.name === 'negative') {
                    option.series[i].itemStyle = { color: overrides.waterfall.downColor }
                    const lastIndex = option.series[i].data.length - 1
                    option.series[i].data[lastIndex] = {
                        ...option.series[i].data[lastIndex],
                        itemStyle: { color: overrides.waterfall.endColor }
                    }
                }
            })
        } else {
            if (option.series.some(s => s.type === 'bar')) {
                option.series.forEach((s, i) => {
                    option.series[i] = { ...s, ...overrides.bar }
                })
            }
        }
        // apply line configs
        if (option.series.some(s => s.type === 'line')) {
            option.series.forEach((s, i) => {
                option.series[i] = { ...s, ...overrides.line }
            })
        }
        if (config.seriesType === 'radialBar') {
            overrides.radialBar = _.merge(JSON.parse(getDefaultTheme()).radialBar, overrides.radialBar)
            option = {
                ...option,
                angleAxis: {
                    ...overrides.radialBar.angleAxis,
                    data: { ...chartState?.categoryAxisValues }
                },
                polar: overrides.radialBar.polar,
                radiusAxis: overrides.radialBar.radiusAxis
            }
            const showAsStacked = overrides.radialBar.stack
            option.series.forEach((s, i) => {
                if (showAsStacked) option.series[i].stack = 'total'
                option.series[i].coordinateSystem = 'polar'
                option.series[i].type = 'bar'
                option.series[i].label = {
                    show: true,
                    position: 'middle',
                    formatter: '{b}: {c}',
                    fontSize: 6
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
            const xAxisCopy = _.cloneDeep(option.xAxis);
            const yAxisCopy = _.cloneDeep(option.yAxis);

            if (overrides.pictorialBar.showAsBar) {
                option.xAxis = Array.isArray(yAxisCopy) ? yAxisCopy : { ...yAxisCopy };
                option.yAxis = Array.isArray(xAxisCopy) ? xAxisCopy : { ...xAxisCopy };

                option.series.forEach(seriesItem => {
                    if (seriesItem.yAxisIndex) {
                        seriesItem.xAxisIndex = seriesItem.yAxisIndex;
                        delete seriesItem.yAxisIndex;
                    }
                });
            } else {
                option.xAxis = Array.isArray(xAxisCopy) ? xAxisCopy : { ...xAxisCopy };
                option.yAxis = Array.isArray(yAxisCopy) ? yAxisCopy : { ...yAxisCopy };

                option.series.forEach(seriesItem => {
                    if (seriesItem.xAxisIndex) {
                        seriesItem.yAxisIndex = seriesItem.xAxisIndex;
                        delete seriesItem.xAxisIndex;
                    }
                });
                option.yAxis.forEach((axisObject, i) => {
                    option.yAxis[i] = { ...axisObject, ...overrides.pictorialBar.xAxis }
                })
            }
            option.series.forEach((series, seriesIndex) => {
                if (!overrides.pictorialBar.data[seriesIndex]) {
                    overrides.pictorialBar.data[seriesIndex] = [];
                }

                series.barGap = overrides.pictorialBar.barGap;
                series.barCategoryGap = overrides.pictorialBar.barCategoryGap;

                series.data.forEach((d, i) => {
                    if (typeof d === 'number') {
                        series.data[i] = Object.assign({ value: d }, overrides.pictorialBar.data[seriesIndex][i]);
                    } else {
                        series.data[i] = Object.assign({}, d, overrides.pictorialBar.data[seriesIndex][i]);
                    }
                });
            });
        }
        // apply pie/donut configs
        if (config.seriesType === 'donut') {
            overrides.donut = _.merge(JSON.parse(getDefaultTheme()).donut, overrides.donut)
            option.series.forEach((s, i) => {
                option.series[i] = { ...s, ...overrides.donut }
            })
        } else {
            overrides.pie = _.merge(JSON.parse(getDefaultTheme()).pie, overrides.pie)
            if (option.series.some(s => s.type === 'pie')) {
                option.series.forEach((s, i) => {
                    option.series[i] = { ...s, ...overrides.pie }
                })
            }
        }
        if (config.seriesType === 'gauge') {
            overrides.gauge = _.merge(JSON.parse(getDefaultTheme()).gauge, overrides.gauge)
            overrides.tooltip.show = false
            overrides.legend.show = false
            option.series.forEach((s, i) => {
                s.type = 'gauge'
                if (overrides.gauge?.data && overrides.gauge.data[0]?.value && isNumber(overrides.gauge.data[0])) {
                    option.series[i].data = overrides.gauge?.data
                } else {
                    const name = chartProperties?.categoryAxisValues[0] || ''
                    let value = ((chartProperties?.series[0]?.data[0]?.value || chartProperties?.series[0]?.data[0]) * 100 / chartProperties?.series[0]?.data.reduce((a, b) => a + (b.value || b), 0)).toFixed(3);
                    option.series[i].data = [{ value, name }]
                }
                option.series[i] = { ...s, ...overrides.gauge, data: option.series[i].data }
            })
        }

        if (config.seriesType === 'column' && chartState.categoryLegendData?.length > 1 && !config.stacked) {
            let divisor = 1;
            if (chartState.categoryAxisValues) divisor = chartState.categoryAxisValues?.length - 1;
            if (chartState.categoryLegendData) divisor = divisor + chartState.categoryLegendData?.length - 1;
            option.series.forEach((s, i) => {
                let barWidth = (overrides.bar.barWidth?.split('%')[0] || BAR_DEFAULT_VALUES.barWidth) / divisor
                if (barWidth) {
                    option.series[i] = {...s, ...overrides.bar, barWidth: `${barWidth}%`}
                }
            })
        }
        // apply max legends
        const max = overrides.legend.maxLegends || 10
        // TO-DO , Nesti/Pepe  Gabe put this try-catch to prevent page crash when data is undefined
        try {
            if (max !== 'all') option.legend.data = option?.legend?.data?.slice(0, max)
        } catch (e) {
            //console.log("data undefined, e=", e)
        }
        // omit props we dont wanna merge
        ['waterfall', 'bar', 'line', 'pie', 'donut', 'pictorialBar', 'gauge', 'radialBar', 'table'].forEach(key => {
            overrides = _.omit(overrides, [key]);
        });
        option = _.merge(option, overrides)
        // apply sorting
        if (config.categoryAxis !== 'Time' && option.series.length === 1 && config.sorting !== SORTING.NAT) {
            let axis = 'xAxis'
            if (config.seriesType === 'bar') axis = 'yAxis'
            let tempData = []
            if (config.seriesType === 'pictorialBar') {
                tempData = option[axis].data.map((cat, i)=> ({cat: cat, val: option.series[0].data[i].value}))
            } else {
                tempData = option[axis].data.map((cat, i)=> ({cat: cat, val: option.series[0].data[i]}))
            }
            if (config.sorting === SORTING.ASC) tempData.sort((a, b) => a.val - b.val)
            if (config.sorting === SORTING.DESC) tempData.sort((a, b) => b.val - a.val)
            option[axis].data = tempData.map(d => d.cat)
            if (config.seriesType === 'pictorialBar') {
                option.series[0].data = tempData.map((d, i) => (
                    {value: d.val, name: option[axis].data[i]}
                ))
            } else {
                option.series[0].data = tempData.map(d => d.val)
            }
        }
        return option
    }

    const getScreenshotBgColor = () => {
        if (screenshot) {
            if (theme?.colorScheme?.backgroundColor === '#00000000') {
                if (theme.colorScheme.darkTheme) return 'black'
                else return 'white'
            } else if (config.styleOverrides.backgroundColor === '#00000000') {
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

    return (
        <>
            {
                drillingHistory.length > 0 &&
                <Box
                    className={styles.drillingBreadcrumbsContainer}
                    sx={{
                        backgroundColor: theme?.colorScheme?.backgroundColor ||
                            config.styleOverrides.backgroundColor ||
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
            <Box sx={{width: '100%', height: '100%', backgroundColor: getScreenshotBgColor()}}>
                {
                    loading ?
                        <div style={{width: '100%', height: '100%', display: 'grid', placeContent: 'center'}}>
                            <ScoopLoader size={container.offsetWidth * 0.1} />
                        </div> : (
                            validChart() &&
                            <ReactECharts
                                style={{height: '100%', width: '100%'}}
                                option={getOptionWithOverrides()}
                                notMerge={true}
                                lazyUpdate={true}
                                theme={ScoopTheme}
                                onEvents={onEvents}
                            />
                        )
                }
            </Box>
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
