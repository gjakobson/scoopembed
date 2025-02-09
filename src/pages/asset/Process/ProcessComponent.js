import React, { useEffect, useState } from 'react';
import styles from './Process.module.css';
import {useApi} from "@/pages/api/api";
import {Box} from '@mui/material';
import {Server} from "@/pages/api/Server";
import _ from 'lodash';
import {GoDiagramWrapper} from "@/components/GoDiagramWrapper/GoDiagramWrapper";
import ReactECharts from 'echarts-for-react'
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";
import {ScoopTheme} from "@/styles/Style";
import {FilterGenerator} from "@/utils/FilterGenerator";
import {isLightColor} from "@/utils/utils";

const ProcessComponent = ({ isDev, workspaceID, userID, token, processName, workspaceMetadata, screenshot, server }) => {

    const apiPath = token?.length < 100 ? 'guest-ui_information' : 'ui_information'
    const container = typeof window !== 'undefined' ?
        document.getElementById('scoop-element-container') :
        {offsetWidth: 0, offsetHeight: 0}
    const { postData: postUIInformationCall } = useApi(
        isDev, token, userID, workspaceID, `https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/${apiPath}`
    )
    const [linkColor, setLinkColor] = useState('#314656')
    const [backgroundColor, setBackgroundColor] = useState(null)
    const [nodeColor, setNodeColor] = useState(null)
    const [linkOpacity, setLinkOpacity] = useState(0.2)
    const [selectedTheme, setSelectedTheme] = useState('None')

    //Prelim data describing all tables/columns diagrams can be pulled out of
    const [reportSeriesData, setReportSeriesData] = useState([])
    const [selectedColumn, setSelectedColumn] = useState(null)
    const [selectedSuccess, setSelectedSuccess] = useState(null)
    const [selectedReportSeriesTable, setSelectedReportSeriesTable] = useState(null)
    const [selectedFiltersV2, setSelectedFiltersV2] = useState([])
    const [filterSnapshotDate, setFilterSnapshotDate] = useState(null)
    const [sankey, setSankey] = useState(false)
    const [toFinalStage, setToFinalStage] = useState(false)
    const [maxWidth, setMaxWidth] = useState(typeof window !== 'undefined' ? window.innerWidth - 100 : 0)
    const [maxHeight, setMaxHeight] = useState(typeof window !== 'undefined' ? window.innerHeight - 100 : 0)
    const [nodeDataArray, setNodeDataArray] = useState([])
    const [originalNodeDataArray, setOriginalNodeDataArray] = useState([])
    const [linkDataArray, setLinkDataArray] = useState([])
    const [originalLinkDataArray, setOriginalLinkDataArray] = useState([])
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [sankeyOption, setSankeyOption] = useState({
        animation: false,
        series: {
            type: 'sankey',
            nodeAlign: 'right',
            layout: 'none',
            emphasis: {
                focus: 'trajectory',
            },
        },
    })
    const [sankeyLoading, setSankeyLoading] = useState(false)

    useEffect(() => {
        if (workspaceID && userID && workspaceMetadata) loadDiagram(processName)
    }, [workspaceID, userID, workspaceMetadata])

    useEffect(() => {
        if (selectedTheme && selectedTheme.colorScheme && !backgroundColor) {
            setBackgroundColor(selectedTheme.colorScheme.backgroundColor)
        }
    }, [selectedTheme])

    useEffect(() => {
        if (selectedTheme && selectedTheme.colorScheme && !nodeColor) {
            setNodeColor(selectedTheme.colorScheme.backgroundColor)
        }
    }, [selectedTheme])

    // arrange nodes within a given window -- called from multiple places
    function fitNodesToWindow(nodes, width, height) {
        const nodeSize = 140 // Assuming nodes are 140x140 units in size
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity

        // Find the current bounds
        nodes?.forEach((node) => {
            let x, y
            if (typeof node.loc === 'string') {
                ;[x, y] = node.loc.split(' ').map(Number)
            } else {
                ;({ x, y } = node.loc)
            }
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x + nodeSize) // Add node size to x to consider its full width
            maxY = Math.max(maxY, y + nodeSize) // Add node size to y to consider its full height
        })

        // Calculate scale factors and center offset
        const scaleX = (0.8 * width) / (maxX - minX)
        const scaleY = (0.8 * height) / (maxY - minY)
        const offsetX = (maxX + minX) / 2
        const offsetY = (maxY + minY) / 2

        // Normalize, scale, and offset node positions
        return nodes?.map((node) => {
            let x, y
            if (typeof node.loc === 'string') {
                ;[x, y] = node.loc.split(' ').map(Number)
            } else {
                ;({ x, y } = node.loc)
            }
            return {
                ...node,
                loc: `${(x - offsetX) * scaleX} ${(y - offsetY) * scaleY}`,
            }
        })
    }

    useEffect(() => {
        setMaxWidth(container.offsetWidth)
        setMaxHeight(container.offsetHeight)

        const scaledNodes = fitNodesToWindow(
            nodeDataArray,
            container.offsetWidth,
            container.offsetHeight
        )
        const updatedNodeDataArray = nodeDataArray?.map((node, index) => {
            const newLoc = scaledNodes[index].loc
            return {
                ...node,
                loc: newLoc,
            }
        })
        setNodeDataArray(updatedNodeDataArray)

        const scaleOrigNodes = fitNodesToWindow(
            originalNodeDataArray,
            container.offsetWidth,
            container.offsetHeight
        )
        const updatedOriginalNodeDataArray = originalNodeDataArray?.map((node, index) => {
            const newLoc = scaleOrigNodes[index]
            const loc = typeof node.loc === 'string' ? node.loc : `${newLoc.x} ${newLoc.y}`
            return {
                ...node,
                loc: loc,
            }
        })
        setOriginalNodeDataArray(updatedOriginalNodeDataArray)
    }, [container, isLoading])

    const fetchSankey = async (
        isStepBased,
        numberOfSteps,
        sankeyPeriod,
        allowedStartingValues,
        result
    ) => {
        if (result) {
            setSankeyLoading(true)
            const toFinal = result.step !== 'undefined' ? result.step === 'final' : false
            let JSONBody = {
                action: 'getSankey',
                reportSeriesTableID: result.selectedReportSeriesTable,
                workspaceID: workspaceID,
                attribute: result.selectedColumn,
                filter: FilterGenerator(
                    result.selectedFiltersV2,
                    result.filterSnapshotDate !== 'undefined'
                        ? result.filterSnapshotDate
                        : undefined,
                    result.selectedReportSeriesTable,
                    result.reportSeriesData
                ),
                successValue: result.selectedSuccess,
                startDate: result.startDate,
                endDate: result.endDate,
                step: toFinal ? 'final' : 'next',
                stepBased: isStepBased,
                sankeyPeriod: sankeyPeriod,
                numSteps: numberOfSteps,
            }
            if (allowedStartingValues && allowedStartingValues.length > 0) {
                JSONBody.startingValues = allowedStartingValues
            }
            await server.postData(JSONBody, (result) => {
                if (result?.data) {
                    const newSankeyOption = { ...sankeyOption }
                    newSankeyOption.series = { ...newSankeyOption.series }
                    newSankeyOption.series.links = result.links
                    newSankeyOption.series.data = result.data
                    setSankeyOption(newSankeyOption)
                    setSankeyLoading(false)
                }
            })
        }
        if (selectedColumn && selectedSuccess && selectedReportSeriesTable) {
            setSankeyLoading(true)
            let JSONBody = {
                action: 'getSankey',
                reportSeriesTableID: selectedReportSeriesTable,
                workspaceID: workspaceID,
                attribute: selectedColumn,
                filter: FilterGenerator(
                    selectedFiltersV2,
                    filterSnapshotDate,
                    selectedReportSeriesTable,
                    reportSeriesData
                ),
                successValue: selectedSuccess,
                startDate: startDate,
                endDate: endDate,
                step: toFinalStage ? 'final' : 'next',
                stepBased: isStepBased,
                sankeyPeriod: sankeyPeriod,
                numSteps: numberOfSteps,
            }
            if (allowedStartingValues && allowedStartingValues.length > 0) {
                JSONBody.startingValues = allowedStartingValues
            }
            await server.postData(JSONBody, (result) => {
                if (result?.data) {
                    const newSankeyOption = { ...sankeyOption }
                    newSankeyOption.series = { ...newSankeyOption.series }
                    newSankeyOption.series.links = result.links
                    newSankeyOption.series.data = result.data
                    setSankeyOption(newSankeyOption)
                    setSankeyLoading(false)
                }
            })
        }
    }

    // call to only display links that are above a threshold, both for liveValue and lieWeight, respectively
    const displayLinksAboveThreshold = (
        weightThreshold,
        supportThreshold,
        linksData = originalLinkDataArray
    ) => {
        //make fraction 0..1
        const t = weightThreshold / 100
        const sp = supportThreshold / 100
        console.log('*displayLinksAboveThreshold, linksData: ', linksData)
        const filterLinkData = _.cloneDeep(linksData)
        linksData.forEach((line) => {
            if (line.lineWeight < t || line.supportPercentile < sp) {
                const index = filterLinkData.findIndex((x) => _.isEqual(x, line))
                if (index !== -1) {
                    filterLinkData.splice(index, 1)
                }
            }
        })

        linksData.forEach((l) => {
            if (l.lineWeight >= t && l.supportPercentile >= sp) {
                if (!doesLinkExist(l, filterLinkData)) {
                    filterLinkData.push(l)
                }
            }
        })
        setLinkDataArray([...filterLinkData])
    }

    //compare passed in l with the diagram.model.linkDataArray and return true if link exists
    const doesLinkExist = (l, linkDataArray) => {
        const isFound = linkDataArray.filter((d) => d.from === l.from && d.to === l.to)
        return isFound.length > 0
    }

    const handleDiagramEvent = (event) => {
        const selectedNode = event.subject.first()

        if (!selectedNode) return

        // Update node location with go.Point
        let updatedLocation = selectedNode.location.copy()
        updatedLocation = `${updatedLocation.x} ${updatedLocation.y}`

        const data = _.cloneDeep(nodeDataArray)
        const originalData = _.cloneDeep(originalNodeDataArray)

        // Grab Indexes
        const existingNodeIndex = data.findIndex((x) => x.key === selectedNode.key)
        const originalExistingNodeIndex = originalData.findIndex((x) => x.key === selectedNode.key)

        // Update Node location
        if (existingNodeIndex !== -1) {
            data[existingNodeIndex].loc = updatedLocation
            setNodeDataArray([...data])
        }

        if (originalExistingNodeIndex !== -1) {
            originalData[originalExistingNodeIndex].loc = updatedLocation
            setOriginalNodeDataArray([...originalData])
        }
    }

    //load a diagram
    const loadDiagram = async (diagramName) => {
        setIsLoading(true)
        const JSONBody = {
            action: 'getProcessDiagramPreferences',
            diagramName: diagramName,
            isDev: process.env.REACT_APP_SCOOP_ENV === 'dev',
        }

        const result = await postUIInformationCall(JSONBody)

        if (result) {
            const scaledNodes = fitNodesToWindow(
                result.body.json.nodeDataArray,
                maxWidth,
                maxHeight
            )
            const nodeDataArray = result.body.json.nodeDataArray?.map((node, index) => {
                const newLoc = scaledNodes[index].loc
                return {
                    ...node,
                    loc: newLoc,
                }
            })
            setNodeDataArray(nodeDataArray)

            const scaleOrigNodes = fitNodesToWindow(
                result.body.json.originalNodeDataArray,
                maxWidth,
                maxHeight
            )
            const originalNodeDataArray = result.body.json.originalNodeDataArray?.map(
                (node, index) => {
                    const newLoc = scaleOrigNodes[index].loc
                    return {
                        ...node,
                        loc: newLoc,
                    }
                }
            )
            setOriginalNodeDataArray(originalNodeDataArray)
            setLinkDataArray(result.body.json.linkDataArray)
            setOriginalLinkDataArray(result.body.json.originalLinkDataArray)
            setStartDate(result.body.json.startDate)
            setEndDate(result.body.json.endDate)
            setSelectedSuccess(result.body.json.selectedSuccess)
            setSelectedColumn(result.body.json.selectedColumn)
            setSelectedReportSeriesTable(result.body.json.selectedReportSeriesTable)
            setSelectedFiltersV2(result.body.json.selectedFiltersV2)
            !sankey && setSankey(result.body.json.sankey ? result.body.json.sankey : false)
            setLinkColor(result.body.json.linkColor ?? '#314656')
            setBackgroundColor(result.body.json.backgroundColor)
            setNodeColor(result.body.json.nodeColor)
            setLinkOpacity(result.body.json.linkOpacity ?? 0.2)
            setSelectedTheme(workspaceMetadata?.themes?.find((x) => x.themeID === result.body.json.themeID))
            if (typeof result.body.json.filterSnapshotDate !== 'undefined') {
                setFilterSnapshotDate(result.body.json.filterSnapshotDate)
            }
            if (typeof result.body.json.step !== 'undefined') {
                let step = result.body.json.step === 'final'
                setToFinalStage(step)
            }
            if (result.body.json.sankey || sankey) {
                fetchSankey(
                    !!result.body.json.stepBased,
                    result.body.json.numSteps ?? 7,
                    result.body.json.sankeyPeriod || 'Weekly',
                    result.body.json.startingValues || [],
                    result.body.json
                )
            }
        }
        setIsLoading(false)
    }

    const getSankeyTheme = () => {
        if (selectedTheme?.colorScheme) {
            const temp = { ...ScoopTheme }
            temp.color = selectedTheme.colorScheme.colors.map((c) => c.val)
            temp.backgroundColor = selectedTheme.colorScheme.backgroundColor
            return temp
        } else {
            return ScoopTheme
        }
    }

    const getColor = () => {
        if (selectedTheme?.colorScheme?.darkTheme) {
            return '#fff'
        } else return '#000'
    }

    const getOptionWithStyles = () => {
        if (sankeyOption?.series?.links) {
            const temp = {
                ...sankeyOption,
                backgroundColor: backgroundColor,
                label: { color: getColor() },
            }
            temp.series.links.forEach((link, i) => {
                temp.series.links[i] = {
                    ...link,
                    lineStyle: { color: linkColor, opacity: linkOpacity },
                }
            })
            return temp
        }
        return {
            animation: false,
            backgroundColor: backgroundColor,
            series: {
                type: 'sankey',
                nodeAlign: 'right',
                layout: 'none',
                emphasis: {
                    focus: 'trajectory',
                },
                label: { color: getColor() },
            },
        }
    }

    const chartSetting = {
        height: container.offsetHeight,
        width: container.offsetWidth,
        pointerEvents: 'all',
    }

    const getScreenshotBgColor = () => {
        if (screenshot) {
            if (backgroundColor === '#00000000') {
                if (selectedTheme.colorScheme.darkTheme) return 'black'
                else return 'white'
            }
        }
        return 'transparent'
    }

    return (
        <Box className={styles.processDiagramContent} style={{backgroundColor: getScreenshotBgColor()}}>
            {sankey ? (
                sankeyLoading ? (
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            display: 'grid',
                            placeContent: 'center',
                        }}
                    >
                        <ScoopLoader size={container.offsetWidth * 0.1} />
                    </Box>
                ) : (
                    <ReactECharts
                        option={getOptionWithStyles()}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{...chartSetting}}
                        theme={getSankeyTheme()}
                    />
                )
            ) : (
                isLoading ?
                    <Box sx={{height: '100%', width: '100%', display: 'grid', placeContent: 'center'}}>
                        <ScoopLoader size={container.offsetWidth * 0.1} />
                    </Box> :
                <GoDiagramWrapper
                    key={[selectedTheme, nodeColor]}
                    theme={selectedTheme}
                    nodeDataArray={nodeDataArray}
                    originalNodeDataArray={originalNodeDataArray}
                    linkDataArray={linkDataArray}
                    setNodeDataArray={setNodeDataArray}
                    handleDiagramEvent={handleDiagramEvent}
                    backgroundColor={backgroundColor}
                    nodeColor={nodeColor}
                />
            )}
        </Box>
    )
}

export default ProcessComponent
