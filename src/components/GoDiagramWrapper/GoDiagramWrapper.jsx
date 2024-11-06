import React, { useEffect, useRef } from 'react';
import * as go from 'gojs';
import _ from 'lodash';
import { ReactDiagram } from 'gojs-react';
import chroma from 'chroma-js';
import styles from './GoDiagramWrapper.module.css';

const defaultSuccess = ['#115B42', '#1B6E53', '#009262', '#93DFC6', '#F1FBF8']

export const GoDiagramWrapper = ({
    nodeDataArray,
    originalNodeDataArray,
    linkDataArray,
    setNodeDataArray,
    handleDiagramEvent,
    theme,
    nodeWidth = 140,
    textSize = 12,
    backgroundColor,
    nodeColor,
}) => {

    const diagramRef = useRef()

    useEffect(() => {
        if (!diagramRef.current) {
            return
        }
        const diagram = diagramRef.current.getDiagram()
        if (diagram instanceof go.Diagram) {
            /*diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray, {
                linkKeyProperty: "key",
            });*/
            diagram.addDiagramListener('SelectionMoved', handleDiagramEvent)
        }
        return () => {
            if (!diagramRef.current) {
                return
            }
            const diagram = diagramRef.current.getDiagram()
            if (diagram instanceof go.Diagram) {
                diagram.removeDiagramListener('SelectionMoved', handleDiagramEvent)
            }
        }
    }, [nodeDataArray, originalNodeDataArray])

    useEffect(() => {
        if (!diagramRef.current) {
            return
        }
        const diagram = diagramRef.current.getDiagram()
        if (diagram instanceof go.Diagram) {
            diagram.startTransaction('update theme')
            diagram.nodes.each((node) => {
                node.updateTargetBindings()
            })
            diagram.links.each((link) => {
                link.updateTargetBindings()
            })
            diagram.commitTransaction('update theme')
        }
    }, [theme])

    const lineValueLabel = (d) => {
        const value = d.lineValue != null ? d.lineValue + ' ' + d.valueUnit : ''
        let lineWeight = d.lineWeight * 100
        lineWeight = parseInt(lineWeight) + '%'
        return value + '   ' + lineWeight
    }

    const nodeInfo = (d) => {
        const unit =
            linkDataArray.filter((x) => x.to === d.key || x.from === d.key)?.[0]?.valueUnit || ''
        const reachPercentage = parseInt(d['value'] * 100)
        const reachDuration = parseInt(d['duration'] / 24 / 1000 / 3600)
        return (
            'Likelihood to reach ' +
            d['selectedSuccess'] +
            ' is ' +
            reachPercentage.toString() +
            '%\n\nTime to reach ' +
            d['selectedSuccess'] +
            ' is ' +
            reachDuration.toString() +
            ' ' +
            unit
        )
    }

    const linkInfo = (d) =>
        'Count ' +
        d.support +
        '\n' +
        d.lineValue.toString() +
        ' ' +
        d.valueUnit +
        '\n' +
        Math.floor(d.lineWeight * 100).toString() +
        '%'

    //calc opaqueness from the values in data in the nodes section -- 100% down to 0%
    const colorFromValue = (d) => {
        let successColors = defaultSuccess
        if (theme?.colorScheme) {
            const color = nodeColor ? nodeColor : theme.colorScheme.colors[0].val
            successColors = chroma.scale([color, '#FFFFFF']).mode('lab').colors(5)
        }
        if (d.value > 0.75) {
            return successColors[0]
        } else if (d.value > 0.55) {
            return successColors[1]
        } else if (d.value > 0.35) {
            return successColors[2]
        } else if (d.value > 0.1) {
            return successColors[3]
        } else {
            return successColors[4]
        }
    }

    // retirn the color of the text in the node based on the intesity of the green background so always stands out
    const colorNodeText = (d) => {
        if (d > 0.5) return 'white'
        else return 'black'
    }

    //let's make the width ~1 - 7  range , easiest is to multiply the lineWeight value by 10
    const strokeWidthFromValue = (d) => d.lineWeight * 7

    //return the size of the arrow head as big vs small to look good on any line
    const arrowHeadSize = (d) => (d.lineWeight > 0.5 ? 1.3 : 1)

    const initDiagram = () => {
        const $ = go.GraphObject.make
        // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
        go.Diagram.licenseKey =
            '288647e1b06148c702d90676423d6bf919a475639d8416a35f0717f6eb086c1d269cbf7052d6d8c682f848fa4a7bc28ad5c16f7ec05e153db46181dc10b1d6ade73774b31d01418bf60a23c6cef87ea1f87f77f090e670a7da2c8bf1efafc3950ee0a0d11a9a5abf296a1637032ea94ae5abd869e901cd4c6e729fb8faef'
        const diagram = $(go.Diagram, {
            initialAutoScale: go.Diagram.UniformToFill,
            model: $(go.GraphLinksModel, {
                linkKeyProperty: 'key', // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
                // positive keys for nodes
                makeUniqueKeyFunction: (m, data) => {
                    let k = data.key || 1
                    while (m.findNodeDataForKey(k)) k++
                    data.key = k
                    return k
                },
                // negative keys for links
                makeUniqueLinkKeyFunction: (m, data) => {
                    let k = data.key || -1
                    while (m.findLinkDataForKey(k)) k--
                    data.key = k
                    return k
                },
                // NOTE: the above "KeyFunction"s are simplistic and loop over data to avoid key collisions,
                // they are not suitable for applications with lots of data
            }),
            layout: $(go.TreeLayout, { isInitial: false, isOngoing: false }),
            InitialLayoutCompleted: function (e) {
                let hasInvalidLocation = false
                e.diagram.nodes.each(function (n) {
                    if (!n.location.isReal()) {
                        hasInvalidLocation = true
                    }
                })
                if (hasInvalidLocation) {
                    e.diagram.layoutDiagram(true)
                }
            },
            'undoManager.isEnabled': true,
        })

        // define a simple Node template
        diagram.nodeTemplate = $(
            go.Node,
            'Auto',
            {
                locationSpot: go.Spot.Center,
                avoidable: true,
                avoidableMargin: (10, 10, 10, 10),
            },
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            {
                click: (e, obj) => {
                    setNodeDataArray((prevNodes) => {
                        if (prevNodes.filter((x) => x.isSelected === true).length <= 5) {
                            const ids = _.cloneDeep(prevNodes)
                            const index = ids.findIndex((x) => x.key === obj.part.data.key)
                            const orderedNodes = _.sortBy(
                                ids.filter((x) => x.order !== undefined),
                                'order'
                            )
                            if (index !== -1) {
                                ids[index].isSelected = !ids[index].isSelected
                                ids[index].order =
                                    orderedNodes.length > 0
                                        ? orderedNodes[orderedNodes.length - 1].order + 1
                                        : 1
                            }
                            return ids
                        } else {
                            return prevNodes
                        }
                    })
                },
            },
            $(
                go.Shape,
                'RoundedRectangle',
                {
                    fill: nodeColor
                        ? nodeColor
                        : theme?.colorScheme
                          ? theme.colorScheme?.colors[0].val
                          : 'white', // the default fill, if there is no data bound value
                    portId: '',
                    cursor: 'pointer', // the Shape is the port, not the whole Node
                    stroke: theme?.colorScheme ? theme.colorScheme?.colors[4].val : '#473766',
                    strokeWidth: 2,
                    fromSpot: go.Spot.AllSides,
                    toSpot: go.Spot.AllSides,
                },
                new go.Binding('fill', '', (d) =>
                    d.isSelected === true ? '#473766' : colorFromValue(d)
                )
            ),
            $(
                go.TextBlock,
                {
                    font: theme?.fonts
                        ? `${theme.fonts[0].variant} ${textSize}pt ${theme.fonts[0].family}`
                        : `bold ${textSize}pt sans-serif`,
                    stroke: 'white',
                    margin: 10, // make some extra space for the shape around the text
                    isMultiline: false, // don't allow newlines in text
                    editable: false, // allow in-place editing by user
                    width: nodeWidth,
                    textAlign: 'center',
                },
                new go.Binding('stroke', '', (d) =>
                    d.isSelected === true ? 'white' : colorNodeText(d.value)
                ),
                new go.Binding('text', 'node').makeTwoWay(),
                {
                    // this tooltip Adornment is shared by all nodes
                    toolTip: $(
                        'ToolTip',
                        $(go.TextBlock, { margin: 4 }, new go.Binding('text', '', nodeInfo))
                    ),
                }
            ) // the label shows the node data's text
        )

        // The link shape and arrowhead have their stroke brush data bound to the "color" property
        diagram.linkTemplate = $(
            go.Link,
            {
                routing: go.Link.AvoidsNodes,
                corner: 5,
                reshapable: true,
                resegmentable: true,
                relinkableFrom: false,
                relinkableTo: false,
                toShortLength: 10,
            },
            $(go.Shape, new go.Binding('strokeWidth', '', strokeWidthFromValue), {
                stroke: theme?.colorScheme?.darkTheme ? 'white' : '#6191F2',
            }),
            $(
                go.Shape,
                {
                    toArrow: 'Standard',
                    stroke: theme?.colorScheme?.darkTheme ? 'white' : '#6191F2',
                    fill: theme?.colorScheme?.darkTheme ? 'white' : '#6191F2',
                },
                new go.Binding('scale', '', arrowHeadSize)
            ),
            {
                // this tooltip Adornment is shared by all links
                toolTip: $(
                    'ToolTip',
                    $(go.TextBlock, { margin: 4 }, new go.Binding('text', '', linkInfo))
                ),
            },
            $(
                go.Panel,
                'Auto',
                $(go.Shape, {
                    fill: $(go.Brush, {
                        1: 'white',
                    }),
                    stroke: theme?.colorScheme?.darkTheme ? 'white' : '#6191F2',
                }),
                $(
                    go.TextBlock, // the label text
                    {
                        textAlign: 'center',
                        font: '10pt helvetica, arial, sans-serif',
                        stroke: 'black',
                        margin: 5,
                        background: 'white',
                    },
                    new go.Binding('text', '', lineValueLabel)
                )
            )
        )

        return diagram
    }

    return (
        <>
            <ReactDiagram
                ref={diagramRef}
                divClassName={styles.diagramComponent}
                initDiagram={initDiagram}
                nodeDataArray={nodeDataArray}
                linkDataArray={linkDataArray}
                style={{
                    backgroundColor: backgroundColor
                        ? backgroundColor
                        : `${theme?.colorScheme?.backgroundColor ? theme.colorScheme.backgroundColor : '#F5F5F5'}`,
                }}
            />
        </>
    )
}
