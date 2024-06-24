export function unpackFilters(filter) {
    let result = [];
    if (filter === undefined || filter === null) {
        return result;
    }
    if (filter.boperator !== undefined && filter.boperator === "And") {
        for (let i = 0; i < filter.filters.length; i++) {
            result.push(getAttributeFilterObject(filter.filters[i]))
        }
    } else {
        result.push(getAttributeFilterObject(filter));
    }
    return result;
}

export function packFilter(filterList) {
    if (filterList.length === 0) return null;
    if (filterList.length === 1) return filterList[0];
    var result = {
        boperator: "And", filters: []
    }
    for (let i = 0; i < filterList.length; i++) {
        var filter = filterList[i];
        result.filters.push(filter);
    }
    return result;
}

export function getAttributeFilterObject(columnFilter) {
    let result = {
        attributeName: null, operator: "Equals", filterValue: {
            values: []
        }
    }
    if (columnFilter.boperator !== undefined && columnFilter.boperator === "Or") {
        result.attributeName = columnFilter.filters[0].attributeName;
        result.operator = columnFilter.filters[0].operator;
        for (let i = 0; i < columnFilter.filters.length; i++) {
            result.filterValue.values.push(columnFilter.filters[i].filterValue.values[0]);
        }
    } else {
        result.attributeName = columnFilter.attributeName;
        result.operator = columnFilter.operator;
        result.filterValue.values = columnFilter.filterValue.values;
    }
    return result;
}

export function getStringForFilter(filter) {
    var result = filter.attributeName + " " + getOperationString(filter.operator) + " ";
    if (!filter.filterValue) {
        return null;
    }
    for (let i = 0; i < filter.filterValue.values.length; i++) {
        if (i > 0) {
            result += " Or ";
        }
        result += filter.filterValue.values[i];
    }
    return result;
}

function getOperationString(operator) {
    if (operator === "Equals") return "=";
    if (operator === "NotEquals") return "<>";
    if (operator === "GreaterThan") return ">";
    if (operator === "GreaterThanOrEquals") return ">=";
    if (operator === "LessThan") return "<";
    if (operator === "LessThanOrEquals") return "<=";
    if (operator === "Like") return "Like";
    return operator;
}

export function areEquals(filter1, filter2) {
    if (filter1 === null && filter2 === null) return true;
    if (filter1 === null || filter2 === null) return false;
    if (filter1.boperator && !filter2.boperator) return false;
    if (filter2.boperator && !filter1.boperator) return false;
    if (filter1.boperator) {
        if (filter1.filters.length !== filter2.filters.length) return false;
        for (var i = 0; i < filter1.filters.length; i++) {
            if (!areEquals(filter1.filters[i], filter2.filters[i])) {
                return false;
            }
        }
        return true;
    } else {
        if (filter1.attributeName !== filter2.attributeName) return false;
        if (filter1.operator !== filter2.operator) return false;
        if (filter1.filterValue.values.length !== filter2.filterValue.values.length) return false;
        for (var i = 0; i < filter1.filterValue.values.length; i++) {
            if (filter1.filterValue.values[i] !== filter2.filterValue.values[i]) {
                return false;
            }
        }
        return true;
    }
}

function isSelect(operator) {
    return operator === 'Equals' || operator === 'Like' || operator === 'In';
}


export function combineFilters(qfa, qfb) {
    if (qfa != null && qfb == null) return qfa;
    if (qfa == null && qfb != null) return qfb;
    if (qfa == null && qfb == null) return null;
    if (qfa.operator && qfb.operator) {
        if (qfa.areEqual(qfb)) {
            return JSON.parse(JSON.stringify(qfa));
        }
        if (qfa.attributeName.equals(qfb.attributeName)) {
            if (isSelect(qfa.operator) && isSelect(qfb.operator)) {
                if (qfa.filterValue.equals(qfb.filterValue)) {
                    return JSON.parse(JSON.stringify(qfa));
                }
                var cf = {
                    boperator: 'Or', filters: [qfa, qfb]
                }
                return cf;
            }
        }
        var cf = {
            boperator: 'And', filters: [qfa, qfb]
        }
        return cf;
    }
    var af;
    var cf;
    if (qfa.operator && qfb.boperator) {
        af = qfa;
        cf = qfb;
    }
    if (qfa.boperator && qfb.operator) {
        af = qfb;
        cf = qfa;
    }
    if (af != null) {
        // Reduce the filter if there is a dupe
        let sameAttributeAndEquals = cf.boperator === 'Or';
        let lastAttribute = null;
        if (sameAttributeAndEquals) {
            for (let i = 0; i < cf.filters.length; i++) {
                let qf = cf.filters[i];
                if (qf.operator) {
                    let qaf = af;
                    if (lastAttribute === null) lastAttribute = qaf.attributeName; else if (lastAttribute !== qaf.attributeName) {
                        sameAttributeAndEquals = false;
                        break;
                    }
                    if (qaf.operator !== 'Equals') {
                        sameAttributeAndEquals = false;
                        break;
                    }
                } else {
                    sameAttributeAndEquals = false;
                    break;
                }
            }
        }
        for (let i = 0; i < cf.filters.length; i++) {
            let qf = cf.filters[i];
            if (areEquals(qf, af)) {
                if (sameAttributeAndEquals) {
                    /*
                     * If this is an or list of items, then just reduce to this one element
                     */
                    return af;
                }
                // Otherwise just dedupe
                return JSON.parse(JSON.stringify(cf));
            }
        }
        /*
         * If compound filter is an or with all selects on the same attribute, then just
         * add to the OR
         */
        if (cf.boperator === 'Or') {
            let override = false;
            for (let i = 0; i < cf.filters.length; i++) {
                let qf = cf.filters[i];
                if (qf.operator) {
                    let af2 = qf;
                    if (af2.attributeName !== af.attributeName || !isSelect(af2.operator)) {
                        /*
                         * If not, then need to do an AND between them
                         */
                        var cf = {
                            boperator: 'And', filters: [af, cf]
                        }
                        return cf;
                    } else if (areEquals(af, af2)) {
                        override = true;
                    }
                }
            }
            if (override) {
                return JSON.parse(JSON.stringify(af));
            }
            cf = JSON.parse(JSON.stringify(cf));
            cf.filters.add(af);
            return cf;
        }
        if (cf.boperator === 'And') {
            cf = JSON.parse(JSON.stringify(cf));
            cf.filters.add(af);
            return cf;
        }
    } else {
        if (areEquals(qfa, qfb)) {
            return JSON.parse(JSON.stringify(qfa));
        }
        var cf = {
            boperator: 'And', filters: [qfa, qfb]
        }
        return cf;
    }
    return null;
}