export const CONFIG_OPTIONS = {
    MAIN: 'main',
    COLORS: 'colors',
    BORDERS: 'borders',
    TITLE: 'title',
    LEGEND: 'legend',
    SPLIT_LINES: 'split_lines',
    TOOLTIP: 'tooltip',
    X_AXIS: 'x_axis',
    Y_AXIS: 'y_axis',
    THEMES: 'themes',
    MARGINS: 'margins',
    BAR: 'bar',
    LINE: 'line',
    AREA: 'area',
    WATERFALL: 'waterfall',
    PIE: 'pie',
    DONUT: 'donut',
    PICTORIAL: 'pictorialBar',
    GAUGE: 'gauge',
    RADIAL: 'radialBar',
    TABLE_BODY: 'tableBody',
    TABLE_HEADER: 'tableHeader',
    KPI_TITLE: 'kpiTitle',
    KPI_VALUE: 'kpiValue',
    KPI_COMPARE: 'kpiCompare',
    KPI_BODY: 'kpiBody',
    LABEL: 'label',
}

export const CONFIG_BUTTONS = [
    { label: 'Bar', key: CONFIG_OPTIONS.BAR },
    { label: 'Line', key: CONFIG_OPTIONS.LINE },
    { label: 'Area', key: CONFIG_OPTIONS.AREA },
    { label: 'Waterfall', key: CONFIG_OPTIONS.WATERFALL },
    { label: 'Pie', key: CONFIG_OPTIONS.PIE },
    { label: 'Donut', key: CONFIG_OPTIONS.DONUT },
    { label: 'Pictorial', key: CONFIG_OPTIONS.PICTORIAL },
    { label: 'Gauge', key: CONFIG_OPTIONS.GAUGE },
    { label: 'Radial', key: CONFIG_OPTIONS.RADIAL },
    { label: 'Color palette', key: CONFIG_OPTIONS.COLORS },
    { label: 'Margins', key: CONFIG_OPTIONS.MARGINS },
    { label: 'Title', key: CONFIG_OPTIONS.TITLE },
    { label: 'Legend', key: CONFIG_OPTIONS.LEGEND },
    { label: 'Grid lines', key: CONFIG_OPTIONS.SPLIT_LINES },
    { label: 'Tooltip', key: CONFIG_OPTIONS.TOOLTIP },
    { label: 'X Axis', key: CONFIG_OPTIONS.X_AXIS },
    { label: 'Y Axis', key: CONFIG_OPTIONS.Y_AXIS },
    { label: 'Header', key: CONFIG_OPTIONS.TABLE_HEADER },
    { label: 'Body', key: CONFIG_OPTIONS.TABLE_BODY },
    { label: 'Body', key: CONFIG_OPTIONS.KPI_BODY },
    { label: 'Title', key: CONFIG_OPTIONS.KPI_TITLE },
    { label: 'Value', key: CONFIG_OPTIONS.KPI_VALUE },
    { label: 'Compare value', key: CONFIG_OPTIONS.KPI_COMPARE },
]

export const FONT_FAMILIES = [
    'Source Sans Pro',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Oswald',
    'Raleway',
]

export const TEXT_ALIGN = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
]

export const FONT_WEIGHTS = [
    { label: 'Light', value: 300 },
    { label: 'Regular', value: 400 },
    { label: 'Medium', value: 500 },
    { label: 'Bold', value: 700 },
    { label: 'Bolder', value: 900 },
]

export const LINE_STYLES = [
    { label: 'Solid', value: 'solid' },
    { label: 'Dotted', value: 'dotted' },
    { label: 'Dashed', value: 'dashed' },
]

export const SYMBOLS = [
    { label: 'Circle', value: 'circle' },
    { label: 'Rectangle', value: 'rect' },
    { label: 'Round Rectangle', value: 'roundRect' },
    { label: 'Triangle', value: 'triangle' },
    { label: 'Diamond', value: 'diamond' },
    { label: 'Pin', value: 'pin' },
    { label: 'Arrow', value: 'arrow' },
    { label: 'None', value: 'none' },
]

export const MAX_LEGENDS = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: 'All', value: 'all' },
]

