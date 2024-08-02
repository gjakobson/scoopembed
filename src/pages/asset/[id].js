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
const InsightComponent = dynamic(() => import('./InsightComponent'), {ssr: false});
const PromptWrapperComponent = dynamic(() => import('./PromptWrapperComponent'), {ssr: false});
const WebSocketTest = dynamic(() => import('../components/WebSocketTest'), {ssr: false});

export async function getServerSideProps(context) {
    const {id} = context.params;
    const {q} = context.query;

    const params = q ? q.split(':') : []
    const baseProps = {
        id: id,
        userID: params[0],
        workspaceID: params[1],
        designID: params[3],
        invite: params[4] || null
    }

    switch (id) {
        case 'chart':
            return {props: {...baseProps, insightKey: params[2]}}
        case 'prompt':
            return {props: {...baseProps, canvasID: params[2]}}
        default:
            return {props: {}}
    }
}

const Asset = ({id, userID, workspaceID, insightKey, invite, canvasID, designID}) => {

    let queryParam = ''

    if (id === 'prompt') {
        queryParam = `${userID}:${workspaceID}:${canvasID}:${designID}${invite ? `:${invite}` : ''}`;
    } else {
        queryParam = `${userID}:${workspaceID}:${insightKey}:${designID}${invite ? `:${invite}` : ''}`;
    }

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
            </Head>
            <AuthenticatedContent
                id={id}
                userID={userID}
                workspaceID={workspaceID}
                canvasID={canvasID}
                insightKey={insightKey}
                invite={invite}
                designID={designID}
            />
        </div>
    );
};

const AuthenticatedContent = withAuth(({
                                           id,
                                           userID,
                                           workspaceID,
                                           insightKey,
                                           canvasID,
                                           designID,
                                           invite
                                       }) => {

    const router = useRouter();
    const [token, setToken] = useState(null)
    const [workspaceMetadata, setWorkspaceMetadata] = useState(null)
    const [server, setServer] = useState(new Server(workspaceID, userID, token))
    const [serverUpdate, setServerUpdate] = useState(null);

    useEffect(() => {
        const onConnect = () => {
            console.log('socket connected')
        }
        const onDisconnect = () => {
            console.log('socket disconnected')
        }
        const onServerUpdate = (data) => {
            setServerUpdate(data)
            console.log('server update', data)
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('scoopServerUpdate', onServerUpdate)

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('scoopServerUpdate', onServerUpdate);
        };
    }, []);

    useEffect(() => {
        const getWorkspaceMetadata = async (server) => {
            await server.postData({
                "action": "getWorkspaceMetadata",
            }, (result) => {
                setWorkspaceMetadata(result);
            });
        }
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
    }, [invite, router]);

    switch (id) {
        case 'chart':
            return (
                <InsightComponent
                    token={token}
                    workspaceID={workspaceID}
                    insightKey={insightKey}
                    workspaceMetadata={workspaceMetadata}
                    server={server}
                    serverUpdate={serverUpdate}
                    designID={designID}
                />
            )
        case 'sheetlet':
            return (
                <SheetletComponent serverUpdate={serverUpdate} />
            )
        case 'prompt':
            return (
                <PromptWrapperComponent
                    token={token}
                    workspaceMetadata={workspaceMetadata}
                    canvasID={canvasID}
                    workspaceID={workspaceID}
                    userID={userID}
                    serverUpdate={serverUpdate}
                    designID={designID}
                />
            )
        case 'websocket-test':
            return (
                <WebSocketTest/>
            )
        default:
            return (
                <Box>

                </Box>
            )
    }
});

export default Asset;
