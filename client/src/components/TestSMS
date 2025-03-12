import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { sendSMS } from '../utils/sendSMS'; // Import the sendSMS function

const TestSMS = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const handleSendSMS = async () => {
    try {
      await sendSMS(phoneNumber, message);
      alert("SMS sent successfully!");
    } catch (error) {
      alert("Failed to send SMS. Check the console for details.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Test SMS Functionality</Typography>
      <Box sx={{ maxWidth: 400, mx: 'auto' }}>
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
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleSendSMS}>
            Send SMS
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TestSMS;