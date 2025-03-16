import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import MenuIcon from '@mui/icons-material/Menu';
import { auth } from '../firebase'; // ✅ Import Firebase Auth
import { signOut } from 'firebase/auth'; // ✅ Import signOut function

const TenantNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation(); // ✅ Get current path
  const navigate = useNavigate(); // ✅ Added useNavigate for redirecting after logout

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      localStorage.removeItem('tenantToken'); // Clear tenant token from localStorage
      navigate('/tenant/login'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
      {/* ✅ Tenant Navbar with Logout Button */}
      <AppBar position="static" color='primary'>
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

          {/* ✅ Logout Button */}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
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
            {/* ✅ Logout Button in Drawer */}
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default TenantNavigation;
