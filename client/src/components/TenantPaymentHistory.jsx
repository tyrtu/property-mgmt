// src/components/TenantPaymentHistory.jsx
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import TenantNavigation from './TenantNavigation';

const TenantPaymentHistory = () => {
  // Dummy payment records; replace with real tenant payment data.
  const payments = [
    { id: 1, amount: 1200, dueDate: '2024-03-01', status: 'Paid' },
    { id: 2, amount: 1200, dueDate: '2024-04-01', status: 'Pending' },
    { id: 3, amount: 1200, dueDate: '2024-05-01', status: 'Upcoming' }
  ];

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
    }
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <TenantNavigation />
      <Typography variant="h4" sx={{ mb: 3 }}>
        Payment History
      </Typography>
      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={payments}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Box>
    </Box>
  );
};

export default TenantPaymentHistory;
