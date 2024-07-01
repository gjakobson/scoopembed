// src/pages/asset/InsightComponent.js
import ReactECharts from "echarts-for-react";
import { ScoopTheme } from '../../styles/Style';
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import _ from "lodash";
import { Server } from '../api/Server';
import { loadFromSavedInsight, fetchInsight } from '../api/InsightAPI';
import { useApi } from '../api/api';
import ChartState from "../../utils/ChartState";
import { OBJECT_TYPES } from "../api/types";
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';
import CaretRight from '../../../public/icons/CaretRight.svg?url';
import CloseIcon from '../../../public/icons/CloseIcon.svg?url';
import CloseIconWhite from '../../../public/icons/CloseIconWhite.svg?url';

const InsightComponent = ({
    userID,
    workspaceID,
    insightID,
    insightKey,
    workspaceMetadata = {},
    embeddedSizeProps = {
        "left": 0,
        "width": "100%",
        "height": "calc(100% - 55px)"
    },
    clickable = true,
    advanced,
    activePrompts = [],
    dateFlag,
    theme
}) => {
    const [config, setConfig] = useState(ChartState.getDefaultConfig());
    const [chartState, setChartState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [server, setServer] = useState(null);
    const [postData, setPostData] = useState(null);
    const hasFetched = useRef(false);
    const fetchingRef = useRef(new Set());
    const [isChartASkeleton, setIsChartASkeleton] = useState(false);
    const [insightsMaterialized, setInsightsMaterialized] = useState([]);
    const router = useRouter();
    const [style, setStyle] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [seriesName, setSeriesName] = useState(null);
    const [drillColumn, setDrillColumn] = useState(null);
    const [drillingHistory, setDrillingHistory] = useState([]);
    const openMenu = Boolean(anchorEl);
    const isGuestMode = false;
    const objects = [];

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await Auth.currentSession();
                const jwtToken = session.getIdToken().getJwtToken();
                setToken(jwtToken);
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        if (token) {
            const newServer = new Server(workspaceID, userID, token);
            setServer(newServer);
        }
    }, [token, userID, workspaceID]);

    useEffect(() => {
        if (server) {
            const cs = new ChartState(server, config, setConfig);
            cs.workspaceMetadata = workspaceMetadata;
            setChartState(cs);
        }
    }, [server]);

    useEffect(() => {
        if (token) {
            const { postData: apiPostData } = useApi(token);
            setPostData(() => apiPostData);
        }
    }, [token]);

    useEffect(() => {
        if (chartState) {
            const interval = setInterval(() => {
                chartState.getResults({...config, selectedItems: [{columnName: "Unweighted Amount"}, {columnName: "Weighted Amount"}]}, null, activePrompts);
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
            hasFetched.current = true;
            fetchInsight(insightKey, postData)
                .then((result) => {
                    loadFromSavedInsight(
                        result,
                        setConfig,
                        chartState,
                        setIsChartASkeleton,
                        insightID,
                        insightKey,
                        workspaceID,
                        getInsightPrompts(),
                        workspaceMetadata
                    );
                    if (setInsightsMaterialized) setInsightsMaterialized(prevInsights => [...prevInsights, insightKey]);
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
        if (!chartState) {
            return false;
        }
        return chartState.series && chartState.series.length > 0 && ((chartState.result.dates && chartState.result.dates.length > 0) || chartState.series[0].data.length > 0);
    }

    const chartSetting = {
        height: embeddedSizeProps ? embeddedSizeProps.height : (window.innerHeight - 200) + "px",
        marginLeft: embeddedSizeProps ? embeddedSizeProps.left : 300,
        marginRight: embeddedSizeProps ? 0 : 300,
        pointerEvents: clickable ? 'all' : 'none'
    };

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
        if (!chartState) {
            return {};
        }
        let option = chartState.getOption();
        if (theme) option = chartState.getOption(theme.themeID);
        let overrides = {...config.styleOverrides};
        if (Array.isArray(option.yAxis) && overrides.yAxis) {
            option.yAxis.forEach((axisObject, i) => {
                option.yAxis[i] = {...option.yAxis[i], ...overrides.yAxis};
            });
            overrides = _.omit(overrides, ['yAxis']);
        }
        option = _.merge(option, overrides);
        return option;
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
                validChart() &&

                            <ReactECharts
                                option={getOptionWithOverrides()}
                                notMerge={true}
                                lazyUpdate={true}
                                // style={chartSetting}
                                theme={ScoopTheme}
                                onEvents={onEvents}
                            />
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
