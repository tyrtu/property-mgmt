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
import { AppBar, Toolbar, IconButton, Typography, Drawer, Box, useTheme, useMediaQuery, Fab } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Payment as PaymentsIcon,
  Build as MaintenanceIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  ExitToApp as LogoutIcon,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const DrawerContent = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    { text: 'Dashboard', path: '/tenant/dashboard', icon: <DashboardIcon /> },
    { text: 'Payments', path: '/tenant/payments', icon: <PaymentsIcon /> },
    { text: 'Maintenance', path: '/tenant/maintenance', icon: <MaintenanceIcon /> },
    { text: 'Notifications', path: '/tenant/notifications', icon: <NotificationsIcon /> },
    { text: 'Profile', path: '/tenant/profile', icon: <ProfileIcon /> },
  ];
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.main', color: 'white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Tenant Portal</Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List sx={{ flexGrow: 1, px: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => { navigate(item.path); onNavigate && onNavigate(); }}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              justifyContent: 'flex-start',
              bgcolor: location.pathname.startsWith(item.path)
                ? 'rgba(255, 255, 255, 0.15)'
                : 'transparent',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname.startsWith(item.path) ? 600 : 400 }} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 1, flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <ListItem button sx={{ borderRadius: 1, justifyContent: 'flex-start', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40, justifyContent: 'center' }}><LightMode /></ListItemIcon>
          <ListItemText primary={'Light/Dark Mode'} />
        </ListItem>
        <ListItem button sx={{ borderRadius: 1, justifyContent: 'flex-start', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40, justifyContent: 'center' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );
};

const TenantPortal = () => {
  // ✅ Enable auto-logout after 1 minute of inactivity
  useAutoLogout();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.only('xs'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));
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
          <DrawerContent onNavigate={handleDrawerToggle} />
        </Drawer>
      )}
      {/* Floating Hamburger FAB and Drawer for large screens */}
      {isLargeScreen && (
        <>
          <Fab
            color="primary"
            aria-label="open drawer"
            size="small"
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 24,
              left: drawerOpen ? 264 : 24,
              zIndex: theme.zIndex.drawer + 2,
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <MenuIcon fontSize="small" />
          </Fab>
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
            <DrawerContent onNavigate={handleDrawerToggle} />
          </Drawer>
        </>
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