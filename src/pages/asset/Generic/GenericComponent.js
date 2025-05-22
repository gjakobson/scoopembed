import React, {useEffect, useState} from "react";
import styles from './Generic.module.css';
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";
import {Box} from "@mui/material";
import {useApi} from "@/pages/api/api";

const GenericComponent = ({
                              isDev,
                              token,
                              workspaceID,
                              userID,
                              canvasID,
                              elementID,
                          }) => {

    const container = typeof window !== 'undefined' ? document.getElementById('scoop-element-container') : {
        offsetWidth: 0,
        offsetHeight: 0
    };
    const {postData} = useApi(isDev, token, userID, workspaceID);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        postData({
            "action": "loadCanvasWithThemes",
            "userID": userID,
            "workspaceID": workspaceID,
            "canvasID": canvasID,
        }).then(r => {
            const searchID = elementID.includes("-") ? elementID.replace("-", ":") : elementID;
            const element = r?.canvas?.canvasObjects?.filter(o => o.id.toString() === searchID)[0];
            if (element?.content) setContent(element.content);
            else setError('Element not found');
            setLoading(false)
        })
    }, []);

    return (
        loading ?
            <div style={{width: '100%', height: '100%', display: 'grid', placeContent: 'center'}}>
                <ScoopLoader size={container.offsetWidth * 0.1}/>
            </div> :
            (
                error ?
                    <Box className={'genericComponentWrapper'}>{error}</Box> :
                    <Box
                        className={'genericComponentWrapper'}
                        dangerouslySetInnerHTML={{__html: content}}
                        sx={{height: '100vh', width: '100vw'}}
                    />
            )
    );
}

export default GenericComponent;
