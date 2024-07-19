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
    PICTORIAL: 'pictorial',
}

export const CONFIG_BUTTONS = [
    {label: 'Bar', key: CONFIG_OPTIONS.BAR, toggle: false},
    {label: 'Line', key: CONFIG_OPTIONS.LINE, toggle: false},
    {label: 'Area', key: CONFIG_OPTIONS.AREA, toggle: false},
    {label: 'Waterfall', key: CONFIG_OPTIONS.WATERFALL, toggle: false},
    {label: 'Pie', key: CONFIG_OPTIONS.PIE, toggle: false},
    {label: 'Donut', key: CONFIG_OPTIONS.DONUT, toggle: false},
    {label: 'Pictorial', key: CONFIG_OPTIONS.PICTORIAL, toggle: false},
    {label: 'Color palette', key: CONFIG_OPTIONS.COLORS, toggle: false},
    {label: 'Margins', key: CONFIG_OPTIONS.MARGINS, toggle: true},
    {label: 'Title', key: CONFIG_OPTIONS.TITLE, toggle: true},
    {label: 'Legend', key: CONFIG_OPTIONS.LEGEND, toggle: true},
    {label: 'Grid lines', key: CONFIG_OPTIONS.SPLIT_LINES, toggle: true},
    {label: 'Tooltip', key: CONFIG_OPTIONS.TOOLTIP, toggle: true},
    {label: 'X Axis', key: CONFIG_OPTIONS.X_AXIS, toggle: true},
    {label: 'Y Axis', key: CONFIG_OPTIONS.Y_AXIS, toggle: true},
]

export const FONT_FAMILIES = [
    'Source Sans Pro',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Oswald',
    'Raleway'
];

export const TEXT_ALIGN = [
    {label: 'Left', value: 'left'},
    {label: 'Center', value: 'center'},
    {label: 'Right', value: 'right'}
];

export const FONT_WEIGHTS = [
    {label: 'Light', value: 300},
    {label: 'Regular', value: 400},
    {label: 'Medium', value: 500},
    {label: 'Bold', value: 700},
    {label: 'Bolder', value: 900}
];

export const LINE_STYLES = [
    {label: 'Solid', value: 'solid'},
    {label: 'Dotted', value: 'dotted'},
    {label: 'Dashed', value: 'dashed'}
];

export const SYMBOLS = [
    {label: 'Circle', value: 'circle'},
    {label: 'Rectangle', value: 'rect'},
    {label: 'Round Rectangle', value: 'roundRect'},
    {label: 'Triangle', value: 'triangle'},
    {label: 'Diamond', value: 'diamond'},
    {label: 'Pin', value: 'pin'},
    {label: 'Arrow', value: 'arrow'},
    {label: 'None', value: 'none'}
];

export const MAX_LEGENDS = [
    {label: '5', value: 5},
    {label: '10', value: 10},
    {label: '15', value: 15},
    {label: '20', value: 20},
    {label: 'All', value: 'all'},
];

export const H_ALIGNMENT = [
    {label: 'Center', value: 'center'},
    {label: 'Left', value: 'left'},
    {label: 'Right', value: 'right'}
];

export const V_ALIGNMENT = [
    {label: 'Top', value: 'top'},
    {label: 'Middle', value: 'middle'},
    {label: 'Bottom', value: 'bottom'}
];

export const PIE_ORIENTATIONS = [
    {label: 'Full', value: 'full'},
    {label: 'Left', value: 'left'},
    {label: 'Right', value: 'right'},
    {label: 'Top', value: 'top'},
    {label: 'Bottom', value: 'bottom'}
];

export const PIE_DEFAULT_VALUES = {
    radius: ['0%', '60%'],
    padAngle: 0,
    roseType: '',
    emphasis: {
        scale: true,
    },
    startAngle: 0,
    endAngle: 360,
    itemStyle: {
        borderRadius: 0
    }
}

export const DONUT_DEFAULT_VALUES = {
    ...PIE_DEFAULT_VALUES,
    radius: ['30%', '60%'],
}

export const AXIS_TEXT_DEFAULT_VALUES = {
    fontFamily: FONT_FAMILIES[0],
    fontWeight: FONT_WEIGHTS[1].value,
    fontSize: 14,
    fontScaleFactor: {
        x: 14 / (window.innerWidth - 600),
        y: 14 / (window.innerHeight - 112)
    },
    color: '#6E7079',
    rotate: 0,
}

