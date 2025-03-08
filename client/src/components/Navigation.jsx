import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          <Button color="inherit" component={Link} to="/properties">Properties</Button>
          <Button color="inherit" component={Link} to="/tenants">Tenants</Button>
          <Button color="inherit" component={Link} to="/payments">Payments</Button>
          <Button color="inherit" component={Link} to="/maintenance">Maintenance</Button>
          <Button color="inherit" component={Link} to="/reports">Reports</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
