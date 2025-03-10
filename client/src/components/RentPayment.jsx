import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Navigation from './Navigation';
import { Box, Typography, Chip } from '@mui/material';
import useAutoLogout from '../hooks/useAutoLogout'; // Import the auto-logout hook

const RentPayment = () => {
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
      </Box>
    </Box>
  );
};

export default RentPayment;