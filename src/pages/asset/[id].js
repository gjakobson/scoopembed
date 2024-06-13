import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps(context) {
  const { id } = context.params;
  return {
    props: { id }, // Pass `id` to the page component as a prop
  };
}

const Asset = ({ id }) => {
  return (
    <div>
      <Head>
        <meta name="description" content="Beautiful, easy data visualization and storytelling" />
        <link rel="canonical" href={`https://embed.scoophonalytics.com/asset/${id}`} />
        <meta property="og:title" content={`Gabe's Page ${id}`} />
        <meta property="og:description" content="Beautiful, easy data visualization and storytelling" />
        <meta property="og:url" content={`https://embed.scoophonalytics.com/asset/${id}`} />
        <meta property="og:type" content="website" />
        <link rel="alternate" type="application/json+oembed" href={`https://embed.scoophonalytics.com/asset/${id}?format=json`} />

      </Head>
      <h1>Asset Page: {id}</h1>
      <p>This page will show details for asset {id}.</p>
    </div>
  );
};

export default Asset;
