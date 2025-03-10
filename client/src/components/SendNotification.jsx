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
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import path as needed

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
      // Save the notification to Firestore for each selected tenant
      await Promise.all(
        selectedTenants.map((tenantId) =>
          addDoc(collection(db, 'notifications'), {
            tenantId,
            message,
            createdAt: new Date(),
            isRead: false,
          })
        )
      );
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

      {/* Snackbar for success/error messages */}
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