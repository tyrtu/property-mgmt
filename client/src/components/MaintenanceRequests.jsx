import React from 'react';
import Navigation from './Navigation';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Typography, Select, MenuItem } from '@mui/material';

const MaintenanceRequests = () => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Request', width: 200 },
    { field: 'property', headerName: 'Property', width: 150 },
    { field: 'date', headerName: 'Date', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Select
          value={params.value}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      )
    }
  ];

  const rows = [
    { id: 1, title: 'Leaky Faucet', property: 'Sunrise Apartments', date: '2024-03-01', status: 'Pending' },
    { id: 2, title: 'Broken AC', property: 'Ocean View Villas', date: '2024-03-02', status: 'In Progress' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Maintenance Requests</Typography>
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

export default MaintenanceRequests;
