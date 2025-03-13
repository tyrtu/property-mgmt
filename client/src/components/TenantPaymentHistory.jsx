import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// Updated API URL to your new Ngrok URL:
const API_BASE_URL = "https://e1c5-102-0-11-254.ngrok-free.app";

const TenantPaymentHistory = () => {
  const [payments, setPayments] = useState([
    { id: 1, amount: 1200, dueDate: '2024-03-01', status: 'Paid' },
    { id: 2, amount: 1200, dueDate: '2024-04-01', status: 'Pending' },
    { id: 3, amount: 1200, dueDate: '2024-05-01', status: 'Upcoming' }
  ]);
  
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleOpenPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setMessage("");
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedPayment(null);
    setLoading(false);
  };

  // Integrated STK Push function that calls your backend
  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    
    setLoading(true);
    setMessage("");

    try {
      // For testing, we are always using a fixed amount ("100")
      const response = await axios.post(`${API_BASE_URL}/stkpush`, {
        amount: "100",
        phone: "254708374149", // Replace with dynamic user phone number if needed
        accountReference: `TenantPayment-${selectedPayment.id}`
      });

      console.log("STK Push response:", response.data);
      setMessage("STK Push Sent! Check your phone.");

      // Optionally, update the payment status to "Paid"
      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          payment.id === selectedPayment.id ? { ...payment, status: "Paid" } : payment
        )
      );
    } catch (error) {
      console.error("Error during STK push:", error);
      setMessage("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => `$${params.value}`
    },
    { field: 'dueDate', headerName: 'Due Date', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Paid'
              ? 'success'
              : params.value === 'Pending'
              ? 'warning'
              : 'default'
          }
        />
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => {
        if (params.row.status === 'Paid') return null;
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleOpenPaymentModal(params.row)}
          >
            Pay Now
          </Button>
        );
      }
    }
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Payment History
      </Typography>
      {/* Removed Total Outstanding Amount display */}
      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={payments}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Box>

      <Dialog open={openPaymentModal} onClose={handleClosePaymentModal}>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <>
              <Typography variant="body1">
                <strong>Amount:</strong> ${selectedPayment.amount}
              </Typography>
              <Typography variant="body1">
                <strong>Due Date:</strong> {selectedPayment.dueDate}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {selectedPayment.status}
              </Typography>
              <TextField label="Payment Method" fullWidth margin="normal" />
              {message && (
                <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                  {message}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentModal}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPayment} disabled={loading}>
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantPaymentHistory;