export const H_ALIGNMENT = [
    { label: 'Center', value: 'center' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
]

export const V_ALIGNMENT = [
    { label: 'Top', value: 'top' },
    { label: 'Middle', value: 'middle' },
    { label: 'Bottom', value: 'bottom' },
]

export const SCOOP_LEGEND_POSITION = [
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
]

export const PIE_ORIENTATIONS = [
    { label: 'Full', value: 'full' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
]

export const PICTORIAL_POSITIONS = [
    { label: 'Start', value: 'start' },
    { label: 'Center', value: 'center' },
    { label: 'End', value: 'end' },
]

export const EMPHASIS_OPTIONS = [
    { label: 'Default', value: 'none' },
    { label: 'Series', value: 'series' },
    { label: 'Self', value: 'self' },
]

export const LABEL_DEFAULT_VALUES = {
    show: false,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS[2].value,
    fontFamily: FONT_FAMILIES[0],
    color: '#6E7079',
    rotate: 0,
    align: H_ALIGNMENT[1].value,
    verticalAlign: V_ALIGNMENT[1].value,
}

export const PIE_DEFAULT_VALUES = {
    radius: ['0%', '60%'],
    padAngle: 0,
    roseType: '',
    emphasis: {
        scale: true,
    },
    label: {
        color: '#6E7079',
        fontSize: 12,
        fontFamily: FONT_FAMILIES[0],
    },
    startAngle: 0,
    endAngle: 360,
    itemStyle: {
        borderRadius: 0,
    },
    position: 'outside',
}

export const DONUT_DEFAULT_VALUES = {
    ...PIE_DEFAULT_VALUES,
    radius: ['30%', '60%'],
}

export const AXIS_TEXT_DEFAULT_VALUES = {
    fontFamily: FONT_FAMILIES[0],
    fontWeight: FONT_WEIGHTS[1].value,
    fontSize: 14,
    color: '#6E7079',
    rotate: 0,
    maxCharacters: 20,
}

export const LEGEND_DEFAULT_VALUES = {
    left: 'center',
    top: 'bottom',
    orient: 'horizontal',
    backgroundColor: 'transparent',
    maxLegends: 10,
    textStyle: {
        maxCharacters: 25,
        fontFamily: FONT_FAMILIES[0],
        fontWeight: FONT_WEIGHTS[2].value,
        fontSize: 12,
        color: '#6E7079',
    },
    borderColor: '#ccc',
    borderWidth: 0,
    show: true,
    icon: SYMBOLS[0].value,
    itemSize: 12,
    scoopPosition: 'bottom',
}

export const MARGIN_DEFAULT_VALUES = {
    left: '10%',
    right: '10%',
    top: '10%',
    bottom: '10%',
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            crossStyle: {
                color: '#999',
                width: 1,
                type: 'dashed',
            },
        },
        confine: true,
    },
}

export const TITLE_DEFAULT_VALUES = {
    left: '50%',
    top: '0%',
    backgroundColor: 'transparent',
    textAlign: 'center',
    textStyle: {
        fontFamily: FONT_FAMILIES[0],
        fontWeight: FONT_WEIGHTS[2].value,
        fontSize: 36,
        color: '#6E7079',
    },
    show: true,
}

export const AXIS_DEFAULT_VALUES = {
    show: true,
    splitLine: {
        show: false,
        lineStyle: {
            color: '#E0E6F1',
            width: 1,
            type: 'dashed',
        },
    },
    min: undefined,
    max: undefined,
}

export const TOOLTIP_DEFAULT_VALUES = {
    borderColor: 'transparent',
    borderWidth: 1,
    backgroundColor: '#FFF',
    textStyle: {
        fontFamily: FONT_FAMILIES[0],
        fontWeight: FONT_WEIGHTS[2].value,
        fontSize: 12,
        color: '#000000',
    },
}

export const BAR_DEFAULT_VALUES = {
    barWidth: '70%',
    barGap: '10%',
    barCategoryGap: '40%',
    emphasis: {
        disabled: false,
        focus: 'series',
        blurScope: 'coordinateSystem',
    },
    itemStyle: {
        borderRadius: [5, 5, 0, 0],
    },
    position: 'outside',
}

export const LINE_DEFAULT_VALUES = {
    smooth: false,
    symbol: SYMBOLS[0].value,
    symbolSize: 4,
    lineStyle: {
        width: 2,
    },
    position: 'left',
}

export const WATERFALL_DEFAULT_VALUES = {
    startColor: '#2B65D9',
    endColor: '#2B65D9',
    upColor: '#009262',
    downColor: '#EB382A',
}

export const PICTORIAL_DEFAULT_OBJECT = {
    symbol: SYMBOLS[0].value,
    symbolPosition: PICTORIAL_POSITIONS[0].value,
    symbolRepeat: false,
    symbolClip: true,
    symbolRotate: 0,
    symbolSize: ['100%', '100%'],
}

