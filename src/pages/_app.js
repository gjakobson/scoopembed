// src/pages/_app.js
import "@/styles/globals.css";
import { Amplify } from 'aws-amplify';
import CssBaseline from '@mui/material/CssBaseline';
import awsconfig from '../aws-exports';

Amplify.configure({ ...awsconfig, ssr: true });

function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default App;
