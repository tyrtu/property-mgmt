import React, { useState, useEffect } from 'react';
import { mockProperties } from '../mockData';
import { DataGrid } from '@mui/x-data-grid';
import { Card, CardContent, Typography, Button, TextField, Grid, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    units: 0,
    rentAmount: 0
  });

  const columns = [
    { field: 'name', headerName: 'Property Name', width: 200 },
    { field: 'address', headerName: 'Address', width: 250 },
    { field: 'units', headerName: 'Units', type: 'number', width: 100 },
    { field: 'status', headerName: 'Status', width: 120 }
  ];

  useEffect(() => {
    // Simulate fetching data
    setProperties(mockProperties);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate adding a new property
    const newId = properties.length + 1;
    const addedProperty = { ...newProperty, id: newId, status: 'Vacant' };
    setProperties([...properties, addedProperty]);
    setNewProperty({ name: '', address: '', units: 0, rentAmount: 0 });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Navigation Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined" component={Link} to="/dashboard">Dashboard</Button>
        <Button variant="contained" component={Link} to="/properties">Properties</Button>
        <Button variant="outlined" component={Link} to="/tenants">Tenants</Button>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        Property Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={properties}
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
                Add New Property
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Property Name"
                  fullWidth
                  margin="normal"
                  value={newProperty.name}
                  onChange={e => setNewProperty({ ...newProperty, name: e.target.value })}
                />
                <TextField
                  label="Address"
                  fullWidth
                  margin="normal"
                  value={newProperty.address}
                  onChange={e => setNewProperty({ ...newProperty, address: e.target.value })}
                />
                <TextField
                  label="Total Units"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={newProperty.units}
                  onChange={e => setNewProperty({ ...newProperty, units: e.target.value })}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Add Property
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyManagement;
