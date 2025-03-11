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
  Alert
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
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSend = async () => {
    if (!message || selectedTenants.length === 0) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const timestamp = new Date();

      selectedTenants.forEach(tenantId => {
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant) {
          console.warn(`Tenant ${tenantId} not found, skipping notification`);
          return;
        }

        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          userId: tenant.id,          // Tenant's unique ID
          tenantId: tenant.id,        // For backward compatibility (optional)
          tenantName: tenant.name,    // For query flexibility
          message,
          type: 'info',               // Default type, can be customized
          createdAt: timestamp,
          isRead: false               // Newly sent notifications default to unread
        });
      });

      await batch.commit();
      setSnackbarMessage('Notifications sent successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      resetForm();
    } catch (error) {
      console.error('Error sending notifications:', error);
      setSnackbarMessage(`Failed to send notifications: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setSelectedTenants([]);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Send Notification</Typography>
            <Button onClick={resetForm} color="error">
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
                  {selected.map((tenantId) => {
                    const tenant = tenants.find(t => t.id === tenantId);
                    return (
                      <Chip
                        key={tenantId}
                        label={tenant?.name || 'Unknown Tenant'}
                        onDelete={() => setSelectedTenants(prev => prev.filter(id => id !== tenantId))}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Notification Message"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mt: 3 }}
            inputProps={{ maxLength: 500 }}
            helperText={`${message.length}/500 characters`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            color="primary"
            disabled={!message || selectedTenants.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
          >
            {loading ? 'Sending...' : 'Send Notifications'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(SendNotification);
