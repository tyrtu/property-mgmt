import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
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

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <TenantNavigation onSidebarToggle={handleSidebarToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            md: `calc(100% - ${isMobile ? 0 : (sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH)}px)` 
          },
          ml: { 
            md: `${isMobile ? 0 : (sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH)}px` 
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          position: 'relative',
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          mt: { xs: '56px', md: 0 },
          mb: { xs: 0, md: 0 },
          overflow: 'auto'
        }}
      >
        <Box sx={{ 
          position: 'relative',
          zIndex: 2,
          height: '100%'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantLayout; 