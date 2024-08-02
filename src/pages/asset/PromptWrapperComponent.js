import React, {useEffect, useState} from "react";
import {useApi} from "@/pages/api/api";
import {Box} from "@mui/material";
import PromptComponent from "@/pages/asset/Prompt/PromptComponent";
import {socket} from "@/socket";

const PromptWrapperComponent = ({workspaceMetadata, token, canvasID, workspaceID, userID, designID}) => {

    const { postData } = useApi(token);
    const [prompts, setPrompts] = useState([]);

    useEffect(() => {
        postData({
            "action": "loadCanvasWithThemes",
            "userID": userID,
            "workspaceID": workspaceID,
            "canvasID": canvasID,
        }).then(r => {
            const prompts = r.canvas.canvasObjects.filter(o => o.type === 'Prompt')
            setPrompts(prompts)
        })
    }, []);

    return (
        <Box className={'promptsWrapperContainer'}>
            {
                prompts.map((prompt) =>
                    <PromptComponent
                        key={prompt.id}
                        promptProps={prompt.promptProps}
                        workspaceMetadata={workspaceMetadata}
                        token={token}
                        designID={designID}
                    />
                )
            }
        </Box>
    )
}

export default PromptWrapperComponent;
