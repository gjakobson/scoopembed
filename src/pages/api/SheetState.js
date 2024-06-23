// SheetState.js
export class ServerContext {

    constructor(server) {
        this.serverData = {};
        this.server = server;
        // this.lastSelectionData;
        // this.lastCopySelection;
        this.settings = {
            gridLines: true
        };
    }

    isNumeric(str) {
        if (typeof str != "string") return false; // we only process strings!
        // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)
        // ...and ensure strings of whitespace fail
        return !isNaN(str) && !isNaN(parseFloat(str));
    }

    getFormattedData(rawData, format, row, col, isBoolean, handler) {
        var action = {
            "action": "formatData",
            "value": rawData,
            "isBoolean": isBoolean,
            "format": format
        };
        this.server.sheetPostData(action, handler, {row: row, col: col});
    }

    updateCell(sheetRange, row, col, cell, handler, hotComponent, serverContext) {
        var action = {
            "action": "updateCell",
            "sheetRange": sheetRange,
            "row": row + serverContext.serverData.startPos.row,
            "col": col + serverContext.serverData.startPos.col,
            "cell": cell
        };
        this.server.sheetPostData(action, handler, {hotComponent, serverContext});
    }

    deleteCells(sheetRange, coordinates) {
        var action = {
            "action": "deleteCells",
            "sheetRange": sheetRange,
            "coordinates": coordinates
        };
        this.server.sheetPostData(action, () => {
        });
    }

    enterValueInCell(sheetRange, value, row, col, applyChanges, hot, format, updateCallback) {
        let curCell = this.serverData.cells[row][col];
        if (curCell?.f) {
            // Existing formula
            let formulaString = '=' + curCell?.f;
            // Formula cell - only handle when editing the formula itself
            if (value !== formulaString) {
                if (!curCell) {
                    curCell = {s: '', t: ServerContext.BASE_NUMBER_FORMAT};
                    this.serverData.cells[row][col] = curCell;
                }
                console.log("updating formula to " + value + " vs =" + curCell?.f);
                curCell.f = value.substring(1);
                if (format) {
                    curCell.t = format;
                }
                this.updateCell(sheetRange, row, col, curCell, this.applyChanges, hot, this);
                if (updateCallback)
                    updateCallback();
            } else {
                if (curCell.s !== undefined) {
                    hot.setDataAtCell(row, col, curCell.s);
                }
            }
        } else if (typeof value !== 'number' && value.startsWith('=') && value.length > 1) {
            // New formula that is non-empty
            if (!curCell) {
                curCell = {s: '', t: ServerContext.BASE_NUMBER_FORMAT};
                this.serverData.cells[row][col] = curCell;
            }
            console.log("updating formula to " + value + " vs " + curCell.s);
            curCell.f = value.substring(1);
            if (format) {
                curCell.t = format;
            }
            this.updateCell(sheetRange, row, col, curCell, this.applyChanges, hot, this);
            if (updateCallback)
                updateCallback();
        } else {
            let valueIsNumeric = typeof value === 'number' || this.isNumeric(value);
            if (valueIsNumeric) {
                // Number cell
                let nVal = typeof value === 'number' ? value : parseFloat(value);
                if (!curCell) {
                    curCell = {s: value};
                    this.serverData.cells[row][col] = curCell;
                }
                if (format) {
                    curCell.t = format;
                } else if (!curCell.si) {
                    curCell.t = ServerContext.BASE_NUMBER_FORMAT;
                }
                if (nVal !== curCell.r) {
                    curCell.r = nVal;
                    this.updateCell(sheetRange, row, col, curCell, this.applyChanges, hot, this);
                    console.log("updating number to " + value);
                    if (updateCallback)
                        updateCallback();
                    // TODO: May need to format
                }
            } else {
                // String cell
                if (!curCell) {
                    curCell = {s: ''};
                    this.serverData.cells[row][col] = curCell;
                }
                if (format) {
                    curCell.t = format;
                }
                if (value !== curCell?.s) {
                    // Revert to string
                    curCell.r = undefined;
                    curCell.s = value;
                    this.updateCell(sheetRange, row, col, curCell, this.applyChanges, hot, this);
                    console.log("updating string to " + value);
                    if (updateCallback)
                        updateCallback();
                }
            }
        }
    }

    applyChanges(cellChangeResults, {hotComponent, serverContext, handler}) {
        hotComponent.batch(() => {
            for (let i = 0; i < cellChangeResults.changedCells.length; i++) {
                let changedCell = cellChangeResults.changedCells[i];
                let row = changedCell.row;
                let col = changedCell.col;
                hotComponent.setDataAtCell(row, col, changedCell.s);
                serverContext.serverData.cells[row][col] = changedCell;
            }
        });
        if (cellChangeResults.si) {
            serverContext.serverData.styles[cellChangeResults.si] = cellChangeResults.style;
        }
        if (handler) {
            handler();
        }
    }
}

ServerContext.BASE_NUMBER_FORMAT = "#,###.##";
