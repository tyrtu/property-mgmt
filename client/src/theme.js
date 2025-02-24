// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#2c3e50' },
    secondary: { main: '#3498db' },
    success: { main: '#27ae60' },
    warning: { main: '#f1c40f' },
    error: { main: '#e74c3c' },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    button: { textTransform: 'none' }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { fontWeight: 500 }
      }
    }
  }
});

export default theme; // Proper default export