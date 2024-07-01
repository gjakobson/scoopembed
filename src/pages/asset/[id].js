import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import withAuth from '@/hoc/withAuth';

const SheetletComponent = dynamic(() => import('./SheetletComponent'), { ssr: false });
const InsightComponent = dynamic(() => import('./InsightComponent'), { ssr: false });

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { query } = context;

  return {
    props: { id, query: query || {} }, // Ensure query is always an object
  };
}

const Asset = ({ id, query: initialQuery }) => {
  const router = useRouter();
  const query = { ...initialQuery, ...router.query };


  // temp to change the charts displayed based on the id
  const isIdEven = id && Number(id) % 2 === 0;
// id will be hashed code to do API call and pull metadata about this code to figure out the correct workspaceID, userID etc.
  return (
    <div>
      <Head>
        <title>Scoop Analytics</title>
        <meta name="description" content="Beautiful, easy data visualization and storytelling" />
        <link rel="canonical" href={`https://embed.scoopanalytics.com/asset/${id}`} />
        <meta property="og:title" content="Scoop Analytics" />
        <meta property="og:description" content="Beautiful, easy data visualization and storytelling" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://embed.scoopanalytics.com/asset/${id}`} />
        <meta property="og:site_name" content="Scoop Analytics Test" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        {/* Custom link for iframely app */}
        <link rel="iframely app" href={`https://embed.scoopanalytics.com/asset/${id}`} media="height=300,scrolling=no" />
        <link rel="alternate" type="application/json+oembed" href={`https://embed.scoopanalytics.com/api/oembed/${id}?format=json&url=https://embed.scoopanalytics.com/asset/${id}`} />
      </Head>
      {isIdEven ? <InsightComponent id={id} query={query} /> : <SheetletComponent id={id} query={query} />}
    </div>
  );
};

export default withAuth(Asset);
