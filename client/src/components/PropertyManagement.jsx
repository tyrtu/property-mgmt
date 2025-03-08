import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Button, TextField, Grid, Box, Chip, 
  Avatar, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Add, Edit, Delete, Search, Apartment } from '@mui/icons-material';
import Navigation from './Navigation';
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

  useEffect(() => {
    setProperties(mockProperties);
  }, []);

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
      <Navigation />
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Occupancy</TableCell>
              <TableCell>Rent</TableCell>
              <TableCell>Amenities</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Apartment />
                    </Avatar>
                    {property.name}
                  </Box>
                </TableCell>
                <TableCell>{property.address}</TableCell>
                <TableCell>
                  <Chip 
                    label={property.status} 
                    color={property.status === 'Occupied' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {property.occupiedUnits}/{property.totalUnits} {' '}
                  ({((property.occupiedUnits / property.totalUnits) * 100).toFixed(1)}%)
                </TableCell>
                <TableCell>${property.rentAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {property.amenities?.map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button 
                    startIcon={<Edit />} 
                    onClick={() => handleEdit(property.id)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    startIcon={<Delete />} 
                    onClick={() => handleDelete(property.id)}
                    color="error"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
                  startIcon={<Apartment />}
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