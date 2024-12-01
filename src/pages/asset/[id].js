import Head from 'next/head';
import dynamic from 'next/dynamic';
import withAuth from '@/hoc/withAuth';
import {useEffect, useState} from "react";
import {Auth} from "aws-amplify";
import {useRouter} from "next/router";
import {Server} from "@/pages/api/Server";
import {Box} from "@mui/material";
import useWebSocket from "react-use-websocket";

const SheetletComponent = dynamic(() => import('./SheetletComponent'), {ssr: false});
const InsightComponent = dynamic(() => import('./Insight/InsightComponent'), {ssr: false});
const PromptWrapperComponent = dynamic(() => import('./Prompt/PromptWrapperComponent'), {ssr: false});
const ProcessComponent = dynamic(() => import('./Process/ProcessComponent'), {ssr: false});

// NOTES FOR TESTING:
// prompt: https://embed.scoopanalytics.com/asset/prompt?q=fc7acca1-6381-4052-8aeb-d46d7e13e76c:W475:C416:DAGNq3u-Fng:screenshot=true:invite=Omega105-012
// sheet: https://embed.scoopanalytics.com/asset/sheet?q=fc7acca1-6381-4052-8aeb-d46d7e13e76c:W475:C379|1i0FPWSdz5vtLAg0LNPBOBtBnauItseu4hhxXvn5M7qQ:DAGNq3u-Fng:screenshot=true:invite=Omega105-012
// chart: https://embed.scoopanalytics.com/asset/chart?q=fc7acca1-6381-4052-8aeb-d46d7e13e76c:W475:I2301:DAGNq3u-Fng:screenshot=true:invite=Omega105-012
// chart: https://embed.scoopanalytics.com/asset/chart?q=fc7acca1-6381-4052-8aeb-d46d7e13e76c:W475:I2302:DAGNq3u-Fng:screenshot=true:invite=Omega105-012
// worksheet chart: https://embed.scoopanalytics.com/asset/chart?q=fc7acca1-6381-4052-8aeb-d46d7e13e76c:W475:I2193:DAGNq3u-Fng:screenshot=true:invite=Omega105-012

export async function getServerSideProps(context) {

    const {id} = context.params;
    const {q} = context.query;
    const params = q ? q.split(':') : []

    return {
        props: {
            id: id,
            userID: params[0],
            workspaceID: params[1],
            elementParams: params[2], // Element params will be separated by |
            designID: params[3],
            screenshot: params[4],
            invite: params[5] || null
        }
    }
}

const Asset = ({id, userID, workspaceID, elementParams, designID, invite, screenshot}) => {

    const queryParam = `${userID}:${workspaceID}:${elementParams}:${designID}:${screenshot}${invite ? `:${invite}` : ''}`

    return (
        <div id={'scoop-element-container'} style={{height: '95vh', width: '95vw'}}>
            <Head>
                <title>Scoop Analytics</title>
                <meta name="description" content="Beautiful, easy data visualization and storytelling"/>
                <link rel="canonical" href={`https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`}/>
                <meta property="og:title" content="Scoop Analytics"/>
                <meta property="og:description" content="Beautiful, easy data visualization and storytelling"/>
                <meta property="og:type" content="website"/>
                <meta property="og:url" content={`https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`}/>
                <meta property="og:site_name" content="Scoop Analytics Test"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta charSet="UTF-8"/>
                <link rel="iframely app" href={`https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`}
                      media="height=300,scrolling=no"/>
                <link rel="alternate" type="application/json+oembed"
                      href={`https://embed.scoopanalytics.com/api/oembed/${id}?format=json&url=https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`}/>
            </Head>
            <AuthenticatedContent
                id={id}
                userID={userID}
                workspaceID={workspaceID}
                elementParams={elementParams}
                designID={designID}
                screenshot={screenshot}
                invite={invite}
            />
        </div>
    )
};

const AuthenticatedContent = withAuth(({
                                           id,
                                           userID,
                                           workspaceID,
                                           elementParams,
                                           designID,
                                           screenshot,
                                           invite
                                       }) => {

    const params = elementParams.split('|');
    const screenshotParams = screenshot.substring(screenshot.indexOf('=') + 1).split('|');
    const router = useRouter();
    const [token, setToken] = useState(null);
    const [workspaceMetadata, setWorkspaceMetadata] = useState(null);
    const [server, setServer] = useState(new Server(workspaceID, userID, token));
    const {sendMessage, lastMessage, readyState} = useWebSocket('wss://yf8adv3utf.execute-api.us-west-2.amazonaws.com/production/', {shouldReconnect: () => true})

    console.log('version 0.0.9')

    useEffect(() => {
        if (invite) {
            const invToken = invite.split('=')[1];
            const newServer = new Server(workspaceID, userID, invToken)
            setServer(newServer)
            setToken(invToken)
            getWorkspaceMetadata(newServer)
        } else {
            const checkAuth = async () => {
                try {
                    const session = await Auth.currentSession();
                    const jwtToken = session.getIdToken().getJwtToken();
                    const newServer = new Server(workspaceID, userID, jwtToken)
                    setServer(newServer)
                    setToken(jwtToken)
                    getWorkspaceMetadata(newServer)
                } catch (error) {
                    router.push('/login');
                }
            };
            checkAuth();
        }
    }, []);

    const getWorkspaceMetadata = async (server) => {
        await server.postData({
            "action": "getWorkspaceMetadata",
        }, (result) => {
            setWorkspaceMetadata(result);
        });
    }

    const serverUpdate = lastMessage?.data ? JSON.parse(lastMessage.data) : null

    if (token) {
        switch (id) {
            case 'chart':
                return (
                    <InsightComponent
                        token={token}
                        workspaceID={workspaceID}
                        insightKey={params[0]}
                        workspaceMetadata={workspaceMetadata}
                        server={server}
                        serverUpdate={serverUpdate}
                        designID={designID}
                        userID={userID}
                        socketConnected={readyState === 1}
                        screenshot={screenshotParams[0] === 'true'}
                        urlPrompt={screenshotParams[1]}
                        sendMessage={sendMessage}
                    />
                )
            case 'sheet':
                return (
                    <SheetletComponent
                        token={token}
                        userID={userID}
                        workspaceID={workspaceID}
                        designID={designID}
                        socketConnected={readyState === 1}
                        serverUpdate={serverUpdate}
                        canvasID={params[0]}
                        worksheetID={params[1]}
                        sendMessage={sendMessage}
                    />
                )
            case 'prompt':
                return (
                    <PromptWrapperComponent
                        token={token}
                        workspaceMetadata={workspaceMetadata}
                        canvasID={params[0]}
                        workspaceID={workspaceID}
                        userID={userID}
                        serverUpdate={serverUpdate}
                        designID={designID}
                        socketConnected={readyState === 1}
                        sendMessage={sendMessage}
                    />
                )
            case 'process':
                return (
                    <ProcessComponent
                        token={token}
                        workspaceID={workspaceID}
                        processName={params[0].replaceAll('-', ' ')}
                        workspaceMetadata={workspaceMetadata}
                        server={server}
                        serverUpdate={serverUpdate}
                        designID={designID}
                        userID={userID}
                        socketConnected={readyState === 1}
                        screenshot={screenshotParams[0] === 'true'}
                        sendMessage={sendMessage}
                    />
                )
            default: return <Box>No asset specified</Box>
        }
    }

    return (<Box>Unauthorized</Box>)
});

export default Asset;
