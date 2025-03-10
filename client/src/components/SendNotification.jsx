// src/components/SendNotification.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Send, Close } from '@mui/icons-material';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

const SendNotification = ({ tenants, open, onClose }) => {
  const [message, setMessage] = useState('');
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSend = async () => {
    if (!message || selectedTenants.length === 0) return;

    setLoading(true);
    try {
      // Create a batch write operation for sending notifications atomically
      const batch = writeBatch(db);
      selectedTenants.forEach((tenantId) => {
        // Create a new document reference (with an auto-generated ID) in 'notifications' collection
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          tenantId,
          message,
          createdAt: new Date(),
          isRead: false,
        });
      });
      await batch.commit();
      setSnackbarMessage('Notifications sent successfully!');
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('Error sending notifications:', error);
      setSnackbarMessage('Failed to send notifications.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Send Notification</Typography>
            <Button onClick={onClose} color="error">
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Tenants</InputLabel>
            <Select
              multiple
              value={selectedTenants}
              onChange={(e) => setSelectedTenants(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((tenantId) => (
                    <Chip
                      key={tenantId}
                      label={tenants.find((t) => t.id === tenantId)?.name || ''}
                    />
                  ))}
                </Box>
              )}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            startIcon={<Send />}
            disabled={!message || selectedTenants.length === 0 || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default SendNotification;
