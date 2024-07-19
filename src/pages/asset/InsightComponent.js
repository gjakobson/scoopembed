// src/pages/asset/InsightComponent.js
import ReactECharts from "echarts-for-react";
import { ScoopTheme } from '@/styles/Style';
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import _ from "lodash";
import { loadFromSavedInsight, fetchInsight } from '../api/InsightAPI';
import ChartState from "../../utils/ChartState";
import { OBJECT_TYPES } from "../api/types";
import CaretRight from '../../../public/icons/CaretRight.svg?url';
import CloseIcon from '../../../public/icons/CloseIcon.svg?url';
import CloseIconWhite from '../../../public/icons/CloseIconWhite.svg?url';
import {useApi} from "@/pages/api/api";
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";

const InsightComponent = ({
    token,
    workspaceID,
    insightID,
    server,
    insightKey,
    workspaceMetadata,
    embeddedSizeProps = {
        "left": 0,
        "width": "100%",
        "height": "calc(100% - 55px)"
    },
    advanced,
    activePrompts = [],
    theme
}) => {

    const { postData } = useApi(token);
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
    const isGuestMode = false;
    const objects = [];

    useEffect(() => {
        if (workspaceMetadata) {
            const cs = chartState;
            cs.workspaceMetadata = workspaceMetadata;
            setChartState(cs);
        }
    }, [workspaceMetadata]);

    useEffect(() => {
        if (chartState) {
            const interval = setInterval(() => {
                chartState.getResults({...config}, null, activePrompts);
            }, 10000); // 10 seconds

            return () => clearInterval(interval); // Cleanup interval on component unmount
        }
    }, [config, activePrompts, chartState]);

    const getInsightPrompts = () => {
        let prompts;
        if (isGuestMode && guestPrompts.length > 0) prompts = guestPrompts;
        else prompts = objects.filter(obj => obj.type === OBJECT_TYPES.PROMPT);
        return prompts.filter(prompt => prompt.promptProps?.objects.includes(insightID))
            .map(prompt => prompt.promptProps.prompt)
            .filter(prompt => prompt !== null);
    };

    const updateInsight = () => {
        if (!hasFetched.current && insightKey && postData) {
            setLoading(true)
            hasFetched.current = true;
            fetchInsight(insightKey, postData)
                .then((result) => {
                    loadFromSavedInsight(
                        result,
                        setConfig,
                        chartState,
                        insightID,
                        insightKey,
                        workspaceID,
                        getInsightPrompts(),
                        workspaceMetadata,
                        () => setLoading(false)
                    );
                })
                .catch(error => {
                    console.error("Error fetching insight:", error);
                })
                .finally(() => {
                    fetchingRef.current.delete(insightKey);
                });
        }
    };

    useEffect(() => {
        if (chartState && postData) {
            updateInsight();
        }
    }, [chartState, postData]);

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
        if (advanced && analyzeChanges && chartState.changeDrillAttributes?.length > 0) {
            changeDrillAtts = advanced && analyzeChanges && chartState.changeDrillAttributes.map((item) => {
                if (item === chartState.categoryAxis || item === chartState.config.drillAttribute) {
                    return null;
                }
                return (<MenuItem key={item} value={item} onClick={handleChartMenuClose}>{item}</MenuItem>);
            });
        }
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

    const getOptionWithOverrides = () => {
        let option = chartState.getOption()
        if (theme) option = chartState.getOption(theme.themeID)
        // here treat chart specific configs before doing the merge
        let overrides = _.cloneDeep(config.styleOverrides)
        // remove axis for pie and donut
        if (config.seriesType === 'pie' || config.seriesType === 'donut') {
            overrides.xAxis.show = false
            overrides.yAxis.show = false
            overrides.legend.icon = 'none'
        }
        // apply font scale
        const container = document.getElementById('scoop-element-container')
        const height = container.offsetHeight
        const width = container.offsetWidth
        if (height > width) {
            overrides.title.textStyle.fontSize = overrides.title.textStyle.fontScaleFactor.x * width
            overrides.legend.textStyle.fontSize = overrides.legend.textStyle.fontScaleFactor.x * width
            overrides.xAxis.axisLabel.fontSize = overrides.xAxis.axisLabel.fontScaleFactor.x * width
            overrides.yAxis.axisLabel.fontSize = overrides.yAxis.axisLabel.fontScaleFactor.x * width
            overrides.xAxis.nameTextStyle.fontSize = overrides.xAxis.nameTextStyle.fontScaleFactor.x * width
            overrides.yAxis.nameTextStyle.fontSize = overrides.yAxis.nameTextStyle.fontScaleFactor.x * width
        } else {
            overrides.title.textStyle.fontSize = overrides.title.textStyle.fontScaleFactor.y * height
            overrides.legend.textStyle.fontSize = overrides.legend.textStyle.fontScaleFactor.y * height
            overrides.xAxis.axisLabel.fontSize = overrides.xAxis.axisLabel.fontScaleFactor.y * height
            overrides.yAxis.axisLabel.fontSize = overrides.yAxis.axisLabel.fontScaleFactor.y * height
            overrides.xAxis.nameTextStyle.fontSize = overrides.xAxis.nameTextStyle.fontScaleFactor.y * height
            overrides.yAxis.nameTextStyle.fontSize = overrides.yAxis.nameTextStyle.fontScaleFactor.y * height
        }
        // distribute axis configs
        if (Array.isArray(option.yAxis) && overrides.yAxis) {
            option.yAxis.forEach((axisObject, i) => {
                option.yAxis[i] = { ...axisObject, ...overrides.yAxis }
            })
            overrides = _.omit(overrides, ['yAxis'])
        }
        if (Array.isArray(option.xAxis) && overrides.xAxis) {
            option.xAxis.forEach((axisObject, i) => {
                option.xAxis[i] = { ...axisObject, ...overrides.xAxis }
            })
            overrides = _.omit(overrides, ['xAxis'])
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
        // apply pie/donut configs
        if (config.seriesType === 'donut') {
            option.series.forEach((s, i) => {
                option.series[i] = { ...s, ...overrides.donut }
            })
        } else {
            if (option.series.some(s => s.type === 'pie')) {
                option.series.forEach((s, i) => {
                    option.series[i] = { ...s, ...overrides.pie }
                })
            }
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
        overrides = _.omit(overrides, ['waterfall'])
        overrides = _.omit(overrides, ['bar'])
        overrides = _.omit(overrides, ['line'])
        overrides = _.omit(overrides, ['pie'])
        overrides = _.omit(overrides, ['donut'])
        option = _.merge(option, overrides)
        return option
    };

    return (
        <>
            {
                embeddedSizeProps &&
                <Box className={'drilling-breadcrumbs-container'}>
                    {
                        drillingHistory.map((step, i) => (
                            <Box
                                key={i + step.attribute}
                                className={'drill-step'}
                                sx={{color: theme?.colorScheme?.darkTheme ? 'white' : 'black'}}
                            >
                                <Typography
                                    className={`inter ${isStepClickable(i) ? 'clickable-step' : ''}`}
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
                                            src={theme?.colorScheme?.darkTheme ? CloseIconWhite : CloseIcon}
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
            {
                loading ?
                    <ScoopLoader /> :
                    (validChart() &&
                    <ReactECharts
                        option={getOptionWithOverrides()}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={ScoopTheme}
                        onEvents={onEvents}
                    />)
            }
            <Menu
                id="basic-menu"
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
