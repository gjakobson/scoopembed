import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import the WebSocketTest component dynamically to avoid SSR issues
const WebSocketTest = dynamic(() => import('../components/WebSocketTest'), { ssr: false });

const WebSocketTestPage = () => {
  return (
    <div>
      <Head>
        <title>WebSocket Test - Scoop Analytics</title>
        <meta name="description" content="Testing WebSocket functionality in Canva iframes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
        <WebSocketTest />
      </main>
    </div>
  );
};

export default WebSocketTestPage;