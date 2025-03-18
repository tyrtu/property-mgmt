import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  Chip,
  Avatar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Search, Apartment } from '@mui/icons-material';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';
import { db } from '../firebase'; // Import Firestore
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

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
    photos: [],
    status: 'Vacant', // Default status
  });

  // Enable auto-logout after 15 minutes of inactivity
  useAutoLogout();

  // Fetch properties from Firestore
  useEffect(() => {
    const fetchProperties = async () => {
      const querySnapshot = await getDocs(collection(db, 'properties'));
      const propertyList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProperties(propertyList);
    };

    fetchProperties();
  }, []);

  const handleSearch = (e) => setSearchText(e.target.value);

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchText.toLowerCase()) ||
      property.address.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle adding/updating a property
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      const propertyRef = doc(db, 'properties', propertyDetails.id);
      await updateDoc(propertyRef, propertyDetails);
    } else {
      await addDoc(collection(db, 'properties'), propertyDetails);
    }
    handleCloseDialog();
    // Refresh the properties list
    const querySnapshot = await getDocs(collection(db, 'properties'));
    const propertyList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProperties(propertyList);
  };

  const handleEdit = (id) => {
    const property = properties.find((p) => p.id === id);
    setPropertyDetails(property);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (name) => {
    try {
      // Find the property by its name
      const propertyToDelete = properties.find((property) => property.name === name);
      
      // Check if property was found
      if (!propertyToDelete) {
        console.error('Property not found!');
        return; // Early exit if property is not found
      }

      // Delete the property from Firestore
      const propertyRef = doc(db, 'properties', propertyToDelete.id);
      await deleteDoc(propertyRef);
      
      // Update the properties state to remove the deleted property
      setProperties(properties.filter((property) => property.id !== propertyToDelete.id));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
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
      photos: [],
      status: 'Vacant',
    });
  };

  // Handle array inputs (amenities and photos)
  const handleArrayInput = (field, value) => {
    setPropertyDetails((prev) => ({
      ...prev,
      [field]: value.split(',').map((item) => item.trim()),
    }));
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Box sx={{ p: 3, height: '100vh' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Property Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
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
                ),
              }}
              value={searchText}
              onChange={handleSearch}
            />
            <Chip label={`Total: ${properties.length}`} variant="outlined" />
            <Chip
              label={`Occupied: ${properties.filter((p) => p.status === 'Occupied').length}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Vacant: ${properties.filter((p) => p.status === 'Vacant').length}`}
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
                    <Chip label={property.status} color={property.status === 'Vacant' ? 'warning' : 'success'} />
                  </TableCell>
                  <TableCell>{property.totalUnits}</TableCell>
                  <TableCell>${property.rentAmount}</TableCell>
                  <TableCell>{property.amenities.join(', ')}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(property.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(property.name)} // Pass property name to delete
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{editMode ? 'Edit Property' : 'Add Property'}</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Property Name"
                fullWidth
                value={propertyDetails.name}
                onChange={(e) => setPropertyDetails({ ...propertyDetails, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Address"
                fullWidth
                value={propertyDetails.address}
                onChange={(e) => setPropertyDetails({ ...propertyDetails, address: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Total Units"
                type="number"
                fullWidth
                value={propertyDetails.totalUnits}
                onChange={(e) =>
                  setPropertyDetails({ ...propertyDetails, totalUnits: parseInt(e.target.value, 10) })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Rent Amount"
                type="number"
                fullWidth
                value={propertyDetails.rentAmount}
                onChange={(e) =>
                  setPropertyDetails({ ...propertyDetails, rentAmount: parseFloat(e.target.value) })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Amenities (comma separated)"
                fullWidth
                value={propertyDetails.amenities.join(', ')}
                onChange={(e) => handleArrayInput('amenities', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Photos (comma separated URLs)"
                fullWidth
                value={propertyDetails.photos.join(', ')}
                onChange={(e) => handleArrayInput('photos', e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={propertyDetails.status}
                  onChange={(e) => setPropertyDetails({ ...propertyDetails, status: e.target.value })}
                >
                  <MenuItem value="Vacant">Vacant</MenuItem>
                  <MenuItem value="Occupied">Occupied</MenuItem>
                </Select>
              </FormControl>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">
                  {editMode ? 'Save Changes' : 'Add Property'}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PropertyManagement;
