import Head from 'next/head';
import dynamic from 'next/dynamic';
import withAuth from '@/hoc/withAuth';
import {useEffect, useState} from "react";
import {Auth} from "aws-amplify";
import {useRouter} from "next/router";
import {Server} from "@/pages/api/Server";
import {Box} from "@mui/material";
import {socket} from "@/socket";

const SheetletComponent = dynamic(() => import('./SheetletComponent'), {ssr: false});
const InsightComponent = dynamic(() => import('./Insight/InsightComponent'), {ssr: false});
const PromptWrapperComponent = dynamic(() => import('./Prompt/PromptWrapperComponent'), {ssr: false});

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
        <div id={'scoop-element-container'} style={{height: '100vh', width: '100vw'}}>
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
                screenshot={screenshot.split('=')[1] === 'true'}
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
    const router = useRouter();
    const [token, setToken] = useState(null);
    const [workspaceMetadata, setWorkspaceMetadata] = useState(null);
    const [server, setServer] = useState(new Server(workspaceID, userID, token));
    const [serverUpdate, setServerUpdate] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);

    console.log('version 0.0.5')

    useEffect(() => {
        socket.onopen = (e) => {
            setSocketConnected(true)
            console.log('socket connected')
        }
        socket.onclose = (e) => {
            console.log('socket disconnected')
        }
        socket.onmessage = (data) => {
            if (data.data?.includes('action')) {
                setServerUpdate(JSON.parse(data.data))
            }
            console.log('server update')
        }
        return () => socket.close()
    }, []);

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
                        socketConnected={socketConnected}
                        screenshot={screenshot}
                    />
                )
            case 'sheet':
                return (
                    <SheetletComponent
                        token={token}
                        userID={userID}
                        workspaceID={workspaceID}
                        designID={designID}
                        socketConnected={socketConnected}
                        serverUpdate={serverUpdate}
                        canvasID={params[0]}
                        worksheetID={params[1]}
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
                        socketConnected={socketConnected}
                    />
                )
            default: return <Box>No asset specified</Box>
        }
    }

    return (<Box>Unauthorized</Box>)
});

export default Asset;
