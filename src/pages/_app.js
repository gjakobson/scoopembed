// src/pages/_app.js
import "@/styles/globals.css";
import { Amplify } from 'aws-amplify'; // Named import
import awsconfig from '../aws-exports';

Amplify.configure({ ...awsconfig, ssr: true });

console.log('awsconfig:', awsconfig);

function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default App;
