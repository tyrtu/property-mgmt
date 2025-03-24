import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
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
  useTheme
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Payment as PaymentsIcon,
  Build as MaintenanceIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const TenantNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
    { text: "Dashboard", path: "/tenant/dashboard", icon: <DashboardIcon /> },
    { text: "Payments", path: "/tenant/payments", icon: <PaymentsIcon /> },
    { text: "Maintenance", path: "/tenant/maintenance", icon: <MaintenanceIcon /> },
    { text: "Notifications", path: "/tenant/notifications", icon: <NotificationsIcon /> },
    { text: "Profile", path: "/tenant/profile", icon: <ProfileIcon /> }
  ];

  return (
    <>
      <AppBar 
        position="static" 
        sx={{
          background: "linear-gradient(90deg, #1a237e 0%, #283593 100%)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)"
        }}
      >
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          padding: { xs: '0 8px', md: '0 24px' },
          minHeight: '64px'
        }}>
          {/* Left side - Brand and Menu Button */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexGrow: { xs: 1, md: 0 }
          }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                mr: 2
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box 
              component={Link} 
              to="/tenant/dashboard" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: { xs: 0, md: 3 }
              }}
            >
              <Box 
                component="img" 
                src="/assets/home.png" 
                alt="Logo" 
                sx={{ 
                  height: 40,
                  mr: 1,
                  display: { xs: 'none', sm: 'block' }
                }} 
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  letterSpacing: 1,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Tenant Portal
              </Typography>
            </Box>
          </Box>

          {/* Center - Navigation Links (Desktop) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexGrow: 1,
            justifyContent: 'center',
            mx: 2
          }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: 'white',
                  mx: 0.5,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                  background: location.pathname.startsWith(item.path) 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                  minWidth: 'auto'
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Right side - Logout Button */}
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            flexGrow: { xs: 0, md: 0 }
          }}>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                py: 1,
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {!isMobile && 'Logout'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: "linear-gradient(180deg, #1a237e 0%, #283593 100%)",
            color: 'white'
          }
        }}
      >
        <Box 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box 
            component={Link} 
            to="/tenant/dashboard" 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              p: 3,
              mb: 1
            }}
            onClick={handleDrawerToggle}
          >
            <Box 
              component="img" 
              src="/logo.png" 
              alt="Logo" 
              sx={{ 
                height: 40,
                mr: 2
              }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: 1
              }}
            >
              Tenant Portal
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

          <List sx={{ flexGrow: 1 }}>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  px: 3,
                  py: 1.5,
                  my: 0.5,
                  mx: 1,
                  borderRadius: 1,
                  background: location.pathname.startsWith(item.path) 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname.startsWith(item.path) ? 600 : 400 
                  }} 
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

          <ListItem
            button
            onClick={handleLogout}
            sx={{
              px: 3,
              py: 1.5,
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Drawer>
    </>
  );
};

export default TenantNavigation;