// TenantManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  DataGrid, GridToolbar, GridActionsCellItem 
} from '@mui/x-data-grid';
import { 
  Card, CardContent, Typography, Button, TextField, Grid, Box,
  Chip, Avatar, Stack, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputAdornment, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { mockTenants, mockProperties } from '../mockData';
import { LineChart } from '@mui/x-charts';
import { Edit, Delete, PersonAdd, Payment } from '@mui/icons-material';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    rentAmount: '',
    leaseStart: '',
    leaseEnd: '',
    paymentStatus: 'Pending'
  });

  const columns = [
    { 
      field: 'avatar', 
      headerName: '', 
      width: 80,
      renderCell: (params) => (
        <Avatar src={`https://i.pravatar.cc/80?u=${params.row.id}`}>
          {params.row.name[0]}
        </Avatar>
      )
    },
    { field: 'name', headerName: 'Tenant Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
      field: 'property', 
      headerName: 'Property', 
      width: 180,
      valueGetter: (params) => 
        mockProperties.find(p => p.id === params.row.propertyId)?.name
    },
    { 
      field: 'paymentStatus', 
      headerName: 'Payment', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Paid' ? 'success' : 
            params.value === 'Pending' ? 'warning' : 'error'
          }
          size="small"
        />
      )
    },
    { 
      field: 'leaseDuration', 
      headerName: 'Lease', 
      width: 150,
      valueGetter: (params) => 
        `${new Date(params.row.leaseStart).toLocaleDateString()} - 
         ${new Date(params.row.leaseEnd).toLocaleDateString()}`
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Payment />}
          label="Record Payment"
          onClick={() => handlePayment(params.row)}
        />
      ]
    }
  ];

  useEffect(() => {
    setTenants(mockTenants);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = Math.max(...tenants.map(t => t.id)) + 1;
    const addedTenant = { 
      ...newTenant, 
      id: newId,
      emergencyContact: { name: '', relationship: '', phone: '' }
    };
    setTenants([...tenants, addedTenant]);
    setNewTenant({
      name: '',
      email: '',
      phone: '',
      propertyId: '',
      rentAmount: '',
      leaseStart: '',
      leaseEnd: '',
      paymentStatus: 'Pending'
    });
    setOpenDialog(false);
  };

  const paymentHistory = tenants.flatMap(t => 
    t.paymentHistory?.map(p => ({ ...p, tenant: t.name })) || []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Tenant Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAdd />}
          onClick={() => setOpenDialog(true)}
        >
          Add Tenant
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 600 }}>
            <DataGrid
              rows={tenants}
              columns={columns}
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Payment History
            </Typography>
            <LineChart
              xAxis={[{ 
                data: paymentHistory.map(p => new Date(p.date)), 
                scaleType: 'time' 
              }]}
              series={[{
                data: paymentHistory.map(p => p.amount),
                label: 'Payments',
                color: '#4caf50'
              }]}
              height={400}
            />
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{selectedTenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({...newTenant, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  required
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  label="Property"
                  fullWidth
                  required
                  value={newTenant.propertyId}
                  onChange={(e) => setNewTenant({...newTenant, propertyId: e.target.value})}
                >
                  {mockProperties.map(property => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Rent Amount"
                  type="number"
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={newTenant.rentAmount}
                  onChange={(e) => setNewTenant({...newTenant, rentAmount: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Lease Start"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newTenant.leaseStart}
                  onChange={(e) => setNewTenant({...newTenant, leaseStart: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Lease End"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newTenant.leaseEnd}
                  onChange={(e) => setNewTenant({...newTenant, leaseEnd: e.target.value})}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button type="submit" variant="contained">Save Tenant</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;