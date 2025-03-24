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
  Home as PropertiesIcon,
  People as TenantsIcon,
  Payment as PaymentsIcon,
  Build as MaintenanceIcon,
  Assessment as ReportsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navigation = () => {
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
      navigate('/tenant/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { text: "Properties", path: "/properties", icon: <PropertiesIcon /> },
    { text: "Tenants", path: "/tenants", icon: <TenantsIcon /> },
    { text: "Payments", path: "/payments", icon: <PaymentsIcon /> },
    { text: "Maintenance", path: "/maintenance", icon: <MaintenanceIcon /> },
    { text: "Reports", path: "/reports", icon: <ReportsIcon /> }
  ];

  return (
    <>
      <AppBar 
        position="static" 
        sx={{
          background: "linear-gradient(90deg, #1a237e 0%, #283593 100%)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          overflowX: 'hidden' // Prevent horizontal overflow
        }}
      >
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          padding: { xs: '0 4px', md: '0 12px' }, // Reduced padding
          minHeight: '64px',
          width: '100%',
          maxWidth: '100%',
          flexWrap: 'nowrap'
        }}>
          {/* Left side - Brand and Menu Button */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexShrink: 1,
            minWidth: 0 // Allow text truncation
          }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                mr: 1 // Reduced margin
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box 
              component={Link} 
              to="/dashboard" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: { xs: 1, md: 2 }, // Reduced margin
                flexShrink: 1,
                minWidth: 0
              }}
            >
              <Typography 
                variant="h6" 
                noWrap // Prevent text wrapping
                sx={{ 
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' } // Responsive font size
                }}
              >
                PropertyPro
              </Typography>
            </Box>
          </Box>

          {/* Center - Navigation Links (Desktop) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexGrow: 0, // Don't grow
            mx: 1, // Reduced margin
            flexShrink: 1,
            minWidth: 0,
            overflow: 'hidden'
          }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                startIcon={null} // Removed icons to save space
                sx={{
                  color: 'white',
                  mx: 0.25, // Reduced margin
                  px: 1, // Reduced padding
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                  background: location.pathname.startsWith(item.path) 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                  },
                  transition: 'all 0.3s ease',
                  minWidth: 'auto',
                  fontSize: '0.875rem' // Smaller font
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
            flexShrink: 0,
            ml: 1 // Reduced margin
          }}>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={isMobile ? <LogoutIcon /> : null}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 1, // Reduced padding
                py: 1,
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                },
                transition: 'all 0.3s ease',
                fontSize: '0.875rem' // Smaller font
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
            to="/dashboard" 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              p: 2,
              mb: 1
            }}
            onClick={handleDrawerToggle}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: 1
              }}
            >
              PropertyPro
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
                  px: 2,
                  py: 1,
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
              px: 2,
              py: 1,
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

export default Navigation;