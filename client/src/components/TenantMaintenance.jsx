// src/components/TenantMaintenance.jsx
import React, { useState } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText } from '@mui/material';
import TenantNavigation from './TenantNavigation';

const TenantMaintenance = () => {
  const [request, setRequest] = useState('');
  const [requests, setRequests] = useState([
    { id: 1, title: 'Broken Window', date: '2024-03-15', status: 'In Progress' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (request.trim()) {
      const newRequest = {
        id: requests.length + 1,
        title: request,
        date: new Date().toLocaleDateString(),
        status: 'Pending'
      };
      setRequests([newRequest, ...requests]);
      setRequest('');
    }
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <TenantNavigation />
      <Typography variant="h4" sx={{ mb: 3 }}>
        Maintenance Requests
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="New Request"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained">
          Submit Request
        </Button>
      </Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Your Requests
      </Typography>
      <List>
        {requests.map((req) => (
          <ListItem
            key={req.id}
            sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 1 }}
          >
            <ListItemText primary={req.title} secondary={`${req.date} - ${req.status}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TenantMaintenance;
