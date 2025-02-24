import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2c3e50' },
    secondary: { main: '#3498db' },
    success: { main: '#27ae60' },
    warning: { main: '#f1c40f' },
    error: { main: '#e74c3c' }
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h4: { fontWeight: 600 }
  }
});