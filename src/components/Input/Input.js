import { FormControl, TextField } from "@mui/material";
import React from "react";
import styles from './Input.module.css';

const Input = ({className,label, padding, onBlur, disableMargin, ...props})=>{
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) onBlur();
    };

    return(
        <FormControl
            sx={ disableMargin && { '&.MuiFormControl-root': { marginTop: '0px !important' } }}
            className={'input-container'}
        >
            <label className={'input-label'}>{label}</label>
            <TextField
                {...props}
                className={`input ${className}  ${isFocused ? 'purple-border-input' : ''}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                sx={{
                    width: '100%',
                    '& .MuiInputBase-input': {
                        padding: padding ? padding : '4px'
                    },
                    '&.MuiFormControl-root': { marginTop: disableMargin && '0px !important' },
                }}
            />

        </FormControl>
    )
}
export default Input;