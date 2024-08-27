import { Box, Dialog as MuiDialog, DialogActions, DialogContent, DialogTitle, FormControl, Stack } from "@mui/material";
import styles from './Dialog.module.css';
import CloseIcon from '../../../public/icons/CloseIcon.svg?url';
import Image from "next/image";

const Dialog = ({ open, onClose, title, children, actions, icon, style, extraWide, ...props }) => {

    // Conditionally apply styles based on extraWide prop
    const dialogPaperStyle = extraWide ? { ...style, maxWidth: '1500px', width: '80%' } : style;

    return (
        <MuiDialog
            open={open}
            onClose={onClose}
            maxWidth="sm" // Keep your default maxWidth or adjust as needed
            PaperProps={{style: dialogPaperStyle}}
            {...props}
            className={`dialog`}
        >
            <div className={styles.dialogContentContainer} id={'dialog-content-container'}>
                {/* Dialog structure */}
                {icon ? (
                        <Stack direction="row" spacing={4} sx={{width: '100%'}}>
                            <img
                                src={icon}
                                alt="Icon"
                                style={{cursor: "pointer", maxWidth: '64px', alignContent: 'center'}}
                            />
                            <DialogTitle className={styles.dialogTitle}>{title}
                                <Box onClick={onClose} className={styles.dialogXButtonWImage}>
                                    <Image src={CloseIcon} height={18} width={18} alt={'closeIcon'}/>
                                </Box>
                            </DialogTitle>
                        </Stack>
                    ) :
                    title ?
                        (<DialogTitle className={styles.dialogTitle}>
                            {title}
                            <Box onClick={onClose} className={styles.dialogXButton}>
                                <Image src={CloseIcon} height={18} width={18} alt={'closeIcon'}/>
                            </Box>
                        </DialogTitle>)
                        :
                        <Box onClick={onClose} sx={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
                            <Image src={CloseIcon} height={18} width={18} alt={'closeIcon'}/>
                        </Box>
                }
                <DialogContent className={styles.dialogContent}>
                    <FormControl fullWidth sx={{gap: '16px'}}>
                        {children}
                    </FormControl>
                </DialogContent>
                {actions && <DialogActions>{actions}</DialogActions>}
            </div>
        </MuiDialog>
    );
}

export default Dialog;
