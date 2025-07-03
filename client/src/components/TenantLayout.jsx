import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 42;

const TenantLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          ml: { md: `${sidebarWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          position: 'relative',
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          overflow: 'auto',
          pt: isMobile ? '56px' : 0, // ✅ Push content below top bar (FIX APPLIED HERE)
        }}
      >
        {/* Inner Content */}
        <Box sx={{ p: 2 }}>
          {children}

          {/* Bottom offset for mobile BottomNavigation */}
          <Box
            sx={{
              height: { xs: 56, md: 0 },
              display: { xs: 'block', md: 'none' },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TenantLayout;
