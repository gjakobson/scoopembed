import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import withAuth from '@/hoc/withAuth';

const SheetletComponent = dynamic(() => import('./SheetletComponent'), { ssr: false });
const InsightComponent = dynamic(() => import('./InsightComponent'), { ssr: false });

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { q } = context.query;

  // Split the query parameter `q`
  const [userID, workspaceID, insightKey, insightID] = q ? q.split(':') : [];

  return {
    props: { id, userID, workspaceID, insightKey, insightID }, // Pass the individual parameters as props
  };
}

const Asset = ({ id, userID, workspaceID, insightKey, insightID }) => {
  const isChart = id === 'chart';
  const queryParam = `${userID}:${workspaceID}:${insightID}:${insightKey}`;

  return (
    <div>
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
        {/* Custom link for iframely app */}
        <link rel="iframely app" href={`https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`} media="height=300,scrolling=no" />
        <link rel="alternate" type="application/json+oembed" href={`https://embed.scoopanalytics.com/api/oembed/${id}?format=json&url=https://embed.scoopanalytics.com/asset/${id}?q=${queryParam}`} />
      </Head>
      <AuthenticatedContent isChart={isChart} id={id} userID={userID} workspaceID={workspaceID} insightID={insightID} insightKey={insightKey} />
    </div>
  );
};

const AuthenticatedContent = withAuth(({ isChart, id, userID, workspaceID, insightKey, insightID }) => {
  return isChart ? <InsightComponent userID={userID} workspaceID={workspaceID} insightID={insightID} insightKey={insightKey} /> : <SheetletComponent />;
});

export default Asset;
