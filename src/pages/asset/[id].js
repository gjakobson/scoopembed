import Head from 'next/head';
import dynamic from 'next/dynamic';
import withAuth from '@/hoc/withAuth';
import {useEffect, useState} from "react";
import {Auth} from "aws-amplify";
import {useRouter} from "next/router";
import {Server} from "@/pages/api/Server";
import {useApi} from "@/pages/api/api";

const SheetletComponent = dynamic(() => import('./SheetletComponent'), { ssr: false });
const InsightComponent = dynamic(() => import('./InsightComponent'), { ssr: false });
const WebSocketTest = dynamic(() => import('../components/WebSocketTest'), { ssr: false });

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { q } = context.query;

  // Split the query parameter `q`
  const [userID, workspaceID, insightKey, insightID, invite] = q ? q.split(':') : [];

  return {
    props: { id, userID, workspaceID, insightKey, insightID, invite: invite || null },
  };
}

const Asset = ({ id, userID, workspaceID, insightKey, insightID, invite }) => {

  const isChart = id === 'chart';
  const isWebSocketTest = id === 'websocket-test';
  const queryParam = `${userID}:${workspaceID}:${insightKey}:${insightID}${invite ? `:${invite}` : ''}`;

  return (
    <div id={'scoop-element-container'}>
      <Head>
        <title>Scoop Analytics</title>
        <meta name="description" content="Beautiful, easy data visualization and storytelling" />
        <link rel="canonical" href={`https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`} />
        <meta property="og:title" content="Scoop Analytics" />
        <meta property="og:description" content="Beautiful, easy data visualization and storytelling" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`} />
        <meta property="og:site_name" content="Scoop Analytics Test" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="iframely app" href={`https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`} media="height=300,scrolling=no" />
        <link rel="alternate" type="application/json+oembed" href={`https://embed.scoopanalytics.com/api/oembed/${id}?format=json&url=https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`} />
      </Head>
      <AuthenticatedContent isChart={isChart} isWebSocketTest={isWebSocketTest} id={id} userID={userID} workspaceID={workspaceID} insightID={insightID} insightKey={insightKey} invite={invite} />
    </div>
  );
};

const AuthenticatedContent = withAuth(({ isChart, isWebSocketTest, id, userID, workspaceID, insightKey, insightID, invite }) => {

  const router = useRouter();
  const [token, setToken] = useState(null)
  const [workspaceMetadata, setWorkspaceMetadata] = useState(null)
  const [server, setServer] = useState(new Server(workspaceID, userID, token))

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

  if (isWebSocketTest) {
    return <WebSocketTest />
  }

  if (isChart) {
    return <InsightComponent
        token={token}
        userID={userID}
        workspaceID={workspaceID}
        insightID={insightID}
        insightKey={insightKey}
        invite={invite}
        workspaceMetadata={workspaceMetadata}
        server={server}
    />
  } else {
    return <SheetletComponent />
  }
});

export default Asset;
