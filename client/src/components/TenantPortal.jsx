// src/components/TenantPortal.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TenantDashboard from './TenantDashboard';
import TenantPaymentHistory from './TenantPaymentHistory';
import TenantMaintenance from './TenantMaintenance';
import TenantNotifications from './TenantNotifications';
import TenantProfile from './TenantProfile';
import PrivateRoute from './PrivateRoute';
import useAutoLogout from '../hooks/useAutoLogout'; // ✅ Import the auto-logout hook
import { AppBar, Toolbar, IconButton, Typography, Drawer, Box, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const TenantPortal = () => {
  // ✅ Enable auto-logout after 1 minute of inactivity
  useAutoLogout();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.only('xs'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <>
      {/* Top NavBar with Hamburger, only on small screens */}
      {isMobile && (
        <AppBar position="fixed" color="primary" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Tenant Portal
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      {/* Sidebar Drawer, only on small screens */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ width: 240, p: 2 }}>
            <Typography variant="h6">Sidebar</Typography>
            {/* Add sidebar content here */}
          </Box>
        </Drawer>
      )}
      {/* Offset for fixed AppBar on small screens */}
      {isMobile && <Box sx={{ height: 64 }} />}
      <Routes>
        <Route path="dashboard" element={<PrivateRoute><TenantDashboard /></PrivateRoute>} />
        <Route path="payments" element={<PrivateRoute><TenantPaymentHistory /></PrivateRoute>} />
        <Route path="maintenance" element={<PrivateRoute><TenantMaintenance /></PrivateRoute>} />
        <Route path="notifications" element={<PrivateRoute><TenantNotifications /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute><TenantProfile /></PrivateRoute>} />
        <Route path="*" element={<PrivateRoute><TenantDashboard /></PrivateRoute>} />
      </Routes>
    </>
  );
};

export default TenantPortal;