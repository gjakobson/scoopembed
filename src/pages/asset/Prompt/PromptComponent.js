import React, {useCallback, useEffect, useState} from "react";
import {Box, Chip, MenuItem, Typography} from "@mui/material";
import styles from './PromptComponent.module.css';
import Check from "../../../../public/icons/Check.svg?url";
import Selector from "@/components/Selector/Selector";
import {NumericRange} from "@/components/NumericRange/NumericRange";
import {ScoopDatePicker} from "@/components/ScoopDatePicker/ScoopDatePicker";
import {useApi} from "@/pages/api/api";
import {debounce} from "lodash";
import Image from "next/image";

const getTheme = (workspaceMetadata, promptProps ) => {
    let th = undefined
    if (workspaceMetadata?.themes) {
        workspaceMetadata.themes.forEach(t => {
            if (t.themeID === promptProps.theme) th = t
        })
    }
    return th
}

const PromptComponent = ({promptProps = {}, workspaceMetadata, token, onPromptChange, id}) => {

    const { postData } = useApi(token);
    const [categoryValues, setCategoryValues] = useState([]);
    const [categoryValuesLoading, setCategoryValuesLoading] = useState(false);
    const [singleSelectValue, setSingleSelectValue] = useState('');
    const [multipleSelectValue, setMultipleSelectValue] = useState([]);
    const [dateValue, setDateValue] = useState(null);
    const [numericRange, setNumericRange] = useState(null);
    const theme = getTheme(workspaceMetadata, promptProps);
    const selectDebounce = useCallback(debounce((value) => {
        const newPrompt = {...promptProps}
        newPrompt.value = value
        if (promptProps.type === 'multi-select') {
            newPrompt.prompt.filterValue.values = value.length === categoryValues.length ? ['All'] : value
        } else {
            newPrompt.prompt.filterValue.values[0] = value
        }
        onPromptChange(id, newPrompt)
    }, 1000), [promptProps]);

    useEffect(() => {
        if (promptProps) {
            switch (promptProps.type) {
                case 'single-select':
                    setSingleSelectValue(promptProps.value || '')
                    break
                case 'multi-select':
                    setMultipleSelectValue(promptProps.value || [])
                    break
                case 'single-date':
                    setDateValue(promptProps.value ? new Date(promptProps.value) : null)
                    break
                case 'date-range':
                    setDateValue(promptProps.value ? [new Date(promptProps.value[0]), new Date(promptProps.value[1])] : null)
                    break
                case 'numeric-range':
                    setNumericRange(promptProps.value || null)
                    break
            }
            getCategoryValues(promptProps.dataSourceId, promptProps.worksheetId, promptProps.rangeName, promptProps.fieldName)
        }
    }, []);

    const getCategoryValues = (tableID, worksheetID, rangeName, columnName, likeValue) => {
        setCategoryValuesLoading(true)
        const action = {
            "action": "getCategoryValues",
            "columnName": columnName,
            "like": likeValue
        };
        if (tableID) {
            action.reportSeriesTableID = tableID;
        } else if (worksheetID) {
            action.worksheetID = worksheetID;
            action.rangeName = rangeName;
        }
        postData(action)
            .then(r => {
                setCategoryValuesLoading(false)
                setCategoryValues(r.values)
            })
            .catch(() => {
                setCategoryValuesLoading(false)
                setCategoryValues([])
            })
    }

    const renderMultipleValues = (values) => {
        return values.map(value =>
            <Chip
                key={value}
                label={value}
                onMouseDown={(e) => {
                    if (['svg', 'path'].includes(e.target.tagName)) e.stopPropagation()
                }}
                onDelete={() => {
                    let newValues = [...multipleSelectValue]
                    newValues.splice(newValues[newValues.indexOf(value)], 1)
                    setMultipleSelectValue(newValues)
                    selectDebounce(newValues)
                }}
                sx={{maxWidth: 150}}
            />
        )
    }

    const handleDateChange = (value) => {
        setDateValue(value)
        const newPrompt = {...promptProps}
        if (newPrompt.type === 'date-range') {
            newPrompt.value = [value[0].toString(), value[1].toString()]
            newPrompt.prompt[0].filterValue.values[0] = value[0].toISOString().split('T')[0]
            newPrompt.prompt[1].filterValue.values[0] = value[1].toISOString().split('T')[0]
        } else {
            newPrompt.value = value.toString()
            newPrompt.prompt.filterValue.values[0] = value.toISOString().split('T')[0]
        }
        onPromptChange(id, newPrompt)
    }

    const handleNumericChange = (value) => {
        setNumericRange(value)
        const newPrompt = {...promptProps}
        newPrompt.value = value
        newPrompt.prompt[0].filterValue.values[0] = value[0]
        newPrompt.prompt[1].filterValue.values[0] = value[1]
        onPromptChange(id, newPrompt)
    }

    const handleSelectChange = (value) => {
        setSingleSelectValue(value)
        selectDebounce(value)
    }

    const handleMultipleSelect = (e) => {
        if (e.target.value.includes('Select all')) {
            setMultipleSelectValue([...categoryValues])
            selectDebounce([...categoryValues])
        } else if (e.target.value.includes('Clear all')) {
            setMultipleSelectValue([])
            selectDebounce([])
        } else {
            setMultipleSelectValue(e.target.value)
            selectDebounce(e.target.value)
        }
    }

    const getPromptContent = () => {
        if ((promptProps.dataSourceId || (promptProps.worksheetId && promptProps.rangeName)) && promptProps.fieldName && promptProps.type) {
            switch (promptProps.type) {
                case 'single-select':
                    return (
                        <Box sx={{width: '100%'}}>
                            {
                                categoryValues.length > 0 &&
                                <Selector
                                    value={singleSelectValue || ''}
                                    renderValue={(v) => v}
                                    sx={{
                                        height: 38,
                                        fontFamily: 'Inter, sans-serif',
                                        backgroundColor: theme?.colorScheme?.darkTheme ? 'white' : '',
                                        fontSize: '14px'
                                    }}
                                    MenuProps={{sx: {maxHeight: 350}, container: document.getElementById('slide-container')}}
                                >
                                    {
                                        ['All', ...categoryValues].map(value =>
                                            <MenuItem
                                                key={value}
                                                onClick={() => handleSelectChange(value)}
                                                sx={{justifyContent: 'space-between'}}
                                                value={value}
                                            >
                                                <Typography className={'inter'} sx={{fontSize: '14px', width: 300, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                    {value}
                                                </Typography>
                                                {singleSelectValue === value && <Image src={Check} height={18} width={18} alt={'check'} />}
                                            </MenuItem>
                                        )
                                    }
                                </Selector>
                            }
                        </Box>
                    )
                case 'multi-select':
                    return (
                        <Box sx={{width: '100%'}}>
                            <Selector
                                value={multipleSelectValue || ''}
                                onChange={handleMultipleSelect}
                                renderValue={renderMultipleValues}
                                labelClassName={'selector-label-bold'}
                                sx={{
                                    height: 38,
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    backgroundColor: theme?.colorScheme?.darkTheme ? 'white' : '',
                                    '& .MuiSelect-select': {padding: '2px !important', gap: '2px'},
                                    '& .MuiFormControl-root': {marginTop: '0px !important'},
                                }}
                                MenuProps={{sx: {maxHeight: 350}, container: document.getElementById('slide-container')}}
                                multiple
                            >
                                {
                                    [multipleSelectValue.length === categoryValues.length ? 'Clear all' : 'Select all', ...categoryValues].map(value => {
                                        const selected = multipleSelectValue.includes(value)
                                        return (
                                            <MenuItem key={value} value={value} sx={{justifyContent: 'space-between'}}>
                                                <Typography className={'inter'} sx={{fontSize: '14px', width: 300, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                    {value}
                                                </Typography>
                                                {selected && <Image src={Check} height={18} width={18} alt={'check'} />}
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Selector>
                        </Box>
                    )
                case 'single-date':
                case 'date-range':
                    return (
                        <ScoopDatePicker
                            value={dateValue}
                            onChange={handleDateChange}
                            range={promptProps.type === 'date-range'}
                            theme={theme}
                        />
                    )
                case 'numeric-range':
                    return (
                        <NumericRange
                            value={numericRange}
                            onChange={handleNumericChange}
                            max={parseInt(categoryValues[categoryValues.length - 1])}
                            min={categoryValues[0] !== null ? parseInt( categoryValues[0]) : 0}
                            theme={theme}
                        />
                    )
            }
        }
    }

    return (
        <Box className={styles.promptContainer}>
            <Typography sx={{fontSize: '14px', fontWeight: 600, fontFamily: 'Inter'}}>
                {promptProps?.label || 'Untitled prompt'}
            </Typography>
            {getPromptContent()}
        </Box>
    )
}

export default PromptComponent;
