import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import TenantNavigation from './TenantNavigation';

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
  const topBarHeight = isMobile ? 112 : 0; // Adjust if desktop has a top bar too

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <TenantNavigation onSidebarToggle={handleSidebarToggle} />

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
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            pt: `${topBarHeight}px`, // Top padding for mobile top bar
            px: 3, // Optional: horizontal padding for content spacing
          }}
        >
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
