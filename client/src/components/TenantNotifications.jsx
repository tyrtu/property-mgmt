// src/components/TenantNotifications.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import path as needed

const TenantNotifications = ({ tenantName }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications for the logged-in tenant by tenantName
  useEffect(() => {
    if (!tenantName) {
      console.warn('No tenantName provided. Skipping notifications fetch.');
      setLoading(false);
      return;
    }

    console.log('Fetching notifications for tenantName:', tenantName);

    const notificationsCollection = collection(db, 'notifications');
    const notificationsQuery = query(
      notificationsCollection,
      where('tenantName', '==', tenantName),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched notifications:', notes);
        setNotifications(notes);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenantName]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Notifications
      </Typography>
      <List>
        {notifications.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            No notifications found.
          </Typography>
        ) : (
          notifications.map((note) => (
            <ListItem
              key={note.id}
              sx={{
                mb: 1,
                bgcolor: note.type === 'alert' ? 'error.light' : 'action.hover',
                borderRadius: 1,
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
                secondary={note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleDateString() : 'No date'} 
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default React.memo(TenantNotifications);
