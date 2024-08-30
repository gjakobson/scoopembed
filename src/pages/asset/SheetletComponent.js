import dynamic from 'next/dynamic';
import React, {useRef, useState, useEffect} from "react";
import Handsontable from "handsontable";
import {textRenderer} from "handsontable/renderers/textRenderer";
import {ServerContext} from "../api/SheetState";
import {Server} from '../api/Server'
import 'handsontable/dist/handsontable.full.css';
import {useApi} from "@/pages/api/api";
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";

const HotTable = dynamic(() => import('@handsontable/react').then(mod => mod.HotTable), {ssr: false});

const SheetletComponent = ({
                               canvasID,
                               worksheetID,
                               serverUpdate,
                               socketConnected,
                               sendMessage,
                               designID,
                               userID,
                               workspaceID,
                               token,
                               setWorksheetID,
                               isBlending
                           }) => {

    const container = typeof window !== 'undefined' ? document.getElementById('scoop-element-container') : {offsetWidth: 0, offsetHeight: 0}
    const itemID = `${userID}-${workspaceID}-${canvasID}-${worksheetID}`;
    const {postData} = useApi(token, userID, workspaceID);
    const [data, setData] = useState([]);
    const [colHeaders, setColHeaders] = useState(null);
    const [colWidths, setColWidths] = useState(null);
    const [rowHeaders, setRowHeaders] = useState(null);
    const [hiddenRows, setHiddenRows] = useState(null);
    const [loading, setLoading] = useState(true);
    const hotTableComponent = useRef(null);
    const [server, setServer] = React.useState(new Server(workspaceID, userID, token));
    const [serverContext, setServerContext] = useState(new ServerContext(server));
    const [suppressGrid, setSuppressGrid] = useState(false);
    const [suppressHeaders, setSuppressHeaders] = useState(false);
    const [locked, setLocked] = useState(false);
    const [sheetRange, setSheetRange] = useState({});
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        if (socketConnected && !registered) {
            const action = {
                action: 'registerItem',
                groupID: designID,
                itemID: itemID
            }
            setRegistered(true)
            sendMessage(JSON.stringify(action))
        }
    }, [socketConnected, registered])

    // useEffect(() => {
    //     const getSheet = async () => {
    //         try {
    //             const action = {
    //                 action: "getSheet",
    //                 sheetRange: sheetRange,
    //                 aggregation: isBlending === false && true
    //             };
    //             await serverContext.server.sheetPostData(action, getResults);
    //         } catch (e) {
    //             console.log("ERROR: ", e);
    //         }
    //     }
    //     if (serverUpdate?.action === 'updatePrompts') {
    //         if (serverUpdate.prompts.filters) {
    //             const worksheetPrompt = serverUpdate.prompts?.filters.some(f => data.some(row => row.some(value => value === f.attributeName)))
    //             //if (worksheetPrompt) getSheet()
    //         } else {
    //             const worksheetPrompt = data.some(row => row.some(value => value === serverUpdate.prompts.attributeName))
    //             //if (worksheetPrompt) getSheet()
    //         }
    //     }
    // }, [serverUpdate, data, sheetRange])

    useEffect(() => {
        postData({
            "action": "loadCanvasWithThemes",
            "userID": userID,
            "workspaceID": workspaceID,
            "canvasID": canvasID,
        }).then(r => {
            const sheets = r.canvas.canvasObjects.filter(o => o.type === 'SheetletElement')
            const sheetElement = sheets.filter(s => s.content.worksheetID === worksheetID)[0]
            const range = {
                sheetType: "LiveSheet",
                worksheetID: worksheetID,
            }
            if (sheetElement.content.worksheetRange) {
                range.rangeName = sheetElement.content.worksheetRange
            } else {
                range.sheetNum = sheetElement.content.worksheetNum
                range.sheetName = sheetElement.content.worksheetName
            }
            setSheetRange(range)

            const getSheet = async () => {
                try {
                    const action = {
                        action: "getSheet",
                        sheetRange: range,
                        aggregation: isBlending === false && true
                    };
                    await serverContext.server.sheetPostData(action, getResults);
                } catch (e) {
                    console.log("ERROR: ", e);
                }
            }

            if (!serverContext.serverData || !serverContext.serverData.data) getSheet()
        })
    }, [])

    class ScoopEditor extends Handsontable.editors.TextEditor {

        finishEditing(restoreOriginalValue = false, ctrlDown = false, callback) {
            super.finishEditing(restoreOriginalValue, ctrlDown, callback);
            if (!serverContext.serverData || !this.TEXTAREA.initialized)
                return;
            let value = this.getValue();
            serverContext.enterValueInCell(sheetRange, value, this.row, this.col, serverContext.applyChanges, this.hot, serverContext.serverData.cells[this.row][this.col]?.t,
                () => {
                    //dispatch(forceExplorerDataRefresh(sheetRange.worksheetID));
                });
            // Get the formatted results from the server
            if (serverContext.serverData.cells[this.row][this.col]?.t && serverContext.serverData.cells[this.row][this.col]?.t.length > 0 && !serverContext.serverData.cells[this.row][this.col]?.f) {
                let cell = serverContext.serverData.cells[this.row][this.col];
                serverContext.getFormattedData(this.getValue(), cell.t, this.row, this.col, cell.b, (result, obj) => {
                    this.hot.setDataAtCell(obj.row, obj.col, result.result);
                    let worksheetID = serverContext?.serverData?.worksheetID;
                });
                console.log("formatting cell");
            }
            this.TEXTAREA.initialized = false;
        }

        beginEditing(initialValue = null, event) {
            super.beginEditing(initialValue, event);
            this.TEXTAREA.style.color = "#222";
            var curCell = serverContext.serverData.cells[this.row][this.col];
            if (curCell) {
                if (curCell.f) {
                    this.setValue('=' + curCell.f);
                } else if (curCell.b) {
                    // Boolean
                    this.setValue(curCell.s);
                } else if (curCell.d) {
                    // Date
                    this.setValue(curCell.s);
                } else if (curCell.r) {
                    this.setValue(curCell.r);
                } else if (curCell.s) {
                    this.setValue(curCell.s);
                }
                if (curCell.si) {
                    let style = serverContext.serverData.styles[curCell.si];
                    if (style) {
                        let s = this.TEXTAREA.style;
                        if (style.fontIndex !== null) {
                            setFontStyle(s, style.fontIndex);
                        }
                    }
                }
            }
            this.TEXTAREA.initialized = true;
        }

        open() {
            super.open();
            this.addHook('beforeOnCellMouseDown', (event, coords, TD, controller) => this.beforeOnCellMouseDown(event, coords, TD, controller));
        }

        close() {
            super.close();
            this.clearHooks();
        }

        getSheetColumn(colNumber) {
            let result = "";
            let numCharacters = 0;
            let remainder = colNumber;
            do {
                result += String.fromCharCode(65 + remainder % 26);
                remainder = ~~(remainder / 26) - 1;
                numCharacters++;
            } while (remainder >= 0);
            let reverse = "";
            for (let i = 0; i < numCharacters; i++) {
                reverse += result[numCharacters - i - 1];
            }
            return reverse;
        }

        beforeOnCellMouseDown(event, coords, TD, controller) {
            let val = this.getValue();
            if (val && val.startsWith("=")) {
                val += this.getSheetColumn(serverContext.serverData.startPos?.col + coords.col) + (coords.row + serverContext.serverData.startPos?.row + 1);
                this.setValue(val);
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }

        createElements() {
            super.createElements();
            this.TEXTAREA.setAttribute('data-hot-input', true); // Makes the element recognizable by HOT as its own component's element.
            this.TEXTAREA_PARENT.innerText = '';
            this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
            this.TEXTAREA.initialized = false;
        }
    }

    function handleClickIncludeColumn(event) {
        var row = event.target.row;
        var col = event.target.col;
        var cell = serverContext.serverData.cells[row][col];
        if (cell.r === 0) {
            cell.r = 1;
        } else {
            cell.r = 0;
        }
    }

    function setFontStyle(s, fontIndex) {
        let font = serverContext.serverData.fonts[fontIndex];
        if (font) {
            if (font.bold) {
                s.fontWeight = "bold";
            }
            if (font.italic) {
                s.fontStyle = "italic";
            }
            if (font.height) {
                s.fontSize = font.height + 'pt';
            }
            if (font.fcolor) {
                s.color = '#' + font.fcolor;
            }
            if (font.family) {
                s.fontFamily = font.family;
            }
        }
    }

    function afterColumnChange(event) {
    }

    function handleColumnChange(event) {
        serverContext.serverData.cells[event.target.row][event.currentTarget.col].sheetObject.address = event.currentTarget.value;
        var cell1 = serverContext.serverData.cells[event.target.row][1];
        var cell2 = serverContext.serverData.cells[event.target.row][3];
        cell1.f = cell1.sheetObject.address + "=" + cell2.sheetObject.address;
        serverContext.updateCell(sheetRange, event.target.row, 1, cell1, afterColumnChange, hotTableComponent, serverContext);
    }

    function afterChange(changes) {
        if (!changes)
            return;
        let coordinates = [];
        for (let i = 0; i < changes.length; i++) {
            if (changes[i][2] !== null && changes[i][3] === null) {
                coordinates.push([changes[i][0], changes[i][1]]);
            }
        }
        if (coordinates.length > 0) {
            for (let i = 0; i < coordinates.length; i++) {
                serverContext.serverData.cells[coordinates[i][0]][coordinates[i][1]] = undefined;
            }
            serverContext.deleteCells(sheetRange, coordinates);
        }
    }

    function afterPaste(valueArray, targetCells) {
        for (let x = targetCells[0].startCol; x <= targetCells[0].endCol; x++) {
            for (let y = targetCells[0].startRow; y <= targetCells[0].endRow; y++) {
                let cell = this.serverContext.serverData.cells[this.serverContext.lastCopySelection.row + y - targetCells[0].startRow][this.serverContext.lastCopySelection.column + x - targetCells[0].startCol];
                this.enterValueInCell(sheetRange, cell.r ? cell.r : cell.s, y, x, this.applyChanges, hotTableComponent.current.hotInstance, cell.t,
                    () => {
                        //dispatch(forceExplorerDataRefresh(sheetRange.worksheetID));
                    });
            }
        }
    }

    function afterSelection(row, column, row2, column2, preventScrolling, selectionLayerLevel) {
        serverContext.lastSelectionData = {row: row, column: column, row2: row2, column2: column2};
    }

    function setFontStyle(s, fontIndex) {
        let font = serverContext.serverData.fonts[fontIndex];
        if (font) {
            if (font.bold) {
                s.fontWeight = "bold";
            }
            if (font.italic) {
                s.fontStyle = "italic";
            }
            if (font.height) {
                s.fontSize = font.height + 'pt';
            }
            if (font.fcolor) {
                s.color = '#' + font.fcolor;
            }
            if (font.family) {
                s.fontFamily = font.family;
            }
        }
    }

    function scoopTextRenderer(instance, TD, row, col, prop, value, cellProperties) {
        if (serverContext.serverData && Object.keys(serverContext.serverData).length > 0) {
            textRenderer(instance, TD, row, col, prop, value, cellProperties);
            let cell = serverContext.serverData.cells[row][col];
            if (!serverContext.settings.gridLines || suppressGrid) {
                TD.style.borderBottom = 0;
                TD.style.borderBottom = 'none';
                TD.style.borderLeft = 0;
                TD.style.borderLeft = 'none';
                TD.style.borderRight = 0;
                TD.style.borderRight = 'none';
            }
            if (cell && cell.cb) {
                TD.innerText = "";
                const checkBox = document.createElement('INPUT');
                checkBox.type = 'checkbox';
                checkBox.checked = cell.r === 1;
                checkBox.row = row;
                checkBox.col = col;
                checkBox.onclick = handleClickIncludeColumn;
                checkBox.style.accentColor = '#E50B54';
                TD.style.textAlign = 'center';
                TD.appendChild(checkBox)
            } else if (cell && cell.si !== undefined) {
                let style = serverContext.serverData.styles[cell.si];
                TD.style.textAlign = (cell.r !== undefined) && (typeof cell.r === 'number') ? 'right' : 'left';
                if (style) {
                    let s = TD.style;
                    if (style.fontIndex !== null) {
                        setFontStyle(s, style.fontIndex);
                    }
                    if (style.hAlign) {
                        switch (style.hAlign) {
                            case "CENTER":
                                s.textAlign = 'center';
                                break;
                            case "LEFT":
                                s.textAlign = 'left';
                                break;
                            case "RIGHT":
                                s.textAlign = 'right';
                                break;
                        }
                    }
                    if (style.vAlign) {
                        switch (style.vAlign) {
                            case "CENTER":
                                s.textAlign = 'middle';
                                break;
                            case "TOP":
                                s.textAlign = 'top';
                                break;
                            case "BOTTOM":
                                s.textAlign = 'bottom';
                                break;
                        }
                    }
                    if (style.bgcolor) {
                        s.backgroundColor = '#' + style.bgcolor;
                    }
                    if (style.bb) {
                        s.borderBottom = 1;
                        s.borderBottom = 'solid';
                    }
                    if (style.bt) {
                        s.borderTop = 1;
                        s.borderTop = 'solid';
                    }
                    if (style.bl) {
                        s.borderLeft = 1;
                        s.borderLeft = 'solid';
                    }
                    if (style.br) {
                        s.borderRight = 1;
                        s.borderRight = 'solid';
                    }
                }
            }
            if (cell && cell.elementID) {
                TD.id = cell.elementID;
            }
            if (cell && cell.sheetObject) {
                if (cell.sheetObject.sheetObjectType === "refreshInput") {
                    TD.innerText = null;
                    TD.style.lineHeight = '17px';
                    TD.style.paddingBottom = '4px';
                    const ntd = document.createElement('button');
                    ntd.style.textAlign = 'center';
                    ntd.style.border = 'none';
                    ntd.style.backgroundColor = '#FCE7EE';
                    ntd.style.color = '#E50B54';
                    ntd.style.fontSize = '16px';
                    ntd.style.height = '25px';
                    ntd.style.width = '100px';
                    ntd.style.borderRadius = '5px';
                    ntd.style.cursor = 'pointer';
                    ntd.onclick = () => {
                        serverContext.server.sheetPostData({
                            action: 'addOn',
                            addOnAction: 'refreshInputQuery',
                            noFlush: true,
                            sheetRange: sheetRange,
                            sheetID: sheetRange.worksheetID
                        }, serverContext.applyChanges, {
                            hotComponent: hotTableComponent.current.hotInstance,
                            serverContext: serverContext,
                            handler: () => {
                                //dispatch(forceExplorerDataRefresh(sheetRange.worksheetID));
                            }
                        });
                    };
                    ntd.innerHTML = '<span>Refresh</span>';
                    TD.appendChild(ntd);
                } else if (locked && (cell.sheetObject.sheetObjectType === "column1Select" || cell.sheetObject.sheetObjectType === "column2Select")) {
                    TD.innerText = "";
                    TD.style.borderBottom = null;
                    TD.style.borderTop = null;
                    TD.style.borderLeft = null;
                    TD.style.borderRight = null;
                    TD.style.backgroundColor = null;
                    const selectBox = document.createElement('SELECT');
                    selectBox.name = cell.sheetObject.sheetObjectType;
                    selectBox.id = cell.sheetObject.sheetObjectType;
                    selectBox.row = row;
                    selectBox.col = col;
                    selectBox.style.color = '#FFFFFF';
                    selectBox.style.backgroundColor = '#E50B54';
                    selectBox.style.borderRadius = '7px';
                    selectBox.style.height = '90%';
                    selectBox.style.width = '100%';
                    selectBox.onchange = handleColumnChange;
                    let columns = cell.sheetObject.columns;
                    let addresses = cell.sheetObject.addresses;
                    if (columns) {
                        for (let i = 0; i < columns.length; i++) {
                            let option = document.createElement("OPTION");
                            option.value = addresses[i];
                            option.text = columns[i];
                            if (option.value === cell.sheetObject.address) {
                                option.selected = true;
                            }
                            selectBox.appendChild(option);
                        }
                    }
                    TD.style.textAlign = 'center';
                    TD.appendChild(selectBox);
                    let style = serverContext.serverData.styles[cell.si];
                    if (cell.sheetObject.sheetObjectType === "column1Select") {
                        let headerCell = document.getElementById("queryColumn1Header");
                        if (headerCell) {
                            headerCell.innerText = "Query Column 1";
                            headerCell.style.textAlign = 'center';
                            headerCell.style.backgroundColor = "#E6E4E6"
                            if (style) {
                                setFontStyle(headerCell.style, style.fontIndex);
                            }
                        }
                    } else {
                        let headerCell = document.getElementById("queryColumn2Header");
                        if (headerCell) {
                            headerCell.innerText = "Query Column 2";
                            headerCell.style.textAlign = 'center';
                            headerCell.style.backgroundColor = "#E6E4E6";
                            if (style) {
                                setFontStyle(headerCell.style, style.fontIndex);
                            }
                        }
                    }
                } else if (locked && cell.sheetObject.sheetObjectType === "blendingOperator") {
                    TD.innerText = "=";
                    TD.style.textAlign = 'center';
                }
            } else if (locked) {
                if (cell && cell.editable) {
                    const divElement = document.createElement('div');
                    if (cell.cb) {
                        const curChild = TD.children[0];
                        divElement.appendChild(curChild);
                    } else {
                        const innert = TD.innerText;
                        divElement.innerText = innert;
                    }
                    TD.innerText = null;
                    TD.style.lineHeight = '17px';
                    TD.style.paddingBottom = '4px';
                    TD.appendChild(divElement)
                    divElement.style.borderStyle = 'solid';
                    divElement.style.width = '100%';
                    divElement.style.height = '100%';
                    divElement.style.borderWidth = '1px';
                    divElement.style.borderRadius = '3px';
                    divElement.style.borderColor = '#E50B54';
                    divElement.style.paddingBottom = '0px';
                    divElement.style.margin = '0px';
                } else if (cell && cell.addNewButton) {
                    TD.innerText = null;
                    TD.style.lineHeight = '17px';
                    TD.style.paddingBottom = '4px';
                    const divElement = document.createElement('button');
                    divElement.style.border = 'none';
                    divElement.style.backgroundColor = '#FCE7EE';
                    divElement.style.color = '#E50B54';
                    divElement.style.fontSize = '16px';
                    divElement.style.height = '25px';
                    divElement.style.width = '25px';
                    divElement.style.borderRadius = '5px';
                    divElement.style.cursor = 'pointer';
                    divElement.onclick = addNew;
                    divElement.style.textAlign = 'center';
                    divElement.innerHTML = '+'
                    TD.appendChild(divElement);
                } else {
                    cellProperties.readOnly = true;
                }
            }
        }
    }

    function getResults(result) {
        serverContext.serverData = result;
        let data = [];
        for (let r = 0; r < result.cells?.length; r++) {
            let row = [];
            for (let c = 0; c < result.cells[r].length; c++) {
                if (result.cells[r][c]) {
                    if (result.cells[r][c].si) {
                        let style = result.styles[result.cells[r][c].si];
                        if (style && style.format) {
                            result.cells[r][c].t = style.format;
                        }
                    }
                    if (result.cells[r][c].s) {
                        row.push(result.cells[r][c].s);
                    } else {
                        row.push(null);
                    }
                } else {
                    row.push(null);
                }
            }
            data.push(row);
        }
        setData(data);
        if (result.colHeaders) {
            setColHeaders(result.colHeaders);
        }
        if (result.rowHeaders) {
            setRowHeaders(result.rowHeaders);
        }
        if (result.hiddenRows) {
            var firstRow = result.rowHeaders ? result.rowHeaders[0] : 0;
            var hidden = [];
            for (var i = 0; i < result.hiddenRows.length; i++) {
                hidden.push(result.hiddenRows[i] - firstRow);
            }
            setHiddenRows({rows: hidden});
        } else {
            setHiddenRows(null);
        }
        if (result.colWidths) {
            setColWidths(result.colWidths);
        }
        setWorksheetID && setWorksheetID(result.worksheetID);
        setLoading(false)
    }

    return (
        <>
            {
                loading ?
                    <div style={{width: '100%', height: '100%', display: 'grid', placeContent: 'center'}}>
                        <ScoopLoader size={container.offsetWidth * 0.1}/>
                    </div> :
                    <HotTable
                        editor={ScoopEditor}
                        ref={hotTableComponent}
                        data={data}
                        width={'100%'}
                        colWidths={colWidths}
                        height={'400px'}
                        licenseKey="4f426-71673-ae630-24549-4580d"
                        renderer={scoopTextRenderer}
                        hiddenRows={hiddenRows}
                        afterChange={afterChange}
                        afterPaste={afterChange}
                        afterSelection={afterSelection}
                    />
            }
        </>
    )

}

export default SheetletComponent;
