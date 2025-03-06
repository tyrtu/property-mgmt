// src/components/TenantNavigation.jsx
import React from 'react';
import { Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const TenantNavigation = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear any stored user data
    sessionStorage.clear();
    navigate("/"); // Redirect to home or login page
  };

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        gap: 2
      }}
    >
      <Button component={Link} to="dashboard"> {/* Removed `/tenant/` prefix */}
        Dashboard
      </Button>
      <Button component={Link} to="payments">
        Payments
      </Button>
      <Button component={Link} to="maintenance">
        Maintenance
      </Button>
      <Button component={Link} to="notifications">
        Notifications
      </Button>
      <Button component={Link} to="profile">
        Profile
      </Button>
      <Button onClick={handleLogout} color="error">
        Logout
      </Button>
    </Box>
  );
};

export default TenantNavigation;
