import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark', // This is the key to enable dark mode
    primary: {
      main: '#bb86fc', // A nice purple for primary elements like buttons
    },
    secondary: {
      main: '#03dac6', // A teal for accents and secondary elements
    },
    background: {
      default: '#121212', // The main background color of your app
      paper: '#1e1e1e',   // The background for components like Cards and Menus
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});