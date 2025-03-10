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

const TenantNotifications = ({ tenantName }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tenantName) {
      setError('No tenant name provided');
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(
      notificationsRef,
      where('tenantName', '==', tenantName),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() // Convert Firestore timestamp
        }));
        setNotifications(notes);
        setLoading(false);
      },
      (err) => {
        console.error('Notification fetch error:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenantName]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notifications for {tenantName}
      </Typography>
      
      <List sx={{ maxWidth: 800, margin: '0 auto' }}>
        {notifications.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No notifications found
          </Alert>
        ) : (
          notifications.map((note) => (
            <ListItem
              key={note.id}
              sx={{
                mb: 2,
                boxShadow: 1,
                borderRadius: 2,
                bgcolor: note.type === 'alert' ? 'error.light' : 'background.paper'
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
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default React.memo(TenantNotifications);