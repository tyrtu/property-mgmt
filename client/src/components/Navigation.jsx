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
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { text: "Properties", path: "/properties", icon: <PropertiesIcon fontSize="small" /> },
    { text: "Tenants", path: "/tenants", icon: <TenantsIcon fontSize="small" /> },
    { text: "Payments", path: "/payments", icon: <PaymentsIcon fontSize="small" /> },
    { text: "Maintenance", path: "/maintenance", icon: <MaintenanceIcon fontSize="small" /> },
    { text: "Reports", path: "/reports", icon: <ReportsIcon fontSize="small" /> }
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
          padding: { xs: '0 8px', md: '0 16px' },
          minHeight: '64px',
          gap: 1
        }}>
          {/* Left side - Brand and Menu Button */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            minWidth: 0,
            flexShrink: 1
          }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                mr: 1,
                padding: '8px'
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography 
              variant="h6" 
              noWrap
              component={Link}
              to="/dashboard"
              sx={{ 
                fontWeight: 700,
                letterSpacing: 1,
                color: 'inherit',
                textDecoration: 'none',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                mr: { xs: 1, md: 2 }
              }}
            >
              PropertyPro
            </Typography>
          </Box>

          {/* Center - Navigation Links (Desktop) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexGrow: 1,
            justifyContent: 'center',
            gap: 0.5,
            mx: 1
          }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                startIcon={React.cloneElement(item.icon, { fontSize: 'small' })}
                sx={{
                  color: 'white',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  '& .MuiButton-startIcon': {
                    marginRight: '6px',
                    '& svg': {
                      fontSize: '1.1rem'
                    }
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                  },
                  background: location.pathname.startsWith(item.path) 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Right side - Logout Button */}
          <Box sx={{ 
            display: 'flex',
            flexShrink: 0
          }}>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon fontSize={isMobile ? "medium" : "small"} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 1.5,
                py: 1,
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.875rem', md: '0.875rem' },
                minWidth: 'auto',
                '& .MuiButton-startIcon': {
                  marginRight: { xs: '0px', md: '6px' },
                  '& svg': {
                    fontSize: { xs: '1.3rem', md: '1.1rem' }
                  }
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                },
                transition: 'all 0.2s ease'
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
            width: 260,
            background: "linear-gradient(180deg, #1a237e 0%, #283593 100%)",
            color: 'white'
          }
        }}
      >
        <Box 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '8px'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: 1,
              px: 2,
              py: 1.5,
              mb: 0.5
            }}
          >
            PropertyPro
          </Typography>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mb: 0.5 }} />

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
                  py: 1.25,
                  my: 0.25,
                  mx: 1,
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)'
                  },
                  background: location.pathname.startsWith(item.path) 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: '40px',
                  '& svg': {
                    fontSize: '1.4rem'
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                    fontSize: '1rem'
                  }} 
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mt: 0.5 }} />

          <ListItem
            button
            onClick={handleLogout}
            sx={{
              px: 2,
              py: 1.25,
              my: 0.25,
              mx: 1,
              borderRadius: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon sx={{ 
              color: 'inherit', 
              minWidth: '40px',
              '& svg': {
                fontSize: '1.4rem'
              }
            }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontWeight: 600,
                fontSize: '1rem'
              }} 
            />
          </ListItem>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;