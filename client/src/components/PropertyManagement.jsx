import React, { useState, useEffect } from 'react';
import { 
  DataGrid, GridActionsCellItem, GridToolbar
} from '@mui/x-data-grid';
import { 
  Card, Typography, Button, TextField, 
  Grid, Box, Chip, Avatar, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add, Edit, Delete, Search, Apartment, HomeWork 
} from '@mui/icons-material';
import { mockProperties } from '../mockData';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    id: null,
    name: '',
    address: '',
    totalUnits: 0,
    rentAmount: 0,
    amenities: [],
    photos: []
  });

  // Initialize with mock data
  useEffect(() => {
    setProperties(mockProperties);
  }, []);

  const columns = [
    { 
      field: 'photo', headerName: '', width: 80,
      renderCell: () => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Apartment />
        </Avatar>
      )
    },
    { field: 'name', headerName: 'Property Name', width: 200 },
    { field: 'address', headerName: 'Address', width: 250 },
    { 
      field: 'status', headerName: 'Status', width: 120,
      renderCell: ({ value }) => (
        <Chip 
          label={value} 
          color={value === 'Occupied' ? 'success' : 'warning'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'occupancy', headerName: 'Occupancy', width: 150,
      renderCell: ({ row }) => {
        const percentage = row.totalUnits > 0 
          ? (row.occupiedUnits / row.totalUnits * 100).toFixed(1)
          : 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{row.occupiedUnits}/{row.totalUnits}</Typography>
            <Typography variant="caption" color="text.secondary">
              ({percentage}%)
            </Typography>
          </Box>
        )
      }
    },
    { 
      field: 'rentAmount', headerName: 'Rent', width: 120,
      valueFormatter: ({ value }) => `$${value.toLocaleString()}`
    },
    { 
      field: 'amenities', headerName: 'Amenities', width: 200,
      renderCell: ({ value }) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {value.map((amenity, index) => (
            <Chip key={index} label={amenity} size="small" />
          ))}
        </Box>
      )
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
          icon={<Delete color="error" />}
          label="Delete"
          onClick={() => handleDelete(id)}
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
    if (editMode) {
      setProperties(properties.map(prop => 
        prop.id === propertyDetails.id ? propertyDetails : prop
      ));
    } else {
      setProperties([...properties, {
        ...propertyDetails,
        id: Math.max(...properties.map(p => p.id)) + 1,
        occupiedUnits: 0,
        status: 'Vacant'
      }]);
    }
    handleCloseDialog();
  };

  const handleEdit = (id) => {
    const property = properties.find(p => p.id === id);
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
      id: null,
      name: '',
      address: '',
      totalUnits: 0,
      rentAmount: 0,
      amenities: [],
      photos: []
    });
  };

  return (
    <Box sx={{ p: 3, height: '100vh' }}>
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
          <Chip 
            label={`Occupied: ${properties.filter(p => p.status === 'Occupied').length}`} 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            label={`Vacant: ${properties.filter(p => p.status === 'Vacant').length}`} 
            color="warning" 
            variant="outlined" 
          />
        </Box>
      </Card>

      <Box sx={{ height: 'calc(100vh - 240px)', width: '100%' }}>
        <DataGrid
          rows={filteredProperties}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ 
            pagination: { 
              paginationModel: { pageSize: 10 }  // Fixed missing brace
            } 
          }}
          density="compact"
          disableRowSelectionOnClick
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
                onChange={e => setPropertyDetails({
                  ...propertyDetails, 
                  totalUnits: Math.max(0, parseInt(e.target.value))
                })}
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
                onChange={e => setPropertyDetails({
                  ...propertyDetails, 
                  rentAmount: Math.max(0, parseFloat(e.target.value))
                })}
              />
              <TextField
                fullWidth
                label="Amenities (comma separated)"
                margin="normal"
                value={propertyDetails.amenities.join(', ')}
                onChange={e => setPropertyDetails({
                  ...propertyDetails, 
                  amenities: e.target.value.split(',').map(a => a.trim()).filter(a => a)
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