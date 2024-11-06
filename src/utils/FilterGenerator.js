// generate filters with correct AND/OR logic as JSON ready to send to the API
import _ from 'lodash'

export const FilterGenerator = (
    selectedFiltersV2,
    filterSnapshotDate,
    selectedReportSeriesTable,
    reportSeriesData
) => {
    let originalFilters = _.cloneDeep(selectedFiltersV2)
    let transformedFilters = []

    if (filterSnapshotDate) {
        const uniqueColumn = findUniqueColumn(reportSeriesData, selectedReportSeriesTable)

        const snapshotFilter = {
            attributeName: uniqueColumn,
            operator: 'In',
            filterValue: {
                setFilter: {
                    boperator: 'And',
                    filters: [
                        {
                            attributeName: 'SCOOP_TSTAMP',
                            operator: 'Equals',
                            filterValue: {
                                value: filterSnapshotDate,
                            },
                        },
                        {
                            attributeName: 'SCOOP_DKEY',
                            operator: 'Equals',
                            filterValue: {
                                value: '0',
                            },
                        },
                    ],
                },
            },
        }
        transformedFilters.push(snapshotFilter)
    }

    const filters = originalFilters?.map((filter) => {
        if (filter.selectedFilter) {
            return {
                attributeName: filter.selectedFilter,
                operator: 'Equals',
                filterValue: {
                    value: filter.filterVal,
                },
            }
        }
    })

    const groupedFilters = {}
    filters?.forEach((filter) => {
        if (filter) {
            if (groupedFilters.hasOwnProperty(filter.attributeName)) {
                groupedFilters[filter.attributeName].push(filter)
            } else {
                groupedFilters[filter.attributeName] = [filter]
            }
        }
    })

    for (let attributeName in groupedFilters) {
        if (groupedFilters.hasOwnProperty(attributeName)) {
            const filters = groupedFilters[attributeName]
            if (filters.length === 1) {
                transformedFilters.push(filters[0])
            } else {
                transformedFilters.push({
                    boperator: 'Or',
                    filters: filters,
                })
            }
        }
    }

    // if only one item in filters, remove the array
    if (transformedFilters.length === 1) {
        transformedFilters = transformedFilters[0]
    } else {
        transformedFilters = {
            boperator: 'And',
            filters: transformedFilters,
        }
    }

    //final check: if filters array is empty, return null
    if (transformedFilters.filters?.length === 0) {
        transformedFilters = null
    }

    return transformedFilters
}

// we need to find the column that's unique to a report series to use snapshots
const findUniqueColumn = (reportSeriesData, reportSeriesID) => {
    const reportSeries = reportSeriesData?.find(
        (report) => report.reportSeriesID === reportSeriesID
    )

    // Find the attribute with identifier true
    const attribute = reportSeries.attributes?.find((attr) => attr.identifier === true)

    // Extract the name of the attribute
    const attributeName = attribute?.name

    return attributeName
}
