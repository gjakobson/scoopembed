import React, {useEffect, useRef, useState} from "react";
import styles from './ScoopDatePicker.module.css';
import Calendar from "react-calendar";
import {Box, Popover, Typography} from "@mui/material";
import Button from "../Button/Button";
import CalendarBlack from '../../../public/icons/CalendarBlankBlack.svg?url';
import Image from "next/image";

const shortDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const rangeOptions = [
    'Last 7 Days',
    'Last 14 Days',
    'Last Month',
    'Last 2 Months',
    'Last 6 Months',
]

export const ScoopDatePicker = ({value, onChange, range, containerSx, label, theme}) => {

    const [innerValue, setInnerValue] = useState(value)
    const [showPicker, setShowPicker] = useState(false)
    const [memoRangeOption, setMemoRangeOption] = useState('')
    const [rangeOption, setRangeOption] = useState('')
    const anchor = useRef()

    useEffect(() => {
        setInnerValue(null)
    }, [range])

    useEffect(() => {
        if (showPicker) {
            setInnerValue(value)
            setMemoRangeOption(rangeOption)
        }
    }, [showPicker])

    const handleDateChange = (value) => {
        setInnerValue(value)
        setRangeOption('')
    }

    const handleRangeOptionSelect = (option) => {
        setRangeOption(option)
        const today = new Date()
        const startDate = new Date()
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfLastMonth = new Date(firstDayOfCurrentMonth);
        lastDayOfLastMonth.setDate(lastDayOfLastMonth.getDate() - 1);
        switch (option) {
            case rangeOptions[0]:
                startDate.setDate(today.getDate() - 7)
                setInnerValue([startDate, today])
                break
            case rangeOptions[1]:
                startDate.setDate(today.getDate() - 14)
                setInnerValue([startDate, today])
                break
            case rangeOptions[2]:
                const firstDayOfLastMonth = new Date(firstDayOfCurrentMonth)
                firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1)
                setInnerValue([firstDayOfLastMonth, lastDayOfLastMonth])
                break
            case rangeOptions[3]:
                const firstDayOfLastTwoMonths = new Date(firstDayOfCurrentMonth)
                firstDayOfLastTwoMonths.setMonth(firstDayOfLastTwoMonths.getMonth() - 2)
                setInnerValue([firstDayOfLastTwoMonths, lastDayOfLastMonth])
                break
            case rangeOptions[4]:
                const firstDayOfLastSixMonths = new Date(firstDayOfCurrentMonth)
                firstDayOfLastSixMonths.setMonth(firstDayOfLastSixMonths.getMonth() - 6)
                setInnerValue([firstDayOfLastSixMonths, lastDayOfLastMonth])
                break
        }
    }

    const handleCancel = () => {
        setShowPicker(false)
        if (memoRangeOption !== rangeOption) setRangeOption(memoRangeOption)
    }

    const handleApply = () => {
        onChange(innerValue)
        setShowPicker(false)
    }

    const getStringValue = () => {
        if (!value) {
            if (range) {
                return 'Select date range'
            } else {
                return 'Select date'
            }
        } else {
            if (range) {
                return Array.isArray(value) ? (value[0].toLocaleDateString('en-US') + ' - ' + value[1].toLocaleDateString('en-US')) : ''
            } else {
                return Array.isArray(value) ? '' : value.toLocaleDateString('en-US')
            }
        }
    }

    return (
        <>
            <Box className={styles.datePickerContainer} sx={containerSx}>
                {
                    label &&
                    <Typography className={'inter'} sx={{fontWeight: 600, fontSize: '12px'}}>{label}</Typography>
                }
                <Box
                    className={styles.datePickerInput}
                    ref={anchor}
                    onClick={() => setShowPicker(true)}
                    sx={{backgroundColor: theme?.colorScheme?.darkTheme ? 'white' : ''}}
                >
                    <Typography className={'inter'} sx={{fontSize: '14px'}}>{getStringValue()}</Typography>
                    <Image src={CalendarBlack} alt={'calendar'} width={18} height={18} />
                </Box>
            </Box>
            <Popover
                open={showPicker}
                anchorEl={anchor.current}
                onClose={handleCancel}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                container={document.getElementById('slide-container')}
            >
                <Box className={styles.datePickerPopup}>
                    <Box className={styles.optionsAndCalendar}>
                        <Box className={styles.calendarContainer}>
                            <Calendar
                                value={innerValue}
                                onChange={handleDateChange}
                                formatShortWeekday={(locale, date) => shortDays[date.getDay()]}
                                selectRange={range}
                            />
                        </Box>
                    </Box>
                    <Box className={styles.datePickerFooter}>
                        <Button onClick={handleCancel} className={styles.datePickerButton}>Cancel</Button>
                        <Button onClick={handleApply} className={styles.datePickerButton} purple>Apply</Button>
                    </Box>
                </Box>
            </Popover>
        </>
    )
}
