// src/components/TenantNotifications.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import TenantNavigation from './TenantNavigation';

const TenantNotifications = () => {
  // Dummy notifications; replace with real notifications data.
  const notifications = [
    { id: 1, title: 'Rent Reminder', date: '2024-03-28', type: 'info' },
    { id: 2, title: 'Maintenance Update', date: '2024-03-20', type: 'alert' }
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <TenantNavigation />
      <Typography variant="h4" sx={{ mb: 3 }}>
        Notifications
      </Typography>
      <List>
        {notifications.map((note) => (
          <ListItem
            key={note.id}
            sx={{
              mb: 1,
              bgcolor: note.type === 'alert' ? 'error.light' : 'action.hover',
              borderRadius: 1
            }}
          >
            <ListItemIcon>
              {note.type === 'alert' ? (
                <WarningIcon color="error" />
              ) : (
                <InfoIcon color="info" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={note.title}
              secondary={new Date(note.date).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TenantNotifications;