export const LEGEND_DEFAULT_VALUES = {
    left: 'center',
    top: 'bottom',
    orient: 'horizontal',
    backgroundColor: 'transparent',
    maxLegends: 10,
    textStyle: {
        fontFamily: FONT_FAMILIES[0],
        fontWeight: FONT_WEIGHTS[2].value,
        fontSize: 12,
        fontScaleFactor: {
            x: 12 / (window.innerWidth - 600),
            y: 12 / (window.innerHeight - 112)
        },
        color: '#6E7079',
    },
    borderColor: '#ccc',
    borderWidth: 0,
    show: true,
    icon: SYMBOLS[0].value,
}

export const MARGIN_DEFAULT_VALUES = {
    left: '10%',
    right: '10%',
    top: '10%',
    bottom: '10%',
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
        fontScaleFactor: {
            x: 36 / (window.innerWidth - 600),
            y: 36 / (window.innerHeight - 112)
        },
        color: '#6E7079',
    },
}

export const AXIS_DEFAULT_VALUES = {
    show: true,
    splitLine: {
        show: true,
        lineStyle: {
            color: '#E0E6F1',
            width: 1,
            type: 'dashed'
        }
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
        fontScaleFactor: {
            x: 12 / (window.innerWidth - 600),
            y: 12 / (window.innerHeight - 112)
        },
        color: '#000000'
    },
}

export const BAR_DEFAULT_VALUES = {
    barWidth: '70%',
    barGap: '10%',
    barCategoryGap: '40%',
    emphasis: {
        disabled: false,
        focus: 'series',
        blurScope: 'coordinateSystem'
    },
    itemStyle: {
        borderRadius: [5, 5, 0, 0]
    }
}

export const LINE_DEFAULT_VALUES = {
    smooth: false,
    symbol: SYMBOLS[0].value,
    symbolSize: 4,
    lineStyle: {
        width: 2
    }
}

export const WATERFALL_DEFAULT_VALUES = {
    startColor: '#2B65D9',
    endColor: '#2B65D9',
    upColor: '#009262',
    downColor: '#EB382A',
}

export const DEFAULT_CHART_PREFERENCES = {
    title: TITLE_DEFAULT_VALUES,
    legend: LEGEND_DEFAULT_VALUES,
    tooltip: TOOLTIP_DEFAULT_VALUES,
    grid: MARGIN_DEFAULT_VALUES,
    xAxis: {
        ...AXIS_DEFAULT_VALUES,
        splitLine: {
            ...AXIS_DEFAULT_VALUES.splitLine,
            show: false
        },
        axisLabel: AXIS_TEXT_DEFAULT_VALUES,
        nameTextStyle: AXIS_TEXT_DEFAULT_VALUES
    },
    yAxis: {
        ...AXIS_DEFAULT_VALUES,
        axisLabel: AXIS_TEXT_DEFAULT_VALUES,
        nameTextStyle: AXIS_TEXT_DEFAULT_VALUES
    },
    bar: BAR_DEFAULT_VALUES,
    line: LINE_DEFAULT_VALUES,
    waterfall: WATERFALL_DEFAULT_VALUES,
    pie: PIE_DEFAULT_VALUES,
    donut: DONUT_DEFAULT_VALUES
}

export const simpleOption = {
    animation: false,
    xAxis: {
        data: ['a'],
        show: false
    },
    yAxis: {
        show: false
    },
    series: [
        {
            type: 'bar',
            data: [10],
            silent: true,
            itemStyle: {
                borderRadius: 5
            }
        },
        {
            type: 'bar',
            data: [30],
            silent: true,
            itemStyle: {
                borderRadius: 5
            }
        },
        {
            type: 'bar',
            data: [40],
            silent: true,
            itemStyle: {
                borderRadius: 5
            }
        },
        {
            type: 'bar',
            data: [50],
            silent: true,
            itemStyle: {
                borderRadius: 5
            }
        },
        {
            type: 'bar',
            data: [20],
            silent: true,
            itemStyle: {
                borderRadius: 5
            }
        },
    ],
    grid: {
        left: 0,
        right: 0,
        top: 20,
        bottom: 20
    }
};
