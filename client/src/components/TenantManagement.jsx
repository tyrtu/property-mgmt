import React, { useState, useEffect } from 'react';
import { mockTenants } from '../mockData';
import { DataGrid } from '@mui/x-data-grid';
import { Card, CardContent, Typography, Button, TextField, Grid, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    rentAmount: 0
  });

  const columns = [
    { field: 'name', headerName: 'Tenant Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'propertyId', headerName: 'Property ID', width: 120 },
    { field: 'rentAmount', headerName: 'Rent Amount', type: 'number', width: 150 }
  ];

  useEffect(() => {
    // Simulate fetching data
    setTenants(mockTenants);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate adding a new tenant
    const newId = tenants.length + 1;
    const addedTenant = { ...newTenant, id: newId };
    setTenants([...tenants, addedTenant]);
    setNewTenant({ name: '', email: '', phone: '', propertyId: '', rentAmount: 0 });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Navigation Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined" component={Link} to="/dashboard">Dashboard</Button>
        <Button variant="outlined" component={Link} to="/properties">Properties</Button>
        <Button variant="contained" component={Link} to="/tenants">Tenants</Button>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        Tenant Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={tenants}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </Box>
        </Grid>
        
        <Grid item xs={4}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Tenant
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Tenant Name"
                  fullWidth
                  margin="normal"
                  value={newTenant.name}
                  onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                />
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={newTenant.email}
                  onChange={e => setNewTenant({ ...newTenant, email: e.target.value })}
                />
                <TextField
                  label="Phone"
                  fullWidth
                  margin="normal"
                  value={newTenant.phone}
                  onChange={e => setNewTenant({ ...newTenant, phone: e.target.value })}
                />
                <TextField
                  label="Property ID"
                  fullWidth
                  margin="normal"
                  value={newTenant.propertyId}
                  onChange={e => setNewTenant({ ...newTenant, propertyId: e.target.value })}
                />
                <TextField
                  label="Rent Amount"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={newTenant.rentAmount}
                  onChange={e => setNewTenant({ ...newTenant, rentAmount: e.target.value })}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Add Tenant
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantManagement;
