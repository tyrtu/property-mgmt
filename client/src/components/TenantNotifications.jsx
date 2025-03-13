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
  Button,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  NotificationsActive as BellIcon
} from '@mui/icons-material';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const TenantNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up real-time listener for notifications
  useEffect(() => {
    let isMounted = true;
    let unsubscribeNotifications = () => {};

    const initializeNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Authentication required');

        const userId = user.uid;
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
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

  // Handler to mark a notification as read in Firestore
  const handleMarkRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  // Component for each notification item
  const NotificationItem = ({ note, onMarkRead }) => {
    const [expanded, setExpanded] = useState(false);

    const handleToggleDetails = async () => {
      // When opening details, mark as read if not already
      if (!expanded && !note.isRead) {
        await onMarkRead(note.id);
      }
      setExpanded(prev => !prev);
    };

    return (
      <Box sx={{ mb: 2, borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
        <ListItem
          sx={{
            backgroundColor: note.isRead ? 'action.hover' : 'background.paper',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'scale(1.01)',
              boxShadow: note.isRead ? 2 : 4,
            },
            py: 2,
            px: 2,
          }}
        >
          <ListItemIcon>
            {note.type === 'alert' ? (
              <WarningIcon color="error" sx={{ fontSize: 30 }} />
            ) : (
              <InfoIcon color="info" sx={{ fontSize: 30 }} />
            )}
          </ListItemIcon>

          <ListItemText
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {expanded
                  ? note.message
                  : note.message.length > 50
                    ? note.message.substring(0, 50) + '...'
                    : note.message}
              </Typography>
            }
            secondary={
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
            }
          />

          <Button variant="outlined" onClick={handleToggleDetails} sx={{ ml: 2 }}>
            {expanded ? 'Hide Details' : 'See Details'}
          </Button>
        </ListItem>
        <Divider />
      </Box>
    );
  };

  // Placeholder for when there are no notifications
  const NoNotificationsPlaceholder = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        boxShadow: 1,
        maxWidth: 600,
        margin: '0 auto',
        mt: 4,
      }}
    >
      <BellIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        No Notifications Yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        You're all caught up! When new notifications arrive, they'll appear here.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </Box>
  );

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button sx={{ ml: 2 }} onClick={() => window.location.reload()}>
            Refresh
          </Button>
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <BellIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
        <Typography variant="h4" component="h1">
          Your Notifications
        </Typography>
      </Box>
      
      {notifications.length === 0 ? (
        <NoNotificationsPlaceholder />
      ) : (
        <List sx={{ maxWidth: 800, margin: '0 auto' }}>
          {notifications.map((note) => (
            <NotificationItem key={note.id} note={note} onMarkRead={handleMarkRead} />
          ))}
        </List>
      )}
    </Box>
  );
};

export default React.memo(TenantNotifications);
