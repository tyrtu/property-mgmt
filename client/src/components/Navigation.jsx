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
          WebkitBackdropFilter: "blur(10px)"
        }}
      >
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          padding: { xs: '0 12px', md: '0 24px' },
          minHeight: { xs: '48px', sm: '56px' }
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
                mr: 2,
                padding: '10px',
                marginLeft: '4px' // Added margin to prevent touching corner
              }}
            >
              <MenuIcon fontSize="medium" />
            </IconButton>

            <Box 
              component={Link} 
              to="/dashboard" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: { xs: 0, md: 3 }
              }}
            >
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                }}
              >
                RentHive
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
                  py: 0.75,
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
                  minWidth: 'auto',
                  fontSize: { xs: '0.875rem', md: '0.9rem' },
                  '& .MuiButton-startIcon': {
                    marginRight: '4px',
                    '& svg': {
                      fontSize: { xs: '1.1rem', md: '1.2rem' }
                    }
                  }
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
              startIcon={<LogoutIcon fontSize={isMobile ? "medium" : "small"} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                py: 0.75,
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.875rem', md: '0.9rem' },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease',
                '& .MuiButton-startIcon': {
                  marginRight: { xs: '0px', md: '4px' },
                  '& svg': {
                    fontSize: { xs: '1.1rem', md: '1.2rem' }
                  }
                }
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
            color: 'white',
            paddingTop: '12px', // Added padding at top
            paddingBottom: '12px' // Added padding at bottom
          }
        }}
      >
        <Box 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: 1,
                px: 3,
                py: 2,
                mb: 1
              }}
            >
              PropertyPro
            </Typography>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mb: 1 }} />

            <List>
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
                  <ListItemIcon sx={{ 
                    color: 'inherit', 
                    minWidth: '44px', // Increased min-width
                    '& svg': {
                      fontSize: '1.5rem' // Larger icons
                    }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                      fontSize: '1.05rem'
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mt: 1 }} />
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                px: 3,
                py: 1.5,
                my: 1,
                mx: 1,
                borderRadius: 1,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit', 
                minWidth: '44px',
                '& svg': {
                  fontSize: '1.5rem'
                }
              }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '1.05rem'
                }} 
              />
            </ListItem>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;