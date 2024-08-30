import { Button as MuiButton } from "@mui/material";
import React from "react";
import styles from './Button.module.css';

const Button = ({ onClick, text, className, disabled, children, purple, grey, ...props }) => {
    return (
        <MuiButton
            onClick={onClick}
            disabled={disabled}
            className={`${styles.primaryButton} ${purple ? styles.buttonPurple : ''} ${grey ? styles.buttonGrey : ''} ${disabled && styles.buttonDisabled} ${className}`}
            {...props}>
            {text || children}
        </MuiButton>
    );
}

export default Button;
