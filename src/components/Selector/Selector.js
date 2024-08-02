import React from "react";
import {FormControl, Select} from "@mui/material";
import styles from './Selector.module.css';

const Selector = ({removeMargin, value, onChange, children, label, placeholder, labelClassName, ...props}) => {

    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = () => {
        setIsFocused(true)
    }

    const handleBlur = () => {
        setIsFocused(false)
    }

    return (
        <FormControl
            id={removeMargin && "selector"}
            className={styles.selectorContainer}
            sx={{width: '100%'}}
        >
            <label className={styles.selectorLabel}>{label}</label>
            <Select
                className={`${styles.selector} ${isFocused ? styles.purpleBorderSelector : ''}`}
                labelId="workspace-select-label"
                id="workspace-select"
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...props}
            >
                {children}
            </Select>
        </FormControl>
    )
}

export default Selector;
