import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const TenantNotifications = ({ tenantId, tenantName }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tenantId && !tenantName) {
      setError('No tenant identifier provided');
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    let notificationsQuery;

    if (tenantName) {
      notificationsQuery = query(
        notificationsRef,
        where('tenantName', '==', tenantName),
        orderBy('createdAt', 'desc')
      );
    } else {
      notificationsQuery = query(
        notificationsRef,
        where('tenantId', '==', tenantId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setNotifications(notes);
        setLoading(false);
      },
      (err) => {
        console.error('Notification fetch error:', err);
        setError('Failed to load notifications. Please refresh the page.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenantId, tenantName]);

  // Error state handling
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600, margin: '0 auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ maxWidth: 600, margin: '0 auto' }}>
          No notifications found for {tenantName || "this tenant"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Notifications for {tenantName || "Tenant"}
      </Typography>
      
      <List sx={{ maxWidth: 800, margin: '0 auto' }}>
        {notifications.map((note) => (
          <ListItem
            key={note.id}
            sx={{
              mb: 2,
              boxShadow: 1,
              borderRadius: 2,
              bgcolor: note.type === 'alert' ? 'error.light' : 'background.paper',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateX(5px)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {note.type === 'alert' ? (
                <WarningIcon color="error" />
              ) : (
                <InfoIcon color="info" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={note.message}
              secondary={note.createdAt?.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
              secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default React.memo(TenantNotifications);