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
} from '@mui/material';
import { Send, Close } from '@mui/icons-material';

const SendNotification = ({ tenants, open, onClose }) => {
  const [message, setMessage] = useState('');
  const [selectedTenants, setSelectedTenants] = useState([]);

  const handleSend = () => {
    // Logic to send the notification (e.g., API call)
    console.log('Sending notification to:', selectedTenants);
    console.log('Message:', message);
    onClose();
  };

  return (
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
          disabled={!message || selectedTenants.length === 0}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendNotification;