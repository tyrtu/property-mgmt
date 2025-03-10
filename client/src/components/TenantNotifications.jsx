import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import path as needed

const TenantNotifications = ({ tenantName }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
      where('tenantName', '==', tenantName) // Filter by tenantName
    );

    // Real-time listener for notifications
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched notifications:', notes); // Debugging: Log fetched notifications
      setNotifications(notes);
      setLoading(false);
    });

    // Cleanup listener on unmount
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
                secondary={new Date(note.createdAt?.toDate()).toLocaleDateString()}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default TenantNotifications;