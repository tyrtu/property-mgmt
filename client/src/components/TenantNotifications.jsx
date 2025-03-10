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
  const [validIdentifiers, setValidIdentifiers] = useState(false);

  // Validate identifiers with debounce
  useEffect(() => {
    const checkIdentifiers = () => {
      const isValid = !!tenantId || !!tenantName;
      setValidIdentifiers(isValid);
      
      if (!isValid) {
        console.warn('Missing identifiers:', { tenantId, tenantName });
      }
    };

    // Give parent component time to load data
    const timeoutId = setTimeout(checkIdentifiers, 1500);
    return () => clearTimeout(timeoutId);
  }, [tenantId, tenantName]);

  useEffect(() => {
    let unsubscribe = () => {};
    let retryTimer = null;

    const initializeConnection = async () => {
      try {
        if (!validIdentifiers) return;

        const notificationsRef = collection(db, 'notifications');
        const queryConditions = [
          orderBy('createdAt', 'desc'),
          tenantId ? where('tenantId', '==', tenantId) : where('tenantName', '==', tenantName)
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
            setError('Connection issue. Retrying...');
            retryTimer = setTimeout(() => setRetryCount(prev => prev + 1), 3000);
          }
        );
      } catch (error) {
        console.error('Initialization failed:', error);
        setError(error.message);
        retryTimer = setTimeout(() => setRetryCount(prev => prev + 1), 5000);
      }
    };

    initializeConnection();
    return () => {
      unsubscribe();
      clearTimeout(retryTimer);
    };
  }, [validIdentifiers, retryCount, tenantId, tenantName]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  };

  if (!validIdentifiers) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ maxWidth: 600, margin: '0 auto' }}>
          <Typography variant="body1" gutterBottom>
            Waiting for tenant information...
          </Typography>
          <Typography variant="body2">
            {!tenantId && !tenantName ? 'No identifiers provided' : 'Verifying identifiers'}
          </Typography>
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Alert>
      </Box>
    );
  }

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
            <Box sx={{ mt: 1, fontSize: '0.9rem' }}>
              Using identifiers: {tenantId ? `ID: ${tenantId}` : `Name: ${tenantName}`}
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            color="inherit"
            onClick={handleRetry}
            size="small"
          >
            Retry Now
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
          Loading notifications for {tenantName || `tenant ${tenantId}`}
        </Typography>
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ maxWidth: 600, margin: '0 auto' }}>
          No notifications found for {tenantName || `tenant ${tenantId}`}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Notifications for {tenantName || `Tenant ${tenantId}`}
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
  tenantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tenantName: PropTypes.string
};

TenantNotifications.defaultProps = {
  tenantId: null,
  tenantName: null
};

export default React.memo(TenantNotifications);