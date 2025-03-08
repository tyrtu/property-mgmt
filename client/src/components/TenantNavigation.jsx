import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const TenantNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation(); // ✅ Get current path

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: "Dashboard", path: "/tenant/dashboard" },
    { text: "Payments", path: "/tenant/payments" },
    { text: "Maintenance", path: "/tenant/maintenance" },
    { text: "Notifications", path: "/tenant/notifications" },
    { text: "Profile", path: "/tenant/profile" }
  ];

  return (
    <>
      {/* ✅ Tenant Navbar with Styling */}
      <AppBar position="static" color="secondary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          
          {/* ✅ Hamburger Menu for Small Screens */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ display: { xs: 'block', md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          {/* ✅ Full Navigation (Large Screens) with Active Highlighting */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {navItems.map((item) => (
              <Button 
                key={item.text} 
                color="inherit" 
                component={Link} 
                to={item.path}
                sx={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Sidebar Drawer (Small Screens) */}
      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
          <List>
            {navItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                to={item.path}
                sx={{ 
                  bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default TenantNavigation;
