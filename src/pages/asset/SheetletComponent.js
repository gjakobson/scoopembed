
import dynamic from 'next/dynamic';

const HotTable = dynamic(() => import('@handsontable/react').then(mod => mod.HotTable), { ssr: false });
import React, { useRef, useState, useEffect } from "react";
import Handsontable from "handsontable";
import { textRenderer } from "handsontable/renderers/textRenderer";
import { ServerContext } from "../api/SheetState";
import { Server } from '../api/Server'


const SheetletComponent = ({
    sheetletId = "SheetletElement-0.35501857358264255",
    sheetRange = {
        "sheetType": "LiveSheet",
        "worksheetID": "1JPK2BapLrJxeHKJcIUkHFbnZCVJJLfRGQ0Ju7TsWWDY",
        "rangeName": "WeightedPipeline"
    },
    setWorksheetID,
    isBlending
}) => {
    console.log("sheetRange: ", sheetRange)

    const ariaLabel = { 'aria-label': 'description' };

    const [data, setData] = useState([]);
    const [colHeaders, setColHeaders] = useState(null);
    const [colWidths, setColWidths] = useState(null);
    const [rowHeaders, setRowHeaders] = useState(null);
    const [hiddenRows, setHiddenRows] = useState(null);
    const [loading, setLoading] = useState(true);
    const hotTableComponent = useRef(null);

    const userID = "61cb586e-307a-4dd5-99be-044c8aba5ab3"
    const workspaceID = "W283";
    const token = "eyJraWQiOiI3dVwvZmEwRWZmU2NzWHAyQmRNK1RmY2lENk9yR2lNdDBRaDdpNTR0cktQbz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0NmMyZWE2OS02Y2JkLTQyYjYtYTRiNC1jOTE4NDM5NTgzNDYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMTA5NTM3OTE5OCIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yXzRSeWx0cXlKNyIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6IjYxY2I1ODZlLTMwN2EtNGRkNS05OWJlLTA0NGM4YWJhNWFiMyIsIm9yaWdpbl9qdGkiOiJlNzU1NjAxMC01NzRkLTRlZDItODY5My1jZjk3OWYyYzg3MTUiLCJhdWQiOiI3NmF0cjYycm40aXVrOHVoajhyOGd0MzltcyIsImV2ZW50X2lkIjoiMWU1ZWVmMzgtZGJhMC00ZTRmLTg5NTItNjhkMWQzYzE5Yzg5IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTg3NjI5NTQsInBob25lX251bWJlciI6IisxNzAyODQ1NDQ4NSIsImV4cCI6MTcxOTExMjI3OCwiaWF0IjoxNzE5MDI1ODc4LCJqdGkiOiIwYzlkNzhjNC0zNzFmLTQ1MmEtODIyNy0xNGIxMTVlYmFiNTMiLCJlbWFpbCI6ImdhYmVAc2Nvb3AucmVwb3J0In0.EgbrJOBTapHK0vA7MXoS09bSkgB7tNMlsuKwtmVW-ILtdia_rhFNHjfYNE73bDMRvzQ482zA3JsNqqjti5TtqMQV8D5DH5bH1f9atxO8udfYhj2dU_EorC2DfV8FPyGI1yZ0eNFdHpNyE127YTNkNHegt3jG0QkoqzufQGVBh_wjb6DRKuG_cEl0UxUZE1KJNsWnDVU-xzM4tIjrIKghweUFYc1v4SmrlcGvPlOq7k_Ujh_ZzCI8sKZrOnMWcYPZsUSPveNkXpWedde_-WAj8PRQ5SL0DyTODLDJyYTsQSRMVFg_Ely92PCJgfkcdzFlry5k0rANrlSJwPQCtS4M4A"


    const [server, setServer] = React.useState(new Server(workspaceID, userID, token));
    const [serverContext, setServerContext] = useState(new ServerContext(server));

    const [suppressGrid, setSuppressGrid] = useState(false);
    const [suppressHeaders, setSuppressHeaders] = useState(true);
    const [locked, setLocked] = useState(false);

    class ScoopEditor extends Handsontable.editors.TextEditor {

        finishEditing(restoreOriginalValue = false, ctrlDown = false, callback) {
            super.finishEditing(restoreOriginalValue, ctrlDown, callback);
            if (!serverContext.serverData || !this.TEXTAREA.initialized)
                return;
            let value = this.getValue();
            serverContext.enterValueInCell(sheetRange, value, this.row, this.col, serverContext.applyChanges, this.hot, serverContext.serverData.cells[this.row][this.col]?.t,
                () => {
                    dispatch(forceExplorerDataRefresh(sheetRange.worksheetID));
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
                                dispatch(forceExplorerDataRefresh(sheetRange.worksheetID));
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
        console.log("result in SheetletComponent: ", result)
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
            setHiddenRows({ rows: hidden });
        } else {
            setHiddenRows(null);
        }
        if (result.colWidths) {
            setColWidths(result.colWidths);
        }
        setWorksheetID && setWorksheetID(result.worksheetID);
    }


    useEffect(() => {
        const getSheet = async () => {
            try {
                const action = {
                    "action": "getSheet",
                    "sheetRange": sheetRange,
                    "aggregation": isBlending === false && true
                }
                console.log("action: ", action)

                await serverContext.server.sheetPostData(action, getResults);
            } catch (e) {
                console.log("ERROR: ", e)
            }
        }

        if (!serverContext.serverData || !serverContext.serverData.data) {
            getSheet();
        }
    }, [serverContext]);



    return (
        typeof window !== 'undefined' && (
        <HotTable
            ref={hotTableComponent}
            data={data}
            rowHeaders={suppressHeaders ? false : (rowHeaders ? rowHeaders : true)}
            colHeaders={suppressHeaders ? false : (colHeaders ? colHeaders : true)}
            width={'100%'}
            colWidths={colWidths}
            height={'400px'}
            licenseKey="4f426-71673-ae630-24549-4580d"
            renderer={scoopTextRenderer}
            hiddenRows={hiddenRows}

        />
        )
    )

}

export default SheetletComponent;