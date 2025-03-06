import React, { useState } from "react";
import { Box, Button, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Hamburger Icon
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase"; // Firebase auth
import { signOut } from "firebase/auth"; // Firebase sign-out function

const TenantNavigation = () => {
  const [open, setOpen] = useState(false); // Toggle state for menu
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    navigate("/tenant/login");
  };

  // Toggle Drawer (Sidebar)
  const toggleDrawer = (isOpen) => () => {
    setOpen(isOpen);
  };

  // Navigation Links
  const navLinks = [
    { text: "Dashboard", path: "/tenant/dashboard" },
    { text: "Payments", path: "/tenant/payments" },
    { text: "Maintenance", path: "/tenant/maintenance" },
    { text: "Notifications", path: "/tenant/notifications" },
    { text: "Profile", path: "/tenant/profile" },
  ];

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* Hamburger Menu (visible on small screens) */}
      <IconButton onClick={toggleDrawer(true)} sx={{ display: { xs: "block", md: "none" } }}>
        <MenuIcon />
      </IconButton>

      {/* Full Navigation (Visible on larger screens) */}
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
        {navLinks.map((link) => (
          <Button
            key={link.text}
            component={Link}
            to={link.path}
            sx={{
              color: location.pathname === link.path ? "primary.main" : "inherit", // Highlight active page
              fontWeight: location.pathname === link.path ? "bold" : "normal",
              borderBottom: location.pathname === link.path ? "2px solid #1976d2" : "none", // Add bottom border
            }}
          >
            {link.text}
          </Button>
        ))}
        <Button onClick={handleLogout} color="error">
          Logout
        </Button>
      </Box>

      {/* Mobile Drawer (Sidebar) */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {navLinks.map((link) => (
              <ListItem
                button
                key={link.text}
                component={Link}
                to={link.path}
                onClick={toggleDrawer(false)}
                sx={{
                  backgroundColor: location.pathname === link.path ? "#e3f2fd" : "inherit", // Highlight active page
                  fontWeight: location.pathname === link.path ? "bold" : "normal",
                }}
              >
                <ListItemText primary={link.text} />
              </ListItem>
            ))}
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" sx={{ color: "red" }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default TenantNavigation;