export const PICTORIAL_DEFAULT_VALUES = {
    data: [[]],
    barGap: '10%',
    barCategoryGap: '40%',
    showAsBar: false,
    applyAll: false,
}

export const GAUGE_DEFAULT_VALUES = {
    data: [
        {
            value: undefined,
            name: undefined,
        },
    ],
    min: 0,
    max: 100,
    splitNumber: 10,
    progress: {
        show: true,
        roundCap: false,
        itemStyle: {
            color: '#2B65D9',
        },
    },
    emphasis: {
        disabled: false,
    },
    pointer: {
        show: true,
        itemStyle: {
            color: '#2B65D9',
        },
    },
    detail: {
        show: true,
        fontSize: 24,
        fontWeight: FONT_WEIGHTS[2].value,
        fontFamily: FONT_FAMILIES[0],
        color: '#2B65D9',
        offsetCenter: ['0%', '50%'],
    },
    startAngle: 225,
    endAngle: -45,
    axisLine: {
        lineStyle: {
            width: 10,
            color: [[1, '#E6EBF8']],
        },
    },
    axisTick: {
        splitNumber: 5,
        distance: 10,
        lineStyle: {
            color: '#E6EBF8',
            width: 1,
        },
    },
    axisLabel: {
        show: true,
        fontSize: 14,
        fontFamily: 'Source Sans Pro',
        color: '#6E7079',
    },
    splitLine: {
        show: true,
        length: 20,
        lineStyle: {
            color: '#E6EBF8',
            width: 1,
        },
    },
    title: {
        show: true,
        fontSize: 24,
        fontWeight: FONT_WEIGHTS[2].value,
        fontFamily: FONT_FAMILIES[0],
        color: '#2B65D9',
        offsetCenter: ['0%', '75%'],
    },
}

export const RADIAL_DEFAULT_VALUES = {
    polar: {
        center: ['50%', '50%'],
        radius: ['0%', '75%'],
    },
    angleAxis: {
        startAngle: 75,
        type: 'category',
    },
    radiusAxis: {
        axisLabel: {
            show: true,
            color: '#6E7079',
            fontSize: 14,
            fontFamily: 'Source Sans Pro',
        },
        axisLine: {
            show: true,
            lineStyle: {
                color: '#E0E6F1',
                type: 'dashed',
            },
        },
        splitLine: {
            show: true,
            lineStyle: {
                color: '#E0E6F1',
                type: 'dashed',
            },
        },
    },
    emphasis: {
        disabled: false,
        focus: EMPHASIS_OPTIONS[0].value,
    },
    itemStyle: {
        borderRadius: [0, 0],
    },
    label: {
        show: true,
        color: '#6E7079',
        fontSize: 6,
        fontFamily: 'Source Sans Pro',
        rotate: 0,
    },
    stack: true,
    barWidth: '50%',
}

export const TABLE_DEFAULT_VALUES = {
    fontColor: '#412747',
    fontSize: 14,
    fontFamily: 'Source Sans Pro',
    fontWeight: FONT_WEIGHTS[1].value,
    headerFontColor: '#412747',
    headerFontSize: 14,
    headerFontFamily: 'Source Sans Pro',
    headerFontWeight: FONT_WEIGHTS[2].value,
    backgroundColor: '#F0F0F0',
    headerBackgroundColor: '#E6E4E6',
    hideBorder: false,
}

export const KPI_DEFAULT_VALUES = {
    title: {
        fontColor: '#000000FF',
        fontSize: 14,
        fontFamily: FONT_FAMILIES[1],
        fontWeight: FONT_WEIGHTS[1].value,
    },
    value: {
        fontColor: '#000000FF',
        fontSize: 60,
        fontFamily: FONT_FAMILIES[1],
        fontWeight: FONT_WEIGHTS[3].value,
    },
    compare: {
        fontColor: '#000000FF',
        fontSize: 14,
        fontFamily: FONT_FAMILIES[1],
        fontWeight: FONT_WEIGHTS[1].value,
        positiveColor: '#00923AFF',
        negativeColor: '#EB382AFF',
    },
    body: {
        borderRadius: 10,
        padding: 20,
    },
}

