import React, { useState } from 'react';
import { Box, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const TenantPaymentHistory = () => {
  const [payments, setPayments] = useState([
    { id: 1, amount: 1200, dueDate: '2024-03-01', status: 'Paid' },
    { id: 2, amount: 1200, dueDate: '2024-04-01', status: 'Pending' },
    { id: 3, amount: 1200, dueDate: '2024-05-01', status: 'Upcoming' }
  ]);

  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleOpenPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedPayment(null);
  };

  const handleConfirmPayment = () => {
    setPayments((prevPayments) =>
      prevPayments.map((payment) =>
        payment.id === selectedPayment.id ? { ...payment, status: 'Paid' } : payment
      )
    );
    handleClosePaymentModal();
  };

  const totalOutstanding = payments.reduce((acc, payment) => {
    return payment.status !== 'Paid' ? acc + payment.amount : acc;
  }, 0);

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
      <Typography variant="h6" sx={{ mb: 2 }}>
        Total Outstanding Amount: ${totalOutstanding}
      </Typography>
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentModal}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPayment}>
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantPaymentHistory;