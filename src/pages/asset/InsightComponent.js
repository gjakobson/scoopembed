import ReactECharts from "echarts-for-react";
import { ScoopTheme } from '../../styles/Style';
import React, { useRef, useState, useEffect, useMemo } from "react";
import {Box, IconButton, Menu, MenuItem} from "@mui/material";
import _ from "lodash";
// import {ScoopLoader} from "../common/Spinner/ScoopLoader";
import Typography from "@mui/material/Typography";
// import './Insight.css';
import CaretRight from '../../icons/CaretRight.svg';
import CloseIcon from '../../icons/CloseIcon.svg';
import CloseIconWhite from '../../icons/CloseIconWhite.svg';
import { Server } from '../api/Server'
import {loadFromSavedInsight, fetchInsight} from '../api/InsightAPI';
import {useApi} from '../api/api';
import ChartState from "./ChartState";
import {OBJECT_TYPES} from "../api/types";

const InsightComponent = ({
    workspaceMetadata = {
        "workspaceName": "Recipe Examples",
        "inboxes": [
            {
                "inboxName": "ad_performance_byron_scoop_analytics_com",
                "label": "Ad Performance",
                "description": "Ad Performance",
                "inboxID": "I1595",
                "workspaceID": "W283",
                "inboxType": "robot",
                "tables": [
                    {
                        "tableName": "ad_performance_byron_scoop_analytics_com (version 2)",
                        "reportSeriesTableID": "I1595_128799321",
                        "snapshot": true,
                        "columns": [
                            {
                                "columnName": "Start Date in UTC",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Account Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Currency",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Campaign Group ID",
                                "columnType": "Integer",
                                "format": "#,###,###,###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Campaign Group Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Campaign Group Status",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Campaign Group Start Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Campaign Group End Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Campaign ID",
                                "columnType": "Integer",
                                "format": "#,###,###,###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Campaign Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Campaign Objective",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Campaign Type",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Campaign Status",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Cost Type",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Daily Budget",
                                "columnType": "Decimal",
                                "format": "#,###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Campaign Start Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Campaign End Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Creative Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Ad ID",
                                "columnType": "Integer",
                                "format": "#,###,###,###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Creative Status",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Ad Introduction Text",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Ad Headline",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Ad Line",
                                "columnType": "Empty"
                            },
                            {
                                "columnName": "Click URL",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Sponsored Update Type",
                                "columnType": "String"
                            },
                            {
                                "columnName": "DSC Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Total Spent",
                                "columnType": "Decimal",
                                "format": "#,###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Impressions",
                                "columnType": "Integer",
                                "format": "##,###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Clicks",
                                "columnType": "Integer",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Click Through Rate",
                                "columnType": "Decimal",
                                "format": "0.00%",
                                "aggRule": "Avg",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Average CPM",
                                "columnType": "Decimal",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Average CPC",
                                "columnType": "Decimal",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Reactions",
                                "columnType": "Integer",
                                "format": "##",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Comments",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Shares",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Follows",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Other Clicks",
                                "columnType": "Integer",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Total Social Actions",
                                "columnType": "Integer",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Total Engagements",
                                "columnType": "Integer",
                                "format": "#,###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Engagement Rate",
                                "columnType": "Decimal",
                                "format": "0.00%",
                                "aggRule": "Avg",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Impressions",
                                "columnType": "Integer",
                                "format": "##",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Clicks",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Reactions",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Comments",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Shares",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Follows",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Other Clicks",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Conversions",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Post-Click Conversions",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "View-Through Conversions",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Conversion Rate",
                                "columnType": "Integer",
                                "format": "0%",
                                "aggRule": "Avg",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Cost per Conversion",
                                "columnType": "Decimal",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Total Conversion Value",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Return on Ad Spend",
                                "columnType": "Decimal",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Conversions",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Post-Click Conversions",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral View-Through Conversions",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Leads",
                                "columnType": "Integer",
                                "format": "##",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Lead Forms Opened",
                                "columnType": "Integer",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Lead Form Completion Rate",
                                "columnType": "Decimal",
                                "format": "0.00%",
                                "aggRule": "Avg",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Cost per Lead",
                                "columnType": "Decimal",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Event Registrations",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Click Event Registrations",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "View Event Registrations",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Event Registrations",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral Click Event Registrations",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Viral View Event Registrations",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Clicks to Landing Page",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Clicks to LinkedIn Page",
                                "columnType": "Integer",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Leads Work Email",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Lead Form Completion Rate Work Email",
                                "columnType": "Integer",
                                "format": "0%",
                                "aggRule": "Avg",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Cost Per Lead Work Email",
                                "columnType": "Decimal",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Member Follows",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            }
                        ],
                        "dates": [
                            "Start Date in UTC",
                            "Campaign Group Start Date",
                            "Campaign Group End Date",
                            "Campaign Start Date",
                            "Campaign End Date"
                        ]
                    },
                    {
                        "tableName": "ad_performance_byron_scoop_analytics_com",
                        "reportSeriesTableID": "I1595_2541518307",
                        "snapshot": true,
                        "columns": [
                            {
                                "columnName": "Ad Performance Report in UTC",
                                "columnType": "String"
                            }
                        ]
                    }
                ]
            },
            {
                "inboxName": "W283_Activity and Opportunity Join",
                "label": "Activity and Opportunity Blend",
                "inboxID": "I1440",
                "workspaceID": "W283",
                "inboxType": "calculated",
                "transactional": true,
                "keepOnlyCurrent": true,
                "calculatedWorksheetID": "19JHHVtvIZVnr40VlVh3z7oqHO5Aj8hktGn_jJBca4Kg",
                "captureDefinition": {
                    "captureItems": [
                        {
                            "name": "Load date",
                            "patternBefore": "Load date:",
                            "maxLength": 0,
                            "inferTimestamp": true
                        }
                    ]
                },
                "tables": []
            },
            {
                "inboxName": "W283_New Cohort Dataset ",
                "label": "New Cohort Dataset ",
                "inboxID": "I1441",
                "workspaceID": "W283",
                "inboxType": "calculated",
                "transactional": true,
                "keepOnlyCurrent": true,
                "calculatedWorksheetID": "1kDy5g23zPHFuCHqexg_O__7CakY7Cd5q8DlnBCrtcYA",
                "captureDefinition": {
                    "captureItems": [
                        {
                            "name": "Load date",
                            "patternBefore": "Load date:",
                            "maxLength": 0,
                            "inferTimestamp": true
                        }
                    ]
                },
                "tables": [
                    {
                        "tableName": "New Cohort Dataset ",
                        "reportSeriesTableID": "I1441_3615506275",
                        "snapshot": false,
                        "columns": [
                            {
                                "columnName": "Opportunity Owner",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Opportunity Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Stage",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Close Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Created Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Type",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Opportunity ID",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Amount",
                                "columnType": "Decimal",
                                "format": "#,###.###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Scoop Forecast Category",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Close Month",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Stage 2",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Amount 2",
                                "columnType": "Decimal",
                                "format": "#,###.###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Account Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Expected Revenue",
                                "columnType": "Decimal",
                                "format": "#,###.###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Channel",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Expected Revenue 2",
                                "columnType": "Decimal",
                                "format": "#,###.###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Forecast Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Text Month is Load Month",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Forecast Amount",
                                "columnType": "Decimal",
                                "format": "#,###.###",
                                "isMeasure": true
                            }
                        ],
                        "dates": [
                            "Close Date",
                            "Created Date",
                            "Forecast Date"
                        ]
                    }
                ]
            },
            {
                "inboxName": "W283_salesforce_activity_report_byron_scoop_analytics_com",
                "label": "Salesforce Activity Report",
                "description": "",
                "inboxID": "I1442",
                "workspaceID": "W283",
                "inboxType": "email",
                "calculatedWorksheetID": "1ahGAkozI2uv03Zl3h9L-iptXyyYr4yVnT--YhfKkTX8",
                "tables": [
                    {
                        "tableName": "Salesforce Activity Report",
                        "reportSeriesTableID": "I1442_939616813",
                        "snapshot": true,
                        "columns": [
                            {
                                "columnName": "Subject",
                                "columnType": "String"
                            },
                            {
                                "columnName": "First Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Last Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Type",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Task Subtype",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Event Subtype",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Due Time",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Completed Date/Time",
                                "columnType": "DateTime",
                                "format": "MM/dd/yyyy,hh:mm a"
                            },
                            {
                                "columnName": "Assigned",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Call Type",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Status",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Account Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Deal count",
                                "columnType": "Decimal",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Complete Date",
                                "columnType": "Empty"
                            }
                        ],
                        "dates": [
                            "Completed Date/Time"
                        ]
                    }
                ]
            },
            {
                "inboxName": "W283_scoop_daily_data_wynne_rocketreach_co",
                "label": "Salesforce Opportunity Report",
                "description": "",
                "inboxID": "I1443",
                "workspaceID": "W283",
                "inboxType": "email",
                "calculatedWorksheetID": "1dVSpdkPGJG2U3g5d0MVsv_04CHbS4zOFTEQS64bkGSY",
                "tables": [
                    {
                        "tableName": "Scoop Daily Data",
                        "reportSeriesTableID": "I1443_3939061382",
                        "snapshot": true,
                        "columns": [
                            {
                                "columnName": "Opportunity Owner",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Account Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Opportunity Name",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Stage",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Fiscal Period",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Amount",
                                "columnType": "Currency",
                                "format": "#,##0.###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Expected Revenue",
                                "columnType": "Currency",
                                "format": "#,##0.###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Probability pct",
                                "columnType": "Integer",
                                "format": "###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Age",
                                "columnType": "Decimal",
                                "format": "#,##0.###",
                                "aggRule": "Avg",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Close Date",
                                "columnType": "DateTime",
                                "format": "MM/dd/yyyy"
                            },
                            {
                                "columnName": "Created Date",
                                "columnType": "DateTime",
                                "format": "MM/dd/yyyy"
                            },
                            {
                                "columnName": "Lead Source",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Type",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Opportunity ID",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Forecast Category",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Last Activity",
                                "columnType": "DateTime",
                                "format": "MM/dd/yyyy"
                            },
                            {
                                "columnName": "Previous Opportunity Amount",
                                "columnType": "Decimal",
                                "format": "#,##0.###",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Scoop Forecast Category",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Close Month",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Expected Amount",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Scoop Forecast",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Open Time",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Channel",
                                "columnType": "String"
                            },
                            {
                                "columnName": "First Day of month",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Close Month is Load Month",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Text Load Month",
                                "columnType": "String"
                            },
                            {
                                "columnName": "End of Month",
                                "columnType": "String"
                            },
                            {
                                "columnName": "Forecast Close Date",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Sales Manger",
                                "columnType": "String"
                            },
                            {
                                "columnName": "New/Upsell/Expansion Amount",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Past Close Date",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "No Amount",
                                "columnType": "Integer",
                                "format": "#",
                                "isMeasure": true
                            },
                            {
                                "columnName": "Closed Week",
                                "columnType": "DateTime"
                            },
                            {
                                "columnName": "Forecasted Close Date",
                                "columnType": "Empty"
                            }
                        ],
                        "dates": [
                            "Close Date",
                            "Created Date",
                            "Last Activity"
                        ]
                    }
                ]
            },
            {
                "inboxName": "Waterfall",
                "label": "Waterfall",
                "inboxID": "I1504",
                "workspaceID": "W283",
                "inboxType": "calculated",
                "transactional": true,
                "keepOnlyCurrent": true,
                "calculatedWorksheetID": "1-gswlZQ6891VugKbKl6Cm-RwPx9dFTFE6RQL8MOlxBM",
                "captureDefinition": {
                    "captureItems": [
                        {
                            "name": "Load date",
                            "patternBefore": "Load date:",
                            "maxLength": 0,
                            "inferTimestamp": true
                        }
                    ]
                },
                "tables": []
            }
        ],
        "kpis": [
            {
                "metricKey": "M9539",
                "workspaceID": "W283",
                "metricName": "Activity Count",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Opportunity ID",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0,
                "aggRule": "Count"
            },
            {
                "metricKey": "M9457",
                "workspaceID": "W283",
                "metricName": "Amount by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Weekly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9458",
                "workspaceID": "W283",
                "metricName": "Amount by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 2,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9509",
                "workspaceID": "W283",
                "metricName": "Average Amount by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0,
                "aggRule": "Avg"
            },
            {
                "metricKey": "M9459",
                "workspaceID": "W283",
                "metricName": "Average Deal Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Weekly",
                "numPeriodsShifted": 0,
                "aggRule": "Avg"
            },
            {
                "metricKey": "M9464",
                "workspaceID": "W283",
                "metricName": "Avg Age by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Age",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9465",
                "workspaceID": "W283",
                "metricName": "Avg Age by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Age",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9463",
                "workspaceID": "W283",
                "metricName": "Avg Age by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Age",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9504",
                "workspaceID": "W283",
                "metricName": "Awaiting Signature to Closed Won Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Awaiting Signature\",\"Closed Won\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9493",
                "workspaceID": "W283",
                "metricName": "Close Month is Load Month by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Close Month is Load Month",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9494",
                "workspaceID": "W283",
                "metricName": "Close Month is Load Month by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Close Month is Load Month",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9495",
                "workspaceID": "W283",
                "metricName": "Close Month is Load Month by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Close Month is Load Month",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9492",
                "workspaceID": "W283",
                "metricName": "Close Month is Load Month by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Close Month is Load Month",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9541",
                "workspaceID": "W283",
                "metricName": "Closed Won Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1441_3615506275",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "savedFilterID": "S24",
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9505",
                "workspaceID": "W283",
                "metricName": "Closed Won Amount Change",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": -1,
                "shiftPeriod": "Weekly"
            },
            {
                "metricKey": "M9474",
                "workspaceID": "W283",
                "metricName": "Closed Won Deal Count by Month",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Opportunity ID",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "savedFilterID": "S25",
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0,
                "aggRule": "Count"
            },
            {
                "metricKey": "M9554",
                "workspaceID": "W283",
                "metricName": "Closed Won and Forecasted Ratio",
                "derived": true,
                "metricType": "KPI",
                "formula": "'Cohort Close Won Amount'/'Cohort Forecast Amount'",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9551",
                "workspaceID": "W283",
                "metricName": "Cohort Close Won Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1441_3615506275",
                "measureName": "Amount 2",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "savedFilterID": "S137",
                "dateKeyIndex": 3,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9553",
                "workspaceID": "W283",
                "metricName": "Cohort Forecast Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1441_3615506275",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "savedFilterID": "S133",
                "dateKeyIndex": 3,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9550",
                "workspaceID": "W283",
                "metricName": "Cohort Weighted Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1441_3615506275",
                "measureName": "Expected Revenue",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "savedFilterID": "S136",
                "dateKeyIndex": 3,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9496",
                "workspaceID": "W283",
                "metricName": "Conversion Count",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",2,\"Qualified\",\"Proof of Concept\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9487",
                "workspaceID": "W283",
                "metricName": "Conversion Rate",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Qualified\",\"Proof of Concept\")",
                "reportSeriesTableID": "Metric",
                "measureName": "",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9497",
                "workspaceID": "W283",
                "metricName": "Conversion Total",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",1,\"Qualified\",\"Proof of Concept\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9747",
                "workspaceID": "W283",
                "metricName": "Count by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Opportunity ID",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0,
                "aggRule": "Count"
            },
            {
                "metricKey": "M9544",
                "workspaceID": "W283",
                "metricName": "Coverage Ratio",
                "derived": true,
                "metricType": "KPI",
                "formula": "'Amount By Close Date' / 'Weekly Goal'",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9546",
                "workspaceID": "W283",
                "metricName": "Daily Forecast Change",
                "derived": false,
                "metricType": "KPIDifferenceFromPriorPeriod",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0,
                "shiftPeriod": "Daily"
            },
            {
                "metricKey": "M9460",
                "workspaceID": "W283",
                "metricName": "Deal Count",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Opportunity Name",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 2,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0,
                "aggRule": "Count"
            },
            {
                "metricKey": "M9540",
                "workspaceID": "W283",
                "metricName": "Deal Count by Create Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Opportunity ID",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 2,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0,
                "aggRule": "Count"
            },
            {
                "metricKey": "M9507",
                "workspaceID": "W283",
                "metricName": "Deal count by Completed Date/Time",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1442_939616813",
                "measureName": "Deal count",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9506",
                "workspaceID": "W283",
                "metricName": "Deal count by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1442_939616813",
                "measureName": "Deal count",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9484",
                "workspaceID": "W283",
                "metricName": "Expected Amount by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Amount",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9485",
                "workspaceID": "W283",
                "metricName": "Expected Amount by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Amount",
                "dateKeyIndex": 2,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9486",
                "workspaceID": "W283",
                "metricName": "Expected Amount by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Amount",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9483",
                "workspaceID": "W283",
                "metricName": "Expected Amount by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Amount",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9476",
                "workspaceID": "W283",
                "metricName": "Expected Revenue by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Revenue",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9477",
                "workspaceID": "W283",
                "metricName": "Expected Revenue by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Revenue",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9478",
                "workspaceID": "W283",
                "metricName": "Expected Revenue by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Revenue",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9475",
                "workspaceID": "W283",
                "metricName": "Expected Revenue by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Expected Revenue",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9559",
                "workspaceID": "W283",
                "metricName": "Forecast Accuracy",
                "derived": true,
                "metricType": "KPI",
                "formula": "'Cohort Close Won Amount'/'Cohort Forecast Amount'",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "0.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9545",
                "workspaceID": "W283",
                "metricName": "Forecast Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Weekly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9473",
                "workspaceID": "W283",
                "metricName": "Forecast Change",
                "derived": false,
                "metricType": "KPIDifferenceFromPriorPeriod",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Weekly",
                "numPeriodsShifted": 0,
                "shiftPeriod": "Weekly"
            },
            {
                "metricKey": "M9512",
                "workspaceID": "W283",
                "metricName": "Forecast Change New",
                "derived": false,
                "metricType": "KPIDifferenceFromPriorPeriod",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": -1,
                "shiftPeriod": "Weekly"
            },
            {
                "metricKey": "M9555",
                "workspaceID": "W283",
                "metricName": "Forecasting Percentage Accuracy",
                "derived": true,
                "metricType": "KPI",
                "formula": "'Cohort Close Won Amount'/'Cohort Forecast Amount'",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9462",
                "workspaceID": "W283",
                "metricName": "Max Deal Size",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Weekly",
                "numPeriodsShifted": 0,
                "aggRule": "Max"
            },
            {
                "metricKey": "M9461",
                "workspaceID": "W283",
                "metricName": "Min Amount Deal by Week",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Weekly",
                "numPeriodsShifted": 0,
                "aggRule": "Min"
            },
            {
                "metricKey": "M9542",
                "workspaceID": "W283",
                "metricName": "Min Close Week",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Closed Week",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0,
                "aggRule": "Min"
            },
            {
                "metricKey": "M9503",
                "workspaceID": "W283",
                "metricName": "Negotiation to Closed Won Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Negotiation\",\"Closed Won\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9536",
                "workspaceID": "W283",
                "metricName": "Net ARR by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Net ARR",
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9537",
                "workspaceID": "W283",
                "metricName": "Net ARR by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Net ARR",
                "dateKeyIndex": 2,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9538",
                "workspaceID": "W283",
                "metricName": "Net ARR by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Net ARR",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9535",
                "workspaceID": "W283",
                "metricName": "Net ARR by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Net ARR",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9508",
                "workspaceID": "W283",
                "metricName": "New KPI",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1442_939616813",
                "measureName": "Subject",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0,
                "aggRule": "Count"
            },
            {
                "metricKey": "M9528",
                "workspaceID": "W283",
                "metricName": "New/Upsell Amount by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9529",
                "workspaceID": "W283",
                "metricName": "New/Upsell Amount by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9530",
                "workspaceID": "W283",
                "metricName": "New/Upsell Amount by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9527",
                "workspaceID": "W283",
                "metricName": "New/Upsell Amount by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9532",
                "workspaceID": "W283",
                "metricName": "New/Upsell/Expansion Amount by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9533",
                "workspaceID": "W283",
                "metricName": "New/Upsell/Expansion Amount by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9534",
                "workspaceID": "W283",
                "metricName": "New/Upsell/Expansion Amount by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9531",
                "workspaceID": "W283",
                "metricName": "New/Upsell/Expansion Amount by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9511",
                "workspaceID": "W283",
                "metricName": "Number Count by Completed Date/Time",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Number Count",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9510",
                "workspaceID": "W283",
                "metricName": "Number Count by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Number Count",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9467",
                "workspaceID": "W283",
                "metricName": "Open Time by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Open Time",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9468",
                "workspaceID": "W283",
                "metricName": "Open Time by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Open Time",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9469",
                "workspaceID": "W283",
                "metricName": "Open Time by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Open Time",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9466",
                "workspaceID": "W283",
                "metricName": "Open Time by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Open Time",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9472",
                "workspaceID": "W283",
                "metricName": "POC to Closed Won",
                "derived": true,
                "metricType": "KPI",
                "reportSeriesTableID": "Metric",
                "measureName": "Subject",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9746",
                "workspaceID": "W283",
                "metricName": "POC to Validation Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopNextConversion(\"New Revenue Diagram\",0,\"Proof of Concept\",\"Validation\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9471",
                "workspaceID": "W283",
                "metricName": "Past Due by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Past Due",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9470",
                "workspaceID": "W283",
                "metricName": "Past Due by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Past Due",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9514",
                "workspaceID": "W283",
                "metricName": "Previous Opportunity Amount by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Previous Opportunity Amount",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9515",
                "workspaceID": "W283",
                "metricName": "Previous Opportunity Amount by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Previous Opportunity Amount",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9516",
                "workspaceID": "W283",
                "metricName": "Previous Opportunity Amount by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Previous Opportunity Amount",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9513",
                "workspaceID": "W283",
                "metricName": "Previous Opportunity Amount by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Previous Opportunity Amount",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9480",
                "workspaceID": "W283",
                "metricName": "Probability pct by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Probability pct",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9481",
                "workspaceID": "W283",
                "metricName": "Probability pct by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Probability pct",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9482",
                "workspaceID": "W283",
                "metricName": "Probability pct by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Probability pct",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9479",
                "workspaceID": "W283",
                "metricName": "Probability pct by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Probability pct",
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9500",
                "workspaceID": "W283",
                "metricName": "Proof of Concept to Close Won Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Proof of Concept\",\"Closed Won\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9498",
                "workspaceID": "W283",
                "metricName": "Qualified to Close Won Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Qualified\",\"Closed Won\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9524",
                "workspaceID": "W283",
                "metricName": "Renewal Delta Amount by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Renewal Delta Amount",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9525",
                "workspaceID": "W283",
                "metricName": "Renewal Delta Amount by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Renewal Delta Amount",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9526",
                "workspaceID": "W283",
                "metricName": "Renewal Delta Amount by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Renewal Delta Amount",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9523",
                "workspaceID": "W283",
                "metricName": "Renewal Delta Amount by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Renewal Delta Amount",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9456",
                "workspaceID": "W283",
                "metricName": "Snapshot Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Amount",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9521",
                "workspaceID": "W283",
                "metricName": "Time from Negotiation to Awaiting Signature",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopNextConversion(\"Revenue Diagram\",3,\"Negotiation\",\"Awaiting Signature\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,##.0",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9520",
                "workspaceID": "W283",
                "metricName": "Time from Proof of Concept to Validation",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopNextConversion(\"Revenue Diagram\",3,\"Proof of Concept\",\"Validation\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,##.0",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9519",
                "workspaceID": "W283",
                "metricName": "Time from Qualified to POC",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopNextConversion(\"Revenue Diagram\",3,\"Qualified\",\"Proof of Concept\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,##.000",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 3
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9517",
                "workspaceID": "W283",
                "metricName": "Time from Validation to Closed Won",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",3,\"Validation\",\"Closed Won\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,##.0",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9518",
                "workspaceID": "W283",
                "metricName": "Time from Validation to Negotiation ",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopNextConversion(\"Revenue Diagram\",0,\"Validation\",\"Negotiation\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,##.00",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 2
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9489",
                "workspaceID": "W283",
                "metricName": "Timestamp by Close Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Timestamp",
                "dateKeyIndex": 1,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9490",
                "workspaceID": "W283",
                "metricName": "Timestamp by Created Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Timestamp",
                "dateKeyIndex": 2,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9491",
                "workspaceID": "W283",
                "metricName": "Timestamp by Last Activity",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Timestamp",
                "dateKeyIndex": 3,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9488",
                "workspaceID": "W283",
                "metricName": "Timestamp by Snapshot Date",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Timestamp",
                "dateKeyIndex": 0,
                "transactional": false,
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9501",
                "workspaceID": "W283",
                "metricName": "Trial to Close Won Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Trial\",\"Closed Won\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9502",
                "workspaceID": "W283",
                "metricName": "Validation to Close Won Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Validation\",\"Closed Won\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9499",
                "workspaceID": "W283",
                "metricName": "Validation to Negotiation Conversion",
                "derived": true,
                "metricType": "KPI",
                "formula": "ScoopFinalConversion(\"Revenue Diagram\",0,\"Validation\",\"Negotiation\")",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Monthly",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9543",
                "workspaceID": "W283",
                "metricName": "Weekly Goal",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1443_3939061382",
                "measureName": "Goal",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "dateKeyIndex": 1,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Weekly",
                "numPeriodsShifted": 0,
                "aggRule": "Min"
            },
            {
                "metricKey": "M9547",
                "workspaceID": "W283",
                "metricName": "Weighted Amount",
                "derived": false,
                "metricType": "KPI",
                "reportSeriesTableID": "I1441_3615506275",
                "measureName": "Expected Revenue",
                "format": {
                    "formatString": "#,###",
                    "formatStyle": {
                        "style": "decimal",
                        "maximumFractionDigits": 0
                    }
                },
                "savedFilterID": "S127",
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            },
            {
                "metricKey": "M9552",
                "workspaceID": "W283",
                "metricName": "Weighting Accuracy",
                "derived": true,
                "metricType": "KPI",
                "formula": "'Cohort Close Won Amount'/'Cohort Weighted Amount'",
                "reportSeriesTableID": "Metric",
                "format": {
                    "formatString": "#,###.0%",
                    "formatStyle": {
                        "style": "percent",
                        "maximumFractionDigits": 1
                    }
                },
                "dateKeyIndex": 0,
                "transactional": false,
                "calendarType": "Rolling",
                "period": "Daily",
                "numPeriodsShifted": 0
            }
        ],
        "filters": [
            {
                "savedFilterKey": "S126",
                "filterName": "New Bus Filter for Recipe",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Closed Won",
                                    "Awaiting Signature",
                                    "Negotiation",
                                    "Proof of Concept",
                                    "Validation"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S127",
                "filterName": "Weighted KPI Filter",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Closed Won",
                                    "Awaiting Signature",
                                    "Proof of Concept",
                                    "Validation",
                                    "Qualified",
                                    "Negotiation"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S128",
                "filterName": "POC Stage",
                "workspaceID": "W283",
                "filter": {
                    "tableQualifier": null,
                    "attributeName": "Stage",
                    "operator": "Equals",
                    "filterValue": {
                        "values": [
                            "Proof of Concept"
                        ],
                        "setFilter": null
                    }
                }
            },
            {
                "savedFilterKey": "S129",
                "filterName": "New Business Stage Filter",
                "workspaceID": "W283",
                "filter": {
                    "tableQualifier": null,
                    "attributeName": "Type",
                    "operator": "Equals",
                    "filterValue": {
                        "values": [
                            "New Business"
                        ],
                        "setFilter": null
                    }
                }
            },
            {
                "savedFilterKey": "S130",
                "filterName": "New Business POCs",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Proof of Concept"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S131",
                "filterName": "Closed Won New Business",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Closed Won"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S132",
                "filterName": "Closed Won Filter for KPI Conversion",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Close Month",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "11/2023"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Closed Won"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S133",
                "filterName": "Forecast Amount Cohort Filter",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Awaiting Signature",
                                    "Proof of Concept",
                                    "Qualified",
                                    "Validation",
                                    "Trial",
                                    "Negotiation"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Scoop Forecast Category",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Commit",
                                    "Best Case"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S134",
                "filterName": "Save filter test",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Channel",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Inbound"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Commit"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S135",
                "filterName": "Weighted KPI Filter 4.12",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Text Month is Load Month",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "TRUE"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Awaiting Signature",
                                    "Closed Won",
                                    "Negotiation",
                                    "Proof of Concept",
                                    "Qualified",
                                    "Trial",
                                    "Validation"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S136",
                "filterName": "Weighted Cohort Start of Period",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Awaiting Signature",
                                    "Negotiation",
                                    "Proof of Concept",
                                    "Qualified",
                                    "Trial",
                                    "Validation"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Text Month is Load Month",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "TRUE"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S137",
                "filterName": "Cohort Closed Won",
                "workspaceID": "W283",
                "filter": {
                    "boperator": "And",
                    "filters": [
                        {
                            "tableQualifier": null,
                            "attributeName": "Stage",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "Closed Won"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Type",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "New Business"
                                ],
                                "setFilter": null
                            }
                        },
                        {
                            "tableQualifier": null,
                            "attributeName": "Text Month is Load Month",
                            "operator": "Equals",
                            "filterValue": {
                                "values": [
                                    "TRUE"
                                ],
                                "setFilter": null
                            }
                        }
                    ]
                }
            },
            {
                "savedFilterKey": "S169",
                "filterName": "Inbound Filter",
                "workspaceID": "W283",
                "filter": {
                    "tableQualifier": null,
                    "attributeName": "Channel",
                    "operator": "Equals",
                    "filterValue": {
                        "values": [
                            "Inbound"
                        ],
                        "setFilter": null
                    }
                }
            }
        ],
        "themes": [
            {
                "themeID": "T60",
                "canvasID": "C5",
                "canvasName": "Board Deck",
                "themeName": "AI Colors",
                "colorScheme": {
                    "name": "AI Colors",
                    "backgroundColor": "#f0f3f0",
                    "colors": [
                        {
                            "name": "Color 1",
                            "val": "#2564f8"
                        },
                        {
                            "name": "Color 2",
                            "val": "#94b9d9"
                        },
                        {
                            "name": "Color 3",
                            "val": "#273845"
                        },
                        {
                            "name": "Color 4",
                            "val": "#4fc585"
                        },
                        {
                            "name": "Color 5",
                            "val": "#de9d44"
                        },
                        {
                            "name": "Color 6",
                            "val": "#c75043"
                        },
                        {
                            "name": "Color 7",
                            "val": "#e39894"
                        },
                        {
                            "name": "Color 8",
                            "val": "#b9c7dc"
                        },
                        {
                            "name": "Color 9",
                            "val": "#f1b58c"
                        },
                        {
                            "name": "Color 10",
                            "val": "#ded7c4"
                        },
                        {
                            "name": "Color 11",
                            "val": "#e7c3c3"
                        },
                        {
                            "name": "Color 12",
                            "val": "#242383"
                        },
                        {
                            "name": "Color 13",
                            "val": "#235083"
                        },
                        {
                            "name": "Color 14",
                            "val": "#de447f"
                        },
                        {
                            "name": "Color 15",
                            "val": "#f825da"
                        },
                        {
                            "name": "Color 16",
                            "val": "#25f8c1"
                        },
                        {
                            "name": "Color 17",
                            "val": "#c78f43"
                        },
                        {
                            "name": "Color 18",
                            "val": "#25f88f"
                        },
                        {
                            "name": "Color 19",
                            "val": "#4f5bc5"
                        },
                        {
                            "name": "Color 20",
                            "val": "#25f8f4"
                        },
                        {
                            "name": "Color 21",
                            "val": "#d5de44"
                        },
                        {
                            "name": "Color 22",
                            "val": "#357c47"
                        },
                        {
                            "name": "Color 23",
                            "val": "#25f85c"
                        },
                        {
                            "name": "Color 24",
                            "val": "#1f0823"
                        },
                        {
                            "name": "Color 25",
                            "val": "#25c9f8"
                        },
                        {
                            "name": "Color 26",
                            "val": "#740909"
                        },
                        {
                            "name": "Color 27",
                            "val": "#2531f8"
                        },
                        {
                            "name": "Color 28",
                            "val": "#ee8cf1"
                        },
                        {
                            "name": "Color 29",
                            "val": "#11096e"
                        }
                    ]
                },
                "fonts": [
                    {
                        "family": "Roboto",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "300"
                    },
                    {
                        "family": "Fira Sans",
                        "variant": "400"
                    },
                    {
                        "family": "Arimo",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "600"
                    },
                    {
                        "family": "Barlow",
                        "variant": "500"
                    },
                    {
                        "family": "Barlow",
                        "variant": "600"
                    },
                    {
                        "family": "Roboto",
                        "variant": "400"
                    },
                    {
                        "family": "Barlow",
                        "variant": "400"
                    }
                ]
            },
            {
                "themeID": "T61",
                "canvasID": "C5",
                "canvasName": "Board Deck",
                "themeName": "AI Colors Bold",
                "colorScheme": {
                    "name": "AI Colors Bold",
                    "backgroundColor": "#f0f3f0",
                    "colors": [
                        {
                            "name": "Color 1",
                            "val": "#2564f8"
                        },
                        {
                            "name": "Color 2",
                            "val": "#94b9d9"
                        },
                        {
                            "name": "Color 3",
                            "val": "#273845"
                        },
                        {
                            "name": "Color 4",
                            "val": "#4fc585"
                        },
                        {
                            "name": "Color 5",
                            "val": "#de9d44"
                        },
                        {
                            "name": "Color 6",
                            "val": "#c75043"
                        },
                        {
                            "name": "Color 7",
                            "val": "#e39894"
                        },
                        {
                            "name": "Color 8",
                            "val": "#b9c7dc"
                        },
                        {
                            "name": "Color 9",
                            "val": "#f1b58c"
                        },
                        {
                            "name": "Color 10",
                            "val": "#ded7c4"
                        },
                        {
                            "name": "Color 11",
                            "val": "#e7c3c3"
                        },
                        {
                            "name": "Color 12",
                            "val": "#242383"
                        },
                        {
                            "name": "Color 13",
                            "val": "#192079"
                        },
                        {
                            "name": "Color 14",
                            "val": "#a14fc5"
                        },
                        {
                            "name": "Color 15",
                            "val": "#7e25f8"
                        },
                        {
                            "name": "Color 16",
                            "val": "#238324"
                        },
                        {
                            "name": "Color 17",
                            "val": "#90875e"
                        },
                        {
                            "name": "Color 18",
                            "val": "#f82529"
                        },
                        {
                            "name": "Color 19",
                            "val": "#25f8f4"
                        },
                        {
                            "name": "Color 20",
                            "val": "#f18ce4"
                        },
                        {
                            "name": "Color 21",
                            "val": "#d2f825"
                        },
                        {
                            "name": "Color 22",
                            "val": "#3c2745"
                        },
                        {
                            "name": "Color 23",
                            "val": "#4460de"
                        },
                        {
                            "name": "Color 24",
                            "val": "#f19d8c"
                        },
                        {
                            "name": "Color 25",
                            "val": "#743b09"
                        },
                        {
                            "name": "Color 26",
                            "val": "#2597f8"
                        },
                        {
                            "name": "Color 27",
                            "val": "#f8b925"
                        }
                    ]
                },
                "fonts": [
                    {
                        "family": "Roboto",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "300"
                    },
                    {
                        "family": "Fira Sans",
                        "variant": "400"
                    },
                    {
                        "family": "Arimo",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "600"
                    },
                    {
                        "family": "Barlow",
                        "variant": "500"
                    },
                    {
                        "family": "Barlow",
                        "variant": "600"
                    },
                    {
                        "family": "Roboto",
                        "variant": "400"
                    },
                    {
                        "family": "Barlow",
                        "variant": "400"
                    }
                ]
            },
            {
                "themeID": "T78",
                "canvasID": "C5",
                "canvasName": "Board Deck",
                "themeName": "Board Deck Template",
                "colorScheme": {
                    "name": "Simple Light",
                    "colors": [
                        {
                            "name": "dk1",
                            "val": "#000000"
                        },
                        {
                            "name": "lt1",
                            "val": "#ffffff"
                        },
                        {
                            "name": "dk2",
                            "val": "#595959"
                        },
                        {
                            "name": "lt2",
                            "val": "#eeeeee"
                        },
                        {
                            "name": "accent1",
                            "val": "#4285f4"
                        },
                        {
                            "name": "accent2",
                            "val": "#212121"
                        },
                        {
                            "name": "accent3",
                            "val": "#78909c"
                        },
                        {
                            "name": "accent4",
                            "val": "#ffab40"
                        },
                        {
                            "name": "accent5",
                            "val": "#0097a7"
                        },
                        {
                            "name": "accent6",
                            "val": "#eeff41"
                        },
                        {
                            "name": "hlink",
                            "val": "#0097a7"
                        },
                        {
                            "name": "folHlink",
                            "val": "#0097a7"
                        },
                        {
                            "name": "accent7",
                            "val": "#0d094e"
                        },
                        {
                            "name": "accent8",
                            "val": "#a70040"
                        },
                        {
                            "name": "accent9",
                            "val": "#001fa7"
                        },
                        {
                            "name": "accent10",
                            "val": "#c9ff40"
                        },
                        {
                            "name": "accent11",
                            "val": "#b541ff"
                        },
                        {
                            "name": "accent12",
                            "val": "#ff4193"
                        },
                        {
                            "name": "accent13",
                            "val": "#110000"
                        },
                        {
                            "name": "accent14",
                            "val": "#803052"
                        },
                        {
                            "name": "accent15",
                            "val": "#41ffb5"
                        },
                        {
                            "name": "accent16",
                            "val": "#42daf4"
                        },
                        {
                            "name": "accent17",
                            "val": "#2a3254"
                        },
                        {
                            "name": "accent18",
                            "val": "#418bff"
                        },
                        {
                            "name": "accent19",
                            "val": "#ffb541"
                        },
                        {
                            "name": "accent20",
                            "val": "#ff4f40"
                        }
                    ]
                },
                "fonts": [
                    {
                        "family": "Roboto",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "300"
                    },
                    {
                        "family": "Fira Sans",
                        "variant": "400"
                    },
                    {
                        "family": "Arimo",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "600"
                    },
                    {
                        "family": "Barlow",
                        "variant": "500"
                    },
                    {
                        "family": "Barlow",
                        "variant": "600"
                    },
                    {
                        "family": "Roboto",
                        "variant": "400"
                    },
                    {
                        "family": "Barlow",
                        "variant": "400"
                    }
                ]
            },
            {
                "themeID": "T83",
                "canvasID": "C5",
                "canvasName": "Board Deck",
                "themeName": null,
                "colorScheme": {
                    "name": "Default",
                    "colors": [
                        {
                            "name": "dk1",
                            "val": "#000000"
                        },
                        {
                            "name": "lt1",
                            "val": "#ffffff"
                        },
                        {
                            "name": "dk2",
                            "val": "#158158"
                        },
                        {
                            "name": "lt2",
                            "val": "#f3f3f3"
                        },
                        {
                            "name": "accent1",
                            "val": "#058dc7"
                        },
                        {
                            "name": "accent2",
                            "val": "#50b432"
                        },
                        {
                            "name": "accent3",
                            "val": "#ed561b"
                        },
                        {
                            "name": "accent4",
                            "val": "#edef00"
                        },
                        {
                            "name": "accent5",
                            "val": "#24cbe5"
                        },
                        {
                            "name": "accent6",
                            "val": "#64e572"
                        },
                        {
                            "name": "hlink",
                            "val": "#2200cc"
                        },
                        {
                            "name": "folHlink",
                            "val": "#551a8b"
                        },
                        {
                            "name": "accent7",
                            "val": "#05bcc7"
                        },
                        {
                            "name": "accent8",
                            "val": "#c73f05"
                        },
                        {
                            "name": "accent9",
                            "val": "#ef00ed"
                        },
                        {
                            "name": "accent10",
                            "val": "#3250b4"
                        },
                        {
                            "name": "accent11",
                            "val": "#a58769"
                        },
                        {
                            "name": "accent12",
                            "val": "#1bed56"
                        },
                        {
                            "name": "accent13",
                            "val": "#0200ef"
                        },
                        {
                            "name": "accent14",
                            "val": "#202b73"
                        },
                        {
                            "name": "accent15",
                            "val": "#537320"
                        },
                        {
                            "name": "accent16",
                            "val": "#ef007a"
                        },
                        {
                            "name": "accent17",
                            "val": "#314864"
                        },
                        {
                            "name": "accent18",
                            "val": "#7264e5"
                        },
                        {
                            "name": "accent19",
                            "val": "#b3e564"
                        },
                        {
                            "name": "accent20",
                            "val": "#73206a"
                        }
                    ]
                },
                "fonts": [
                    {
                        "family": "Roboto",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "500"
                    },
                    {
                        "family": "Inter",
                        "variant": "300"
                    },
                    {
                        "family": "Fira Sans",
                        "variant": "400"
                    },
                    {
                        "family": "Arimo",
                        "variant": "400"
                    },
                    {
                        "family": "Inter",
                        "variant": "600"
                    },
                    {
                        "family": "Barlow",
                        "variant": "500"
                    },
                    {
                        "family": "Barlow",
                        "variant": "600"
                    },
                    {
                        "family": "Roboto",
                        "variant": "400"
                    },
                    {
                        "family": "Barlow",
                        "variant": "400"
                    }
                ]
            }
        ]
    },
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

    const userID = "61cb586e-307a-4dd5-99be-044c8aba5ab3"
    const workspaceID = "W283";
    const token = "eyJraWQiOiI3dVwvZmEwRWZmU2NzWHAyQmRNK1RmY2lENk9yR2lNdDBRaDdpNTR0cktQbz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0NmMyZWE2OS02Y2JkLTQyYjYtYTRiNC1jOTE4NDM5NTgzNDYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMTA5NTM3OTE5OCIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yXzRSeWx0cXlKNyIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6IjYxY2I1ODZlLTMwN2EtNGRkNS05OWJlLTA0NGM4YWJhNWFiMyIsIm9yaWdpbl9qdGkiOiJlNzU1NjAxMC01NzRkLTRlZDItODY5My1jZjk3OWYyYzg3MTUiLCJhdWQiOiI3NmF0cjYycm40aXVrOHVoajhyOGd0MzltcyIsImV2ZW50X2lkIjoiMWU1ZWVmMzgtZGJhMC00ZTRmLTg5NTItNjhkMWQzYzE5Yzg5IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTg3NjI5NTQsInBob25lX251bWJlciI6IisxNzAyODQ1NDQ4NSIsImV4cCI6MTcxOTIwMjY5MiwiaWF0IjoxNzE5MTE2MjkyLCJqdGkiOiIzMjNjNmVjYi0zZjMzLTQzZmUtYWZkZS0zZjhmNTVjY2E0N2UiLCJlbWFpbCI6ImdhYmVAc2Nvb3AucmVwb3J0In0.H676jQHKKmsOErQcPxy1YULsHK2jyS8cKpTs5K-CG8SLd8DupvAtysUwUQGsINLTp4w6Si1VP_t2WyJt6vRl0KDzgwCNQ9T2XqgAOGFr_1tqmiJtoPFN81NN-JMDpgsUvfacvMomxFVDvXs1kB8QGg3Jyx8mNrGSojapwFmOlQOXxWqp45XQA9lDdqwQUFknnMFCRKcRt1MezkubFsXqd4eqcicB_yNRUnmNZhZAk1j9Zpj7jwT2e2Gh0fYIBPkGeweVPXjJMLW4wZJB-8_Avwyusv0CJa5PKA4y07odJpgGUQuio_ZfIL4HOIzBfDjBYgw1m52bgqIrfFMGVYZelw"
    const insightID  = "InsightElement-0.42107358573750164"
    const insightKey  = "I1467"

    const [server, setServer] = React.useState(new Server(workspaceID, userID, token));

    const [config, setConfig] = React.useState(ChartState.getDefaultConfig());

    const [chartState, setChartState] = React.useState(() => {
        let cs = new ChartState(server, config, setConfig);
        cs.workspaceMetadata = workspaceMetadata;
        return cs;
    });

    const {postData} = useApi();

    const [style, setStyle] = React.useState({});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [seriesName, setSeriesName] = React.useState(null);
    const [drillColumn, setDrillColumn] = React.useState(null);
    const [drillingHistory, setDrillingHistory] = React.useState([]);
    const openMenu = Boolean(anchorEl);
    const isGuestMode = false;
    const objects = [
        {
            "id": 0.6600656251742092,
            "title": "Weighted Pipeline View",
            "x": 240,
            "y": 140,
            "width": 540,
            "height": 720,
            "isBlank": true,
            "type": "SheetletElement",
            "content": {
                "worksheetID": "1JPK2BapLrJxeHKJcIUkHFbnZCVJJLfRGQ0Ju7TsWWDY",
                "worksheetRange": "WeightedPipeline",
                "worksheetNum": 1,
                "workspaceID": "W231",
                "worksheetURL": "https://docs.google.com/spreadsheets/d/1JPK2BapLrJxeHKJcIUkHFbnZCVJJLfRGQ0Ju7TsWWDY/edit"
            },
            "shouldHideHeaders": false,
            "shouldHideGrid": false
        },
        {
            "id": 0.42107358573750164,
            "title": "WeightedPipelineChart",
            "x": 820,
            "y": 140,
            "width": 640,
            "height": 720,
            "isBlank": true,
            "type": "InsightElement",
            "content": {
                "insightKey": "I1467",
                "workspaceID": "W283"
            }
        }
    ]

    const hasFetched = useRef(false);
    const fetchingRef = useRef(new Set());
    const [isChartASkeleton, setIsChartASkeleton] = React.useState(false); 
    const [insightsMaterialized, setInsightsMaterialized] = useState([]);

    const getInsightPrompts = () => {
        let prompts;
        if (isGuestMode && guestPrompts.length > 0) prompts = guestPrompts
        else prompts = objects.filter(obj => obj.type === OBJECT_TYPES.PROMPT)
        return prompts.filter(prompt => prompt.promptProps?.objects.includes(insightId))
            .map(prompt => prompt.promptProps.prompt)
            .filter(prompt => prompt !== null)
    }

    const updateInsight = () => {
        if (!hasFetched.current && insightKey) {
            hasFetched.current = true;
            fetchInsight(insightKey, postData)
                .then((result) => {
                    loadFromSavedInsight(
                        result,
                        setConfig,
                        chartState,
                        setIsChartASkeleton,
                        // dispatch,
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
    }

    useEffect(() => {
        updateInsight();
    }, []); // Runs once on component mount

    const handleMenuClick = (event) => {
        setAnchorEl(event.event.event.currentTarget);
        if (config.view === 'chart') {
            setStyle({
                position: 'absolute',
                left: event.event.event.clientX + 'px',
                top: event.event.event.clientY + 'px',
                minHeight: 300 + 'px'
            })
        } else {
            setDrillColumn(event.drillColumn)
        }
        setSeriesName(event.seriesName);
    };

    const handleTableMenuClose = (event, col) => {
        setAnchorEl(null);
        if (event.key === "Escape" || event.currentTarget.textContent === "") return;
        let newFilter = {
            attributeName: drillColumn.columnName, operator: "Equals", filterValue: {
                values: [seriesName]
            }
        }
        let curFilter = chartState.addFilterItem(newFilter);
        config.selectedTableColumns.push(col);
        config.filter = curFilter;
        if (drillingHistory.length === 0) {
            setDrillingHistory([
                {attribute: drillColumn.columnName},
                {attribute: event.currentTarget.textContent, filter: newFilter}
            ])
        } else {
            setDrillingHistory([
                ...drillingHistory,
                {attribute: event.currentTarget.textContent, filter: newFilter}
            ])
        }
        setConfig({...config});
    }

    const handleChartMenuClose = (event) => {
        setAnchorEl(null);
        if (event.key === "Escape" || event.currentTarget.textContent === "") return;
        if (chartState.config.drillAttribute) {
            chartState.config.usedDrillAttributes.push(chartState.config.drillAttribute)
            let series = chartState.getSeries(seriesName);
            if (series) {
                let newFilter = {
                    attributeName: config.drillAttribute, operator: "Equals", filterValue: {
                        values: [series.category]
                    }
                }
                let curFilter = chartState.addFilterItem(newFilter);
                config.drillAttribute = event.currentTarget.textContent;
                config.filter = curFilter;
                setDrillingHistory([
                    ...drillingHistory,
                    {attribute: event.currentTarget.textContent, filter: newFilter}
                ])
                chartState.getResults(config, null, activePrompts);
            }
        } else {
            config.drillAttribute = event.currentTarget.textContent;
            setDrillingHistory([
                ...drillingHistory,
                {attribute: event.currentTarget.textContent}
            ])
            chartState.getResults(config, null, activePrompts);
        }
        setConfig({...config});
    }

    function onChartClick(event) {
        handleMenuClick(event);
    }

    const onEvents = {
        'click': onChartClick
    }

    function validChart() {
        // if (config.view === 'table' && (config.selectedTableColumns.length > 0 || config.selectedTableKpis.length > 0)) return true
        // if (chartState.config.seriesType === "scatter" && chartState.config.selectedItems && chartState.config.selectedItems?.length !== 2) return false;
        return chartState.series && chartState.series?.length > 0 && ((chartState.result.dates && chartState.result.dates?.length > 0) || chartState.series[0].data?.length > 0);
    }

    const chartSetting = {
        height: embeddedSizeProps ? embeddedSizeProps.height : (window.innerHeight - 200) + "px",
        marginLeft: embeddedSizeProps ? embeddedSizeProps.left : 300,
        marginRight: embeddedSizeProps ? 0 : 300,
        pointerEvents: clickable ? 'all' : 'none'
    };

    const getChartDrillItems = () => {
        let drillAtts = []
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
            })
        }
        let changeDrillAtts = []
        if (advanced && analyzeChanges && chartState.changeDrillAttributes?.length > 0) {
            changeDrillAtts = advanced && analyzeChanges && chartState.changeDrillAttributes.map((item) => {
                if (item === chartState.categoryAxis || item === chartState.config.drillAttribute) {
                    return null;
                }
                return (<MenuItem key={item} value={item} onClick={handleChartMenuClose}>{item}</MenuItem>);
            })
        }
        return [...drillAtts, ...changeDrillAtts]
    }

    const getTableDrillItems = () => {
        const tables = []
        workspaceMetadata?.inboxes?.forEach(inbox => {
            inbox.tables.forEach(table => {
                if (config.selectedTables.includes(table.reportSeriesTableID)) tables.push(table)
            })
        })
        const columns = _.intersection(...tables.map(table => table.columns.map(col => ({...col, reportSeriesTableID: table.reportSeriesTableID}))))
        const availableDrills = columns.filter(column => !column.isMeasure && !config.selectedTableColumns.some(col => col.columnName === column.columnName))
        return availableDrills.map(col => <MenuItem key={col.columnName} onClick={(e) => handleTableMenuClose(e, col)}>{col.columnName}</MenuItem>)
    }

    const handleDeleteDrillingStep = (step, i) => {
        const newConfig = {...config}
        const newDrillingHistory = [...drillingHistory]
        if (config.view === 'chart') {
            if (drillingHistory.length === 1) {
                // empty drill attribute from config
                newConfig.drillAttribute = undefined
                // empty drill history
                setDrillingHistory([])
            } else {
                // move drill attribute
                newConfig.drillAttribute = newDrillingHistory[i - 1].attribute
                // remove step filter
                newConfig.filter = chartState.removeFilterItem(step.filter)
                // remove step from history
                newDrillingHistory.splice(i, 1)
                // enable drill attribute again
                newConfig.usedDrillAttributes.splice(newConfig.usedDrillAttributes.indexOf(step.attribute), 1)
                setDrillingHistory(newDrillingHistory)
            }
            setConfig(newConfig)
            chartState.getResults(newConfig, null, activePrompts)
        } else {
            // remove column
            const deleteIndex = newConfig.selectedTableColumns.findIndex(col => col.columnName === step.attribute)
            newConfig.selectedTableColumns.splice(deleteIndex, 1)
            // remove step filter
            newConfig.filter = chartState.removeFilterItem(step.filter)
            if (drillingHistory.length === 2) {
                // empty drill history
                setDrillingHistory([])
            } else {
                // remove step from history
                newDrillingHistory.splice(i, 1)
                setDrillingHistory(newDrillingHistory)
            }
            setConfig(newConfig)
        }
    }

    const navigateToStep = (step, i) => {
        const newConfig = {...config}
        let newDrillingHistory = [...drillingHistory]
        const toDeleteSteps = newDrillingHistory.slice(i + 1)
        if (config.view === 'chart') {
            toDeleteSteps.forEach(s => {
                // remove filters from steps > selected step
                newConfig.filter = chartState.removeFilterItem(s.filter)
                // enable drill attribute again
                newConfig.usedDrillAttributes.splice(newConfig.usedDrillAttributes.indexOf(s.attribute), 1)
            })
            // move drill attribute to selected step
            newConfig.drillAttribute = step.attribute
            // remove left steps > selected step
            newDrillingHistory = newDrillingHistory.slice(0, i + 1)
            setDrillingHistory(newDrillingHistory)
            setConfig(newConfig)
            chartState.getResults(newConfig, null, activePrompts)
        } else {
            toDeleteSteps.forEach(s => {
                // remove column
                const deleteIndex = newConfig.selectedTableColumns.findIndex(col => col.columnName === s.attribute)
                newConfig.selectedTableColumns.splice(deleteIndex, 1)
                // remove step filter
                newConfig.filter = chartState.removeFilterItem(s.filter)
            })
            // remove left steps > selected step
            newDrillingHistory = newDrillingHistory.slice(0, i + 1)
            setDrillingHistory(newDrillingHistory)
            setConfig(newConfig)
        }
    }

    const isStepClickable = (i) => {
        if (config.view === 'chart') return i < drillingHistory.length - 1
        else return i > 0 && i < drillingHistory.length - 1
    }

    const getOptionWithOverrides = () => {
        let option = chartState.getOption()
        if (theme) option = chartState.getOption(theme.themeID)
        // here treat chart specific configs before doing the merge
        let overrides = {...config.styleOverrides}
        if (Array.isArray(option.yAxis) && overrides.yAxis) {
            option.yAxis.forEach((axisObject, i) => {
                option.yAxis[i] = {...option.yAxis[i], ...overrides.yAxis}
            })
            overrides = _.omit(overrides, ['yAxis']);
        }
        option = _.merge(option, overrides)
        console.log("option: ", option)
        return option
    }

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
                                        <img src={theme?.colorScheme?.darkTheme ? CloseIconWhite : CloseIcon} height={12} alt={'delete'} />
                                    </IconButton>
                                }
                                {
                                    i < drillingHistory.length - 1 &&
                                    <img src={CaretRight} alt={'caret-right'} style={{marginRight: '5px'}} />
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
                container={document.getElementById('slide-container')}
                open={openMenu}
                onClose={handleChartMenuClose}
                MenuListProps={{'aria-labelledby': 'basic-button'}}
                style={style}
            >
                {config.view === 'table' ? getTableDrillItems() : getChartDrillItems()}
            </Menu>
        </>
    );
}

export default InsightComponent;