export const CHART_PREFERENCES_DEFAULT_VALUES = {
    title: TITLE_DEFAULT_VALUES,
    legend: LEGEND_DEFAULT_VALUES,
    tooltip: TOOLTIP_DEFAULT_VALUES,
    grid: MARGIN_DEFAULT_VALUES,
    xAxis: {
        ...AXIS_DEFAULT_VALUES,
        splitLine: {
            ...AXIS_DEFAULT_VALUES.splitLine,
            show: false,
        },
        axisLabel: AXIS_TEXT_DEFAULT_VALUES,
        nameTextStyle: AXIS_TEXT_DEFAULT_VALUES,
    },
    yAxis: {
        splitLine: {
            ...AXIS_DEFAULT_VALUES.splitLine,
            show: true,
        },
        axisLabel: AXIS_TEXT_DEFAULT_VALUES,
        nameTextStyle: AXIS_TEXT_DEFAULT_VALUES,
    },
    bar: BAR_DEFAULT_VALUES,
    line: LINE_DEFAULT_VALUES,
    waterfall: WATERFALL_DEFAULT_VALUES,
    pie: PIE_DEFAULT_VALUES,
    donut: DONUT_DEFAULT_VALUES,
    pictorialBar: PICTORIAL_DEFAULT_VALUES,
    gauge: GAUGE_DEFAULT_VALUES,
    radialBar: RADIAL_DEFAULT_VALUES,
    table: TABLE_DEFAULT_VALUES,
    kpi: KPI_DEFAULT_VALUES,
    label: LABEL_DEFAULT_VALUES,
}

