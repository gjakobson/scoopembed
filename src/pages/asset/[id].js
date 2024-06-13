import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ChartComponentOne = dynamic(() => import('./ChartComponentOne'), { ssr: false });
const ChartComponentTwo = dynamic(() => import('./ChartComponentTwo'), { ssr: false });

export async function getServerSideProps(context) {
  const { id } = context.params;
  return {
    props: { id },
  };
}



const Asset = ({ id }) => {
  // temp to change the charts displayed based on the id
  const isIdEven = id && Number(id) % 2 === 0;

  return (
    <div>
      <Head>
        <title>Scoop chart embedding</title>
        <meta name="description" content="Beautiful, easy data visualization and storytelling" />
        <link rel="canonical" href={`https://embed.scoopanalytics.com/asset/${id}`} />

        <meta property="og:title" content="Scoop chart embedding" />
        <meta property="og:description" content="Beautiful, easy data visualization and storytelling" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://embed.scoopanalytics.com/asset/${id}`} />
        <meta property="og:site_name" content="Scoop Analytics Test" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />

        {/* Custom link for iframely app */}
        <link rel="iframely app" href={`https://embed.scoopanalytics.com/asset/${id}`} media="height=575,scrolling=no" />


        <link rel="alternate" type="application/json+oembed" href={`https://embed.scoopanalytics.com/api/oembed/${id}?format=json&url=https://embed.scoopanalytics.com/asset/${id}`} />
      </Head>
      {isIdEven ? <ChartComponentOne /> : <ChartComponentTwo />}
    </div>
  );
};

export default Asset;
