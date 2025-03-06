import React from 'react';
import { Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // ✅ Import Firebase Auth
import { signOut } from 'firebase/auth'; // ✅ Import signOut function

const TenantNavigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth); // ✅ Firebase logout
    localStorage.clear(); // ✅ Clear any stored user data
    sessionStorage.clear();
    navigate("/tenant/login"); // ✅ Redirect to login
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
      <Button component={Link} to="/tenant/dashboard">Dashboard</Button>
      <Button component={Link} to="/tenant/payments">Payments</Button>
      <Button component={Link} to="/tenant/maintenance">Maintenance</Button>
      <Button component={Link} to="/tenant/notifications">Notifications</Button>
      <Button component={Link} to="/tenant/profile">Profile</Button>
      <Button onClick={handleLogout} color="error">Logout</Button>
    </Box>
  );
};

export default TenantNavigation;
