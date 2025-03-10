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
  Button
} from '@mui/material';
import { Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import PropTypes from 'prop-types';

const TenantNotifications = ({ tenantId, tenantName }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let unsubscribe = () => {};
    let retryTimer = null;

    const validateIdentifiers = () => {
      if (!tenantId && !tenantName) {
        throw new Error(
          'Missing tenant information. Component requires either tenantId or tenantName.'
        );
      }
    };

    const initializeConnection = async () => {
      try {
        validateIdentifiers();
        
        const notificationsRef = collection(db, 'notifications');
        const queryConditions = [
          orderBy('createdAt', 'desc'),
          tenantName 
            ? where('tenantName', '==', tenantName)
            : where('tenantId', '==', tenantId)
        ];

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
            setError(null);
          },
          (error) => {
            console.error('Firestore error:', error);
            setError('Connection error. Attempting to reconnect...');
            retryTimer = setTimeout(() => setRetryCount(prev => prev + 1), 5000);
          }
        );
      } catch (error) {
        console.error('Initialization error:', error.message);
        setError(error.message);
        setLoading(false);
        retryTimer = setTimeout(() => setRetryCount(prev => prev + 1), 3000);
      }
    };

    initializeConnection();

    return () => {
      unsubscribe();
      clearTimeout(retryTimer);
    };
  }, [tenantId, tenantName, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 600, 
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {error}
            <Box sx={{ mt: 1, fontSize: '0.9rem', color: 'text.secondary' }}>
              {!tenantId && !tenantName && (
                "Check if parent component is providing tenantId or tenantName prop"
              )}
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            color="inherit"
            onClick={handleRetry}
            size="small"
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        pt: 4,
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          {tenantName ? `Loading notifications for ${tenantName}` : 'Loading notifications...'}
        </Typography>
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ maxWidth: 600, margin: '0 auto' }}>
          {tenantName 
            ? `No notifications found for ${tenantName}`
            : "No notifications available"}
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

TenantNotifications.propTypes = {
  /** Tenant's unique ID from your authentication system */
  tenantId: PropTypes.string,
  /** Tenant's display name for user-friendly identification */
  tenantName: PropTypes.string
};

TenantNotifications.defaultProps = {
  tenantId: null,
  tenantName: null
};

export default React.memo(TenantNotifications);