export const DEFAULT_CHART_PREFERENCES = {
    title: {
        left: undefined,
        top: undefined,
        backgroundColor: undefined,
        textStyle: {
            fontFamily: undefined,
            fontWeight: undefined,
            fontSize: undefined,
            color: undefined,
        },
    },
    legend: {
        show: undefined,
        left: undefined,
        top: undefined,
        orient: undefined,
        backgroundColor: undefined,
        textStyle: {
            fontFamily: undefined,
            fontWeight: undefined,
            fontSize: undefined,
            color: undefined,
            maxCharacters: undefined,
        },
        borderColor: undefined,
        borderWidth: undefined,
        icon: undefined,
        itemSize: undefined,
        scoopPosition: undefined,
    },
    tooltip: {
        borderColor: undefined,
        borderWidth: undefined,
        backgroundColor: undefined,
        textStyle: {
            fontFamily: undefined,
            fontWeight: undefined,
            fontSize: undefined,
            color: undefined,
        },
    },
    grid: {
        left: undefined,
        right: undefined,
        top: undefined,
        bottom: undefined,
    },
    xAxis: [
        {
            show: undefined,
            splitLine: {
                show: undefined,
                lineStyle: {
                    color: undefined,
                    width: undefined,
                    type: undefined,
                },
            },
            axisLabel: {
                fontFamily: undefined,
                fontWeight: undefined,
                fontSize: undefined,
                color: undefined,
                rotate: undefined,
                maxCharacters: undefined,
            },
            nameTextStyle: {
                fontFamily: undefined,
                fontWeight: undefined,
                fontSize: undefined,
                color: undefined,
                rotate: undefined,
            },
        },
    ],
    yAxis: [
        {
            show: undefined,
            splitLine: {
                show: undefined,
                lineStyle: {
                    color: undefined,
                    width: undefined,
                    type: undefined,
                },
            },
            axisLabel: {
                fontFamily: undefined,
                fontWeight: undefined,
                fontSize: undefined,
                color: undefined,
                rotate: undefined,
                maxCharacters: undefined,
            },
            nameTextStyle: {
                fontFamily: undefined,
                fontWeight: undefined,
                fontSize: undefined,
                color: undefined,
                rotate: undefined,
            },
        },
    ],
    bar: {
        barWidth: undefined,
        barGap: undefined,
        barCategoryGap: undefined,
        emphasis: {
            disabled: undefined,
            focus: undefined,
            blurScope: undefined,
        },
        itemStyle: {
            borderRadius: undefined,
        },
    },
    line: {
        smooth: undefined,
        symbol: undefined,
        symbolSize: undefined,
        lineStyle: {
            width: undefined,
        },
    },
    waterfall: {
        startColor: undefined,
        endColor: undefined,
        upColor: undefined,
        downColor: undefined,
    },
    pie: {
        radius: undefined,
        padAngle: undefined,
        roseType: undefined,
        emphasis: {
            scale: undefined,
        },
        label: {
            color: undefined,
            fontSize: undefined,
            fontFamily: undefined,
        },
        startAngle: undefined,
        endAngle: undefined,
        itemStyle: {
            borderRadius: undefined,
        },
    },
    donut: {
        radius: undefined,
        padAngle: undefined,
        roseType: undefined,
        emphasis: {
            scale: undefined,
        },
        label: {
            color: undefined,
            fontSize: undefined,
            fontFamily: undefined,
        },
        startAngle: undefined,
        endAngle: undefined,
        itemStyle: {
            borderRadius: undefined,
        },
    },
    pictorialBar: {
        data: [],
        barGap: undefined,
        barCategoryGap: undefined,
        showAsBar: undefined,
        applyAll: undefined,
    },
    gauge: {
        data: [],
        min: undefined,
        max: undefined,
        splitNumber: undefined,
        progress: {
            show: undefined,
            roundCap: undefined,
            itemStyle: {
                color: undefined,
            },
        },
        emphasis: {
            disabled: undefined,
        },
        pointer: {
            show: undefined,
            itemStyle: {
                color: undefined,
            },
        },
        detail: {
            show: undefined,
            fontSize: undefined,
            fontWeight: undefined,
            fontFamily: undefined,
            color: undefined,
            offsetCenter: undefined,
        },
        startAngle: undefined,
        endAngle: undefined,
        axisLine: {
            lineStyle: {
                width: undefined,
                color: undefined,
            },
        },
        axisTick: {
            splitNumber: undefined,
            distance: undefined,
            lineStyle: {
                color: undefined,
                width: undefined,
            },
        },
        axisLabel: {
            show: undefined,
            fontSize: undefined,
            fontFamily: undefined,
            color: undefined,
        },
        splitLine: {
            show: undefined,
            length: undefined,
            lineStyle: {
                color: undefined,
                width: undefined,
            },
        },
        title: {
            show: undefined,
            fontSize: undefined,
            fontWeight: undefined,
            fontFamily: undefined,
            color: undefined,
            offsetCenter: undefined,
        },
    },
    radialBar: {
        polar: {
            center: undefined,
            radius: undefined,
        },
        angleAxis: {
            startAngle: undefined,
            type: undefined,
        },
        radiusAxis: {
            axisLabel: {
                show: undefined,
                color: undefined,
                fontSize: undefined,
                fontFamily: undefined,
            },
            axisLine: {
                show: undefined,
                lineStyle: {
                    color: undefined,
                    type: undefined,
                },
            },
            splitLine: {
                show: undefined,
                lineStyle: {
                    color: undefined,
                    type: undefined,
                },
            },
        },
        emphasis: {
            disabled: undefined,
            focus: undefined,
        },
        itemStyle: {
            borderRadius: undefined,
        },
        label: {
            show: undefined,
            color: undefined,
            fontSize: undefined,
            fontFamily: undefined,
            rotate: undefined,
        },
        stack: undefined,
        barWidth: undefined,
    },
    table: {
        fontColor: undefined,
        fontSize: undefined,
        fontFamily: undefined,
        fontWeight: undefined,
        headerFontColor: undefined,
        headerFontSize: undefined,
        headerFontFamily: undefined,
        headerFontWeight: undefined,
        backgroundColor: undefined,
        headerBackgroundColor: undefined,
        hideBorder: undefined,
    },
    kpi: {
        title: {
            fontColor: undefined,
            fontSize: undefined,
            fontFamily: undefined,
            fontWeight: undefined,
        },
        value: {
            fontColor: undefined,
            fontSize: undefined,
            fontFamily: undefined,
            fontWeight: undefined,
        },
        compare: {
            fontColor: undefined,
            fontSize: undefined,
            fontFamily: undefined,
            fontWeight: undefined,
            positiveColor: undefined,
            negativeColor: undefined,
        },
        body: {
            borderRadius: undefined,
            padding: undefined,
        },
    },
    label: {
        show: undefined,
        fontSize: undefined,
        fontWeight: undefined,
        fontFamily: undefined,
        color: undefined,
        rotate: undefined,
        align: undefined,
        verticalAlign: undefined,
    },
}

export const simpleOption = {
    animation: false,
    xAxis: {
        data: ['a'],
        show: false,
    },
    yAxis: {
        show: false,
    },
    series: [
        {
            type: 'bar',
            data: [10],
            silent: true,
            itemStyle: {
                borderRadius: 5,
            },
        },
        {
            type: 'bar',
            data: [30],
            silent: true,
            itemStyle: {
                borderRadius: 5,
            },
        },
        {
            type: 'bar',
            data: [40],
            silent: true,
            itemStyle: {
                borderRadius: 5,
            },
        },
        {
            type: 'bar',
            data: [50],
            silent: true,
            itemStyle: {
                borderRadius: 5,
            },
        },
        {
            type: 'bar',
            data: [20],
            silent: true,
            itemStyle: {
                borderRadius: 5,
            },
        },
    ],
    grid: {
        left: 0,
        right: 0,
        top: 20,
        bottom: 20,
    },
}
