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
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const TenantNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const fetchTenantData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated.');

        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) throw new Error('Tenant data not found.');
        
        const userData = userSnap.data();
        if (!userData.tenantId) throw new Error('User not associated with a tenant.');

        if (isMounted) {
          setTenantId(userData.tenantId);
          setTenantName(userData.name || 'Tenant');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchTenantData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setNotifications(notes);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setError(error.message || 'Failed to load notifications.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenantId]);

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
        <Alert severity="info">No notifications found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Notifications for {tenantName}
      </Typography>
      <List sx={{ maxWidth: 800, margin: '0 auto' }}>
        {notifications.map(note => (
          <ListItem key={note.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
            <ListItemIcon>
              {note.type === 'alert' ? <WarningIcon color="error" /> : <InfoIcon color="info" />}
            </ListItemIcon>
            <ListItemText
              primary={note.message}
              secondary={note.createdAt?.toLocaleString() || 'Date not available'}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TenantNotifications;