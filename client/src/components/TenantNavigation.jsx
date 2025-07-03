import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Payment as PaymentsIcon,
  Build as MaintenanceIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  ExitToApp as LogoutIcon,
  LightMode,
  DarkMode,
  ChevronLeft,
  Close,
} from '@mui/icons-material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useDarkMode } from '../context/DarkModeContext';

const DRAWER_WIDTH = 240;

const TenantNavigation = ({ onSidebarToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    onSidebarToggle?.(newState);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
    if (!isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
      onSidebarToggle?.(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('tenantToken');
      navigate('/tenant/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { text: 'Dashboard', path: '/tenant/dashboard', icon: <DashboardIcon /> },
    { text: 'Payments', path: '/tenant/payments', icon: <PaymentsIcon /> },
    { text: 'Maintenance', path: '/tenant/maintenance', icon: <MaintenanceIcon /> },
    { text: 'Notifications', path: '/tenant/notifications', icon: <NotificationsIcon /> },
    { text: 'Profile', path: '/tenant/profile', icon: <ProfileIcon /> },
  ];

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'primary.main',
        color: 'white',
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Tenant Portal
        </Typography>
        <IconButton
          onClick={isMobile ? handleDrawerToggle : handleSidebarToggle}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          {isMobile ? <Close /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* Navigation Links */}
      <List
        sx={{
          flexGrow: 1,
          px: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      >
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              justifyContent: 'flex-start',
              bgcolor: location.pathname.startsWith(item.path)
                ? 'rgba(255, 255, 255, 0.15)'
                : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: 40,
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Bottom Actions */}
      <Box
        sx={{
          p: 1,
          flexShrink: 0,
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <ListItem
          button
          onClick={toggleDarkMode}
          sx={{
            borderRadius: 1,
            justifyContent: 'flex-start',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: 'inherit',
              minWidth: 40,
              justifyContent: 'center',
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? 'Light Mode' : 'Dark Mode'} />
        </ListItem>

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            justifyContent: 'flex-start',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: 'inherit',
              minWidth: 40,
              justifyContent: 'center',
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Sidebar Drawer for Desktop */}
      <Box
        component="nav"
        sx={{
          width: { md: sidebarCollapsed ? 0 : DRAWER_WIDTH },
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: theme.zIndex.appBar - 1,
          display: { xs: 'none', md: 'block' },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflow: 'hidden',
        }}
      >
        {drawer}
      </Box>

      {/* Toggle Button for Desktop */}
      {!isMobile && (
        <Fab
          size="small"
          onClick={handleSidebarToggle}
          sx={{
            position: 'fixed',
            left: 16,
            top: 16,
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: 'primary.main',
            color: 'white',
            display: { xs: 'none', md: 'flex' },
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          {sidebarCollapsed ? <MenuIcon /> : <ChevronLeft />}
        </Fab>
      )}

      {/* Top Bar for Mobile */}
      {isMobile && (
        <Box
          sx={{
            width: '100%',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            bgcolor: 'primary.main',
            color: 'white',
            zIndex: theme.zIndex.drawer + 2,
            px: 2,
            boxShadow: 1
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            Tenant Portal
          </Typography>
        </Box>
      )}
    </>
  );
};

export default TenantNavigation;
