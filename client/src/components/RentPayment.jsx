import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Navigation from './Navigation';
import { Box, Typography, Chip, Button, TextField } from '@mui/material';
import useAutoLogout from '../hooks/useAutoLogout'; // Import the auto-logout hook
import { sendSMS } from '../utils/sendSMS'; // Import the sendSMS function

const RentPayment = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'tenant', headerName: 'Tenant', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'dueDate', headerName: 'Due Date', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Paid' ? 'success' : 
            params.value === 'Pending' ? 'warning' : 'error'
          }
        />
      )
    }
  ];

  const rows = [
    { id: 1, tenant: 'John Doe', amount: 1200, dueDate: '2024-03-01', status: 'Paid' },
    { id: 2, tenant: 'Jane Smith', amount: 1500, dueDate: '2024-03-05', status: 'Pending' }
  ];

  // Enable auto-logout after 15 minutes of inactivity
  useAutoLogout();

  // Handler to send an SMS reminder
  const handleSendSMS = async () => {
    try {
      await sendSMS(phoneNumber, message);
      alert("SMS Reminder sent successfully!");
    } catch (error) {
      alert("Failed to send SMS reminder.");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Rent Payments</Typography>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
        {/* New Section for SMS Reminder */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Send SMS Reminder</Typography>
          <TextField
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            placeholder="Enter phone number (e.g., +1234567890)"
          />
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
            placeholder="Enter your message"
            multiline
            rows={4}
          />
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button variant="contained" color="primary" onClick={handleSendSMS}>
              Send SMS Reminder
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RentPayment;