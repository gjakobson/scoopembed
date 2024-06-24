// src/styles/Style.js
import { createTheme } from '@mui/material/styles';

export const ScoopTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Source Sans Pro, system-ui',
    fontSize: 14,
    color: '#6E7079',
    h1: {
      fontSize: '2rem',
      color: '#6E7079',
    },
    subtitle1: {
      fontSize: '14px',
      color: '#6E7079',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'rgba(0,0,0,0)',
        },
      },
    },
  },
});
