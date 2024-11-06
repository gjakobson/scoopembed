import React from 'react'
import styles from './InsightsGridDrillCell.module.css'

const InsightsGridDrillCell = ({ onClick, value }) => {
    return (
        <span className={styles.cellValue} onClick={(e) => onClick(e, value)}>
            {value}
        </span>
    )
}

export default InsightsGridDrillCell
