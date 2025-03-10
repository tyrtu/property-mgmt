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
import PropTypes from 'prop-types';

const TenantNotifications = ({ tenantId, tenantName }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchNotifications = async () => {
      try {
        if (!tenantId && !tenantName) {
          if (initialLoad) {
            // Wait 2 seconds before showing error to allow props to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!tenantId && !tenantName) {
              throw new Error('No tenant identifier provided');
            }
          } else {
            throw new Error('No tenant identifier provided');
          }
        }

        const notificationsRef = collection(db, 'notifications');
        const queryConditions = [orderBy('createdAt', 'desc')];
        
        if (tenantName) {
          queryConditions.push(where('tenantName', '==', tenantName));
        } else {
          queryConditions.push(where('tenantId', '==', tenantId));
        }

        const notificationsQuery = query(notificationsRef, ...queryConditions);

        unsubscribe = onSnapshot(
          notificationsQuery,
          (snapshot) => {
            const notes = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate()
            }));
            setNotifications(notes);
            setLoading(false);
            setInitialLoad(false);
          },
          (error) => {
            console.error('Firestore error:', error);
            setError('Failed to load notifications. Please try refreshing.');
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error:', error.message);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchNotifications();
    return () => unsubscribe();
  }, [tenantId, tenantName, initialLoad]);

  // Render states
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 600, margin: '0 auto' }}>
          {error.includes('No tenant') ? (
            <>
              Unable to load notifications. Missing tenant information.
              <Box sx={{ mt: 1, fontSize: '0.9rem' }}>
                Please check your account settings or contact support.
              </Box>
            </>
          ) : (
            error
          )}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading notifications...
        </Typography>
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ maxWidth: 600, margin: '0 auto' }}>
          {tenantName ? (
            `No notifications found for ${tenantName}`
          ) : (
            "No recent notifications found"
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        {tenantName ? `${tenantName}'s Notifications` : "Recent Notifications"}
      </Typography>
      
      <List sx={{ maxWidth: 800, margin: '0 auto' }}>
        {notifications.map((note) => (
          <NotificationListItem key={note.id} note={note} />
        ))}
      </List>
    </Box>
  );
};

// Sub-component for notification items
const NotificationListItem = ({ note }) => (
  <ListItem
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
);

TenantNotifications.propTypes = {
  tenantId: PropTypes.string,
  tenantName: PropTypes.string
};

export default React.memo(TenantNotifications);