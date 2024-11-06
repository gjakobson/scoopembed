import React, { useEffect, useState } from 'react'
import styles from './KPI.module.css'
import chroma from 'chroma-js'
import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";
import {CompareArrow} from "@/components/KPI/CompareArrow";
import {
    getCompareDiff,
    getCompareDirection,
    getFormattedKPIValue,
    getKPIData,
    getKPIStyles,
    getKPITitle
} from "@/utils/kpiUtils";

export const KPI = ({ config, setConfig, server, prompts, theme, container }) => {

    const [loading, setLoading] = useState(false)
    const [kpiValue, setKpiValue] = useState(0)
    const [compareDirection, setCompareDirection] = useState('')
    const [compareValue, setCompareValue] = useState(0)
    const [compareDiff, setCompareDiff] = useState(0)
    const [metricFormat, setMetricFormat] = useState('')
    const KPIStyles = getKPIStyles(theme, config, container)
    const compareColor =
        compareDirection === 'up'
            ? KPIStyles.compareStyles.positiveColor
            : KPIStyles.compareStyles.negativeColor

    useEffect(() => {
        if (config.selectedItems.length > 0) {
            setLoading(true)
            getKPIData(config, server, prompts, (r) => {
                if (config.tableTimeSeries) {
                    const data = r.series[0]?.data
                    if (data) {
                        const lastValue = data[data.length - 1]
                        const secondToLastValue = data[data.length - 2]
                        setMetricFormat(r.metrics[0].format || '')
                        setKpiValue(lastValue)
                        setCompareValue(secondToLastValue)
                        setCompareDiff(
                            getCompareDiff(lastValue, secondToLastValue, config.kpiCompareType)
                        )
                        setCompareDirection(getCompareDirection(lastValue, secondToLastValue))
                    }
                } else {
                    const data = r.dataset.series[0]?.data
                    if (data) {
                        const lastValue = data[0]
                        setKpiValue(lastValue)
                        const newConfig = { ...config }
                        newConfig.kpiCompareTarget = lastValue
                        setConfig(newConfig)
                    }
                }
                setLoading(false)
            })
        }
    }, [config.period, config.calendarType, config.timeRange, config.tableTimeSeries])

    useEffect(() => {
        if (config.kpiCompareTarget && !config.tableTimeSeries) {
            setCompareValue(config.kpiCompareTarget)
            setCompareDiff(getCompareDiff(kpiValue, config.kpiCompareTarget, config.kpiCompareType))
            setCompareDirection(getCompareDirection(kpiValue, config.kpiCompareTarget))
        } else {
            setCompareDiff(getCompareDiff(kpiValue, compareValue, config.kpiCompareType))
        }
    }, [config.kpiCompareTarget, config.tableTimeSeries, kpiValue, config.kpiCompareType])

    return (
        <Box
            className={styles.KPICompare}
            style={{
                ...KPIStyles.containerStyles,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: container.offsetWidth || 200,
                height: container.offsetHeight || 200,
                margin: container ? '' : 'auto',
            }}
        >
            {loading ? (
                <Box
                    sx={{
                        display: 'grid',
                        placeContent: 'center',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <ScoopLoader size={60} />
                </Box>
            ) : (
                <>
                    <Box style={KPIStyles.titleStyles}>
                        {getKPITitle(config)}
                    </Box>
                    <Box style={KPIStyles.valueStyles}>
                        {kpiValue && getFormattedKPIValue(kpiValue, metricFormat)}
                    </Box>
                    <Box className={styles.KPICompare}>
                        {compareDirection !== 'equal' && (
                            <Box
                                className={styles.KPICompareIcon}
                                sx={{
                                    backgroundColor: chroma(compareColor).alpha(0.2).hex(),
                                }}
                            >
                                <CompareArrow
                                    width={KPIStyles.compareStyles.fontSize}
                                    height={KPIStyles.compareStyles.fontSize}
                                    direction={compareDirection}
                                    fill={compareColor}
                                />
                                <Typography
                                    sx={{
                                        ...KPIStyles.compareStyles,
                                        color: compareColor,
                                    }}
                                >
                                    {compareDiff === 0 ? '-' : compareDiff}
                                </Typography>
                            </Box>
                        )}
                        <Typography sx={{ ...KPIStyles.compareStyles }}>
                            {'(' +
                                (compareValue
                                    ? compareValue % 1 !== 0
                                        ? compareValue.toFixed(2)
                                        : compareValue
                                    : ' - ') +
                                ')'}
                        </Typography>
                    </Box>
                </>
            )}
        </Box>
    )
}
