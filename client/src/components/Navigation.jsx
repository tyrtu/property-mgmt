// src/components/Navigation.jsx
import { Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navigation = () => (
  <Box sx={{ 
    p: 2, 
    borderBottom: 1, 
    borderColor: 'divider',
    display: 'flex',
    gap: 2
  }}>
    <Button component={Link} to="/dashboard">Dashboard</Button>
    <Button component={Link} to="/properties">Properties</Button>
    <Button component={Link} to="/tenants">Tenants</Button>
    <Button component={Link} to="/payments">Payments</Button>
    <Button component={Link} to="/maintenance">Maintenance</Button>
    <Button component={Link} to="/reports">Reports</Button>
  </Box>
);

export default Navigation;