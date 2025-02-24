// PropertyManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  DataGrid, GridActionsCellItem, GridToolbar, 
  GridRowModes, GridRowEditMode 
} from '@mui/x-data-grid';
import { 
  Card, CardContent, Typography, Button, TextField, 
  Grid, Box, Chip, Avatar, IconButton, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add, Edit, Delete, Search, Apartment, 
  CheckCircle, Cancel, HomeWork 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { mockProperties, mockTenants } from '../mockData';

const PropertyManagement = () => {
  const [properties, setProperties] = useState(mockProperties);
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    name: '',
    address: '',
    totalUnits: 0,
    rentAmount: 0,
    amenities: [],
    photos: []
  });

  const columns = [
    { 
      field: 'photo', headerName: '', width: 80,
      renderCell: (params) => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Apartment />
        </Avatar>
      )
    },
    { field: 'name', headerName: 'Property Name', width: 200 },
    { field: 'address', headerName: 'Address', width: 250 },
    { 
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Occupied' ? 'success' : 'warning'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'occupancy', headerName: 'Occupancy', width: 150,
      valueGetter: (params) => `${params.row.occupiedUnits}/${params.row.totalUnits}`,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            ({(params.row.occupiedUnits / params.row.totalUnits * 100).toFixed(1)}%)
          </Typography>
        </Box>
      )
    },
    { 
      field: 'rentAmount', headerName: 'Rent', width: 120,
      valueFormatter: (params) => `$${params.value.toLocaleString()}`
    },
    { 
      field: 'amenities', headerName: 'Amenities', width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {params.value.map((amenity, index) => (
            <Chip key={index} label={amenity} size="small" />
          ))}
        </Box>
      )
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
          icon={<Delete color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
        />
      ]
    }
  ];

  const handleSearch = (e) => setSearchText(e.target.value);

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchText.toLowerCase()) ||
    property.address.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProperty = {
      id: properties.length + 1,
      ...propertyDetails,
      occupiedUnits: 0,
      status: 'Vacant'
    };
    setProperties([...properties, newProperty]);
    handleCloseDialog();
  };

  const handleEdit = (property) => {
    setPropertyDetails(property);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setProperties(properties.filter(property => property.id !== id));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setPropertyDetails({
      name: '',
      address: '',
      totalUnits: 0,
      rentAmount: 0,
      amenities: [],
      photos: []
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Property Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Property
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search properties..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            value={searchText}
            onChange={handleSearch}
          />
          <Chip label={`Total: ${properties.length}`} variant="outlined" />
          <Chip label={`Occupied: ${properties.filter(p => p.status === 'Occupied').length}`} color="success" variant="outlined" />
          <Chip label={`Vacant: ${properties.filter(p => p.status === 'Vacant').length}`} color="warning" variant="outlined" />
        </Box>
      </Card>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredProperties}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          density="compact"
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Name"
                margin="normal"
                value={propertyDetails.name}
                onChange={e => setPropertyDetails({...propertyDetails, name: e.target.value})}
              />
              <TextField
                fullWidth
                label="Address"
                margin="normal"
                multiline
                rows={3}
                value={propertyDetails.address}
                onChange={e => setPropertyDetails({...propertyDetails, address: e.target.value})}
              />
              <TextField
                fullWidth
                label="Total Units"
                type="number"
                margin="normal"
                value={propertyDetails.totalUnits}
                onChange={e => setPropertyDetails({...propertyDetails, totalUnits: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rent Amount"
                type="number"
                margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                value={propertyDetails.rentAmount}
                onChange={e => setPropertyDetails({...propertyDetails, rentAmount: e.target.value})}
              />
              <TextField
                fullWidth
                label="Amenities (comma separated)"
                margin="normal"
                value={propertyDetails.amenities.join(', ')}
                onChange={e => setPropertyDetails({
                  ...propertyDetails, 
                  amenities: e.target.value.split(',').map(a => a.trim())
                })}
              />
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<HomeWork />}
                  onClick={() => {/* Implement photo upload logic */}}
                >
                  Upload Photos
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? 'Update Property' : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyManagement;