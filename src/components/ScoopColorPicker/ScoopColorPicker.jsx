import React, {useEffect, useRef, useState} from "react";
import styles from './ScoopColorPicker.module.css';
import {Box, IconButton, Popover, Tooltip, Typography} from "@mui/material";
import Sketch from "@uiw/react-color-sketch";

const presetColors= [
    '#00000000',
    '#D0021B',
    '#F5A623',
    '#F8E71C',
    '#8B572A',
    '#7ED321',
    '#417505',
    '#BD10E0',
    '#9013FE',
    '#4A90E2',
    '#50E3C2',
    '#B8E986',
    '#000000',
    '#4A4A4A',
    '#9B9B9B',
    '#FFFFFF'
];

// origin can be top or bottom
export const ScoopColorPicker = ({
                                     width= 20,
                                     height= 20,
                                     value,
                                     origin,
                                     onChange,
                                     tooltip,
                                     showLabel
}) => {

    const anchor = useRef();
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState(value || '#fff');

    useEffect(() => {
        setColor(value || '#fff')
    }, [value])

    const handleClose = () => {
        onChange(color)
        setOpen(false)
    }

    const calculateLuminanceFromHex = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        }
        else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        else if (hex.length === 9) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const luminance = calculateLuminanceFromHex(color);

    const showBorder = luminance > 0.9 || luminance === 0;
    const isTransparent = color === '#00000000';

    const getAnchorProps = () => {
        switch (origin) {
            case 'top':
                return {
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                    transformOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                    }
                }
            case 'bottom':
                return {
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    }
                }
            case 'left':
                return {
                    anchorOrigin: {
                        vertical: 'center',
                        horizontal: 'left',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                }
            case 'right':
                return {
                    anchorOrigin: {
                        vertical: 'center',
                        horizontal: 'right',
                    },
                    transformOrigin: {
                        vertical: 'center',
                        horizontal: 'left',
                    }
                }
        }
    }

    return (
        <>
            <Tooltip title={'Change background color'} disableHoverListener={!tooltip}>
                <Box sx={{display: 'flex', gap: '2px', alignItems: 'center'}}>
                    <IconButton sx={{
                        '&.MuiButtonBase-root': {padding: '5px'},
                        '&:hover': {
                            borderRadius: '3px',
                            backgroundColor: '#F5F5F5'
                        }
                    }}
                        onClick={() => setOpen(true)} ref={anchor}>
                        <Box className={`${isTransparent ? styles.transparentBox : !showBorder && styles.removeBorder} ${styles.colorPickerBox}`}
                             sx={{width: width, height: height, backgroundColor: color}}
                        />
                    </IconButton>
                    {
                        showLabel &&
                        <Typography sx={{fontFamily: 'Inter', fontSize: '14px', color: '#412747'}}>
                            {color === '#00000000' ? 'transparent' : color}
                        </Typography>
                    }
                </Box>
            </Tooltip>
            <Popover
                open={open}
                onClose={handleClose}
                anchorEl={anchor.current}
                id={'color-picker-popover'}
                {...getAnchorProps()}
            >
                <div className={styles.colorPickerContainer}>
                    <Sketch
                        presetColors={presetColors}
                        color={color}
                        onChange={(value) => setColor(value.hexa)}
                    />
                </div>
            </Popover>
        </>
    )
}
