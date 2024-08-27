import {CHART_PREFERENCES_DEFAULT_VALUES} from "@/utils/styleConsts";

export const SORTING = {
    ASC: 'ascending',
    DESC: 'descending',
    NAT: 'natural',
}

export const getDefaultTheme = (darkTheme) => {
    const themeString = JSON.stringify({...CHART_PREFERENCES_DEFAULT_VALUES})
    if (darkTheme) {
        return themeString.replaceAll('#6E7079', '#FFFFFF')
    }
    return themeString
}

export const isLightColor = (color) => {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substring(0, 0 + 2), 16);
    const c_g = parseInt(hex.substring(2, 2 + 2), 16);
    const c_b = parseInt(hex.substring(4, 4 + 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 155
}