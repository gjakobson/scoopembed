import React, {useEffect, useState} from "react";
import {useApi} from "@/pages/api/api";
import {Box} from "@mui/material";
import PromptComponent from "@/pages/asset/Prompt/PromptComponent";
import _ from "lodash";
import {packFilter} from "@/utils/Filter";
import {ScoopLoader} from "@/components/ScoopLoader/ScoopLoader";

const PromptWrapperComponent = ({
                                    workspaceMetadata,
                                    token,
                                    canvasID,
                                    workspaceID,
                                    userID,
                                    designID,
                                    sendMessage,
                                    socketConnected,
                                    isDev
                                }) => {

    const container = typeof window !== 'undefined' ? document.getElementById('scoop-element-container') : {
        offsetWidth: 0,
        offsetHeight: 0
    }
    const itemID = `${userID}-${workspaceID}-${canvasID}`
    const {postData} = useApi(isDev, token, userID, workspaceID);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (socketConnected) {
            sendMessage(JSON.stringify({
                action: 'registerItem',
                groupID: designID,
                itemID: itemID
            }))
            postData({
                "action": "loadCanvasWithThemes",
                "userID": userID,
                "workspaceID": workspaceID,
                "canvasID": canvasID,
            }).then(r => {
                const prompts = r.canvas.canvasObjects.filter(o => o.type === 'Prompt')
                const updatedPrompts = _.flatten(prompts.map(p => p.promptProps.prompt))
                sendMessage(JSON.stringify({
                    action: 'updatePrompts',
                    groupID: designID,
                    itemID: itemID,
                    prompts: packFilter(updatedPrompts)
                }))
                setPrompts(prompts)
                setLoading(false)
            })
        }
    }, [socketConnected]);

    const onPromptChange = (id, changedPrompt) => {
        const changedIndex = prompts.findIndex(p => p.id === id)
        if (changedIndex > -1) {
            const promptsCopy = [...prompts]
            promptsCopy[changedIndex].promptProps = changedPrompt
            const updatedPrompts = _.flatten(promptsCopy.map(p => p.promptProps.prompt))
            sendMessage(JSON.stringify({
                action: 'updatePrompts',
                groupID: designID,
                itemID: itemID,
                prompts: packFilter(updatedPrompts)
            }))
        }
    }

    return (
        loading ?
            <div style={{width: '100%', height: '100%', display: 'grid', placeContent: 'center'}}>
                <ScoopLoader size={container.offsetWidth * 0.1}/>
            </div> :
            <Box className={'promptsWrapperContainer'}>
                {
                    prompts.map((prompt) =>
                        <PromptComponent
                            userID={userID}
                            workspaceID={workspaceID}
                            id={prompt.id}
                            key={prompt.id}
                            promptProps={prompt.promptProps}
                            workspaceMetadata={workspaceMetadata}
                            token={token}
                            designID={designID}
                            onPromptChange={onPromptChange}
                        />
                    )
                }
            </Box>
    )
}

export default PromptWrapperComponent;
