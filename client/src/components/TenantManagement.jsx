import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Button, TextField, Grid, Box,
  Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Lease Dates</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={`https://i.pravatar.cc/80?u=${tenant.id}`}>
                      {tenant.name[0]}
                    </Avatar>
                    {tenant.name}
                  </Box>
                </TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>
                  {mockProperties.find(p => p.id === tenant.propertyId)?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={tenant.paymentStatus} 
                    color={
                      tenant.paymentStatus === 'Paid' ? 'success' : 
                      tenant.paymentStatus === 'Pending' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(tenant.leaseStart).toLocaleDateString()} - {' '}
                  {new Date(tenant.leaseEnd).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button 
                    startIcon={<Edit />} 
                    onClick={() => handleEdit(tenant.id)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    startIcon={<Payment />} 
                    onClick={() => handlePayment(tenant.id)}
                    color="success"
                  >
                    Payment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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