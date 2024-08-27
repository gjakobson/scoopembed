import React, {useState} from "react";
import styles from './StylesDialog.module.css';
import {Box, IconButton, Typography} from "@mui/material";
import Dialog from "@/components/Dialog/Dialog";
import PencilSimple from '../../../public/icons/PencilSimple.svg?url'
import Image from "next/image";
import Button from "@/components/Button/Button";
import {ScoopColorPicker} from "@/components/ScoopColorPicker/ScoopColorPicker";

export const StylesDialog = ({handleSave, canvaStyles, open, setOpen}) => {

    const [fontColor, setFontColor] = useState(canvaStyles?.fontColor || '#FFFFFF')
    const [backgroundColor, setBackgroundColor] = useState(canvaStyles?.backgroundColor || '#FFFFFF')

    const handleSaveStyles = () => {
        handleSave({fontColor, backgroundColor})
    }

    const actions= (
        <Box display="flex" justifyContent="flex-end" width="100% " gap= "8px">
            <Button onClick={() => setOpen(false)} text={'Cancel'} className={styles.styleActionsButton} />
            <Button onClick={handleSaveStyles} text={'Save'} purple autoFocus className={styles.styleActionsButton} />
        </Box>
    )

    return (
        <>
            <Box sx={{position: 'absolute', top: 10, right: 10}}>
                <IconButton onClick={() => setOpen(true)}>
                    <Image src={PencilSimple} alt={'pencil'} height={20} width={20} />
                </IconButton>
            </Box>
            <Dialog
                open={open}
                title={'Edit element style'}
                actions={actions}
                onClose={() => setOpen(false)}
            >
                <Box>
                    <Typography className={'inter'} sx={{fontSize: '12px', fontWeight: 600}}>Background color</Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40}}>
                        <ScoopColorPicker
                            height={20}
                            width={20}
                            value={backgroundColor}
                            origin={'right'}
                            onChange={setBackgroundColor}
                        />
                        <Typography className={'inter'} sx={{fontSize: '14px'}}>{backgroundColor}</Typography>
                    </Box>
                </Box>
                <Box>
                    <Typography className={'inter'} sx={{fontSize: '12px', fontWeight: 600}}>Font color</Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40}}>
                        <ScoopColorPicker
                            height={20}
                            width={20}
                            value={fontColor}
                            origin={'right'}
                            onChange={setFontColor}
                        />
                        <Typography className={'inter'} sx={{fontSize: '14px'}}>{fontColor}</Typography>
                    </Box>
                </Box>
            </Dialog>
        </>
    )
}
