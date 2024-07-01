import { Button as MuiButton } from "@mui/material";
import React from "react";
import styles from './Button.module.css';

const Button = ({ onClick, text, className, disabled, children, ...props }) => {
    return (
        <MuiButton
            onClick={onClick}
            disabled={disabled}
            className={`${styles.primaryButton} ${className} ${disabled && styles.buttonDisabled}`}
            {...props}>
            {text || children}
        </MuiButton>
    );
}

export default Button;
