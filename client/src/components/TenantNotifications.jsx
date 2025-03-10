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
  IconButton
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as ReadIcon,
  CircleNotifications as UnreadIcon
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const TenantNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  // Fetch tenant ID and setup real-time listener
  useEffect(() => {
    let isMounted = true;
    let unsubscribeNotifications = () => {};

    const initializeNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Authentication required');

        // Get tenant reference from user document
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) throw new Error('User profile not found');
        if (!userSnap.data().tenantId) throw new Error('Tenant association missing');

        const tenantId = userSnap.data().tenantId;
        if (!isMounted) return;

        setTenantId(tenantId);

        // Create real-time notifications query
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('tenantId', '==', tenantId),
          orderBy('createdAt', 'desc')
        );

        unsubscribeNotifications = onSnapshot(q, 
          (snapshot) => {
            const notes = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              isRead: doc.data().isRead || false
            }));
            
            if (isMounted) {
              setNotifications(notes);
              setLoading(false);
            }
          },
          (error) => {
            console.error('Notification stream error:', error);
            if (isMounted) setError('Failed to load notifications');
          }
        );

      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initializeNotifications();

    return () => {
      isMounted = false;
      unsubscribeNotifications();
    };
  }, []);

  // Mark notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          {error.includes('association') && (
            <Button sx={{ ml: 2 }} onClick={() => window.location.reload()}>
              Refresh
            </Button>
          )}
        </Alert>
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

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">No notifications available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Your Notifications
      </Typography>
      
      <List sx={{ maxWidth: 800, margin: '0 auto' }}>
        {notifications.map((note) => (
          <ListItem
            key={note.id}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: 1,
              backgroundColor: note.isRead ? 'action.hover' : 'background.paper'
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
              primary={note.message}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {note.createdAt?.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                  {note.tenantName && ` • From: ${note.tenantName}`}
                </>
              }
              primaryTypographyProps={{ fontWeight: 500 }}
            />

            {!note.isRead && (
              <IconButton 
                onClick={() => handleMarkRead(note.id)}
                color="primary"
                sx={{ ml: 2 }}
              >
                <UnreadIcon />
              </IconButton>
            )}

            {note.isRead && (
              <IconButton disabled sx={{ ml: 2 }}>
                <ReadIcon color="disabled" />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default React.memo(TenantNotifications);