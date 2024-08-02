import React, {useEffect, useRef, useState} from "react";
import styles from './NumericRange.module.css';
import {Box, Popover, TextField, Typography} from "@mui/material";
import Slider from "@mui/material/Slider";
import Button from "@/components/Button/Button";

export const NumericRange = ({value, onChange, min, max, containerSx, label, popWidth, theme}) => {

    const anchor = useRef();
    const [showSlider, setShowSlider] = useState(false);
    const [innerValue, setInnerValue] = useState([0, 0])

    const getMinValue = () => {
        if (min !== null) return min
        else return 0
    }

    useEffect(() => {
        if (value) setInnerValue(value)
        else setInnerValue([getMinValue(), max])
    }, [min, max, value])

    const handleInputChange = (value, from) => {
        if (from === 'min') {
            if (value >= min) setInnerValue([value, innerValue[1]])
        }
        if (from === 'max') {
            if (value <= max) setInnerValue([innerValue[0], value])
        }
    }

    const handleApply = () => {
        onChange(innerValue)
        setShowSlider(false)
    }

    return (
        <>
            <Box className={styles.numericRangeContainer} sx={containerSx}>
                {
                    label &&
                    <Typography className={'inter'} sx={{fontWeight: 600, fontSize: '12px'}}>{label}</Typography>
                }
                <Box
                    className={styles.numericRangeInput}
                    ref={anchor}
                    onClick={() => setShowSlider(true)}
                    sx={{backgroundColor: theme?.colorScheme?.darkTheme ? 'white' : ''}}
                >
                    <Typography className={'inter'} sx={{fontSize: '14px'}}>
                        {value ? (value[0] + ' to ' + value[1]) : 'Select range'}
                    </Typography>
                </Box>
            </Box>
            <Popover
                open={showSlider}
                anchorEl={anchor.current}
                onClose={() => setShowSlider(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                container={document.getElementById('slide-container')}
            >
                <Box className={styles.numericRangePopup} sx={{width: popWidth}}>
                    <Box sx={{display: 'flex', flexDirection: 'row', gap: '24px', mb: '12px'}}>
                        <Box>
                            <label className={styles.promptLabelLabel}>Min</label>
                            <Box>
                                <TextField
                                    value={innerValue[0]}
                                    InputLabelProps={{shrink: true}}
                                    InputProps={{sx: {height: 38, fontFamily: 'Inter, sans-serif', fontSize: 14}}}
                                    inputProps={{ type: 'number'}}
                                    onChange={(e) => handleInputChange(e.target.value, 'min')}
                                />
                            </Box>
                        </Box>
                        <Box>
                            <label className={styles.promptLabelLabel}>Max</label>
                            <Box>
                                <TextField
                                    value={innerValue[1]}
                                    InputLabelProps={{shrink: true}}
                                    InputProps={{sx: {height: 38, fontFamily: 'Inter, sans-serif', fontSize: 14}}}
                                    inputProps={{type: 'number'}}
                                    onChange={(e) => handleInputChange(e.target.value, 'max')}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{width: '100%', padding: '0 12px'}}>
                        <Slider
                            value={innerValue}
                            onChange={(e, value) => setInnerValue(value)}
                            sx={{
                                '& .MuiSlider-track': {color: '#E50B54 !important'},
                                '& .MuiSlider-rail': {color: '#FCE7EE !important'},
                                '& .MuiSlider-thumb': {color: '#E50B54 !important', boxShadow: 'none !important'},
                            }}
                            min={getMinValue()}
                            max={max}
                        />
                    </Box>
                    <Box className={styles.numericRangeFooter}>
                        <Button onClick={() => setShowSlider(false)} className={styles.numericRangeButton}>Cancel</Button>
                        <Button onClick={handleApply} className={styles.numericRangeButton} purple>Apply</Button>
                    </Box>
                </Box>
            </Popover>
        </>
    )
}
