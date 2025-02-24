import '@mui/x-data-grid/styles.css';
import React, { useState, useEffect } from 'react';
import { 
  DataGrid, GridToolbar, GridActionsCellItem 
} from '@mui/x-data-grid';
import { 
  Card, Typography, Button, TextField, Grid, Box,
  Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputAdornment
} from '@mui/material';
import { mockTenants, mockProperties } from '../mockData';
import { PersonAdd, Edit, Payment } from '@mui/icons-material';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTenant, setCurrentTenant] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    rentAmount: '',
    leaseStart: '',
    leaseEnd: '',
    paymentStatus: 'Pending'
  });

  useEffect(() => {
    setTenants(mockTenants);
  }, []);

  const columns = [
    { 
      field: 'avatar', 
      headerName: '', 
      width: 80,
      renderCell: ({ row }) => (
        <Avatar src={`https://i.pravatar.cc/80?u=${row.id}`}>
          {row.name[0]}
        </Avatar>
      )
    },
    { field: 'name', headerName: 'Tenant Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
      field: 'property', 
      headerName: 'Property', 
      width: 180,
      valueGetter: ({ row }) => 
        mockProperties.find(p => p.id === row.propertyId)?.name || 'N/A'
    },
    { 
      field: 'paymentStatus', 
      headerName: 'Payment', 
      width: 120,
      renderCell: ({ value }) => (
        <Chip 
          label={value} 
          color={
            value === 'Paid' ? 'success' : 
            value === 'Pending' ? 'warning' : 'error'
          }
          size="small"
        />
      )
    },
    { 
      field: 'leaseDuration', 
      headerName: 'Lease', 
      width: 150,
      valueGetter: ({ row }) => {
        try {
          const start = new Date(row.leaseStart).toLocaleDateString();
          const end = new Date(row.leaseEnd).toLocaleDateString();
          return `${start} - ${end}`;
        } catch {
          return 'Invalid Date';
        }
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(id)}
        />,
        <GridActionsCellItem
          icon={<Payment />}
          label="Record Payment"
          onClick={() => handlePayment(id)}
        />
      ]
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      setTenants(tenants.map(t => 
        t.id === currentTenant.id ? currentTenant : t
      ));
    } else {
      setTenants([...tenants, {
        ...currentTenant,
        id: Math.max(...tenants.map(t => t.id), 0) + 1
      }]);
    }
    handleCloseDialog();
  };

  const handleEdit = (id) => {
    const tenant = tenants.find(t => t.id === id);
    setCurrentTenant(tenant);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handlePayment = (id) => {
    console.log('Record payment for tenant:', id);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentTenant({
      id: null,
      name: '',
      email: '',
      phone: '',
      propertyId: '',
      rentAmount: '',
      leaseStart: '',
      leaseEnd: '',
      paymentStatus: 'Pending'
    });
  };

  return (
    <Box sx={{ p: 3, height: '100vh' }}>
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

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={tenants}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          getRowId={(row) => row.id}
          initialState={{
            pagination: { 
              paginationModel: { pageSize: 10 } 
            }
          }}
          density="compact"
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editMode ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  required
                  value={currentTenant.name}
                  onChange={e => setCurrentTenant({...currentTenant, name: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  value={currentTenant.email}
                  onChange={e => setCurrentTenant({...currentTenant, email: e.target.value})}
                  sx={{ mt: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  required
                  value={currentTenant.phone}
                  onChange={e => setCurrentTenant({...currentTenant, phone: e.target.value})}
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select
                  fullWidth
                  label="Property"
                  required
                  value={currentTenant.propertyId}
                  onChange={e => setCurrentTenant({...currentTenant, propertyId: e.target.value})}
                  sx={{ mt: 0.5 }}
                >
                  {mockProperties.map(property => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  fullWidth
                  label="Rent Amount"
                  type="number"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={currentTenant.rentAmount}
                  onChange={e => setCurrentTenant({...currentTenant, rentAmount: e.target.value})}
                  sx={{ mt: 2 }}
                />
                <TextField
                  fullWidth
                  label="Lease Start"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={currentTenant.leaseStart}
                  onChange={e => setCurrentTenant({...currentTenant, leaseStart: e.target.value})}
                  sx={{ mt: 2 }}
                />
                <TextField
                  fullWidth
                  label="Lease End"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={currentTenant.leaseEnd}
                  onChange={e => setCurrentTenant({...currentTenant, leaseEnd: e.target.value})}
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button type="submit" variant="contained" onClick={handleSubmit}>
            {editMode ? 'Update Tenant' : 'Add Tenant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;