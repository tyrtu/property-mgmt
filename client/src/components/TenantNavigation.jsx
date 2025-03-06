// src/components/TenantNavigation.jsx
import React from 'react';
import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const TenantNavigation = () => (
  <Box
    sx={{
      p: 2,
      borderBottom: 1,
      borderColor: 'divider',
      display: 'flex',
      gap: 2
    }}
  >
    <Button component={Link} to="/tenant/dashboard">
      Dashboard
    </Button>
    <Button component={Link} to="/tenant/payments">
      Payments
    </Button>
    <Button component={Link} to="/tenant/maintenance">
      Maintenance
    </Button>
    <Button component={Link} to="/tenant/notifications">
      Notifications
    </Button>
    <Button component={Link} to="/tenant/profile">
      Profile
    </Button>
  </Box>
);

export default TenantNavigation;
