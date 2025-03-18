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
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    id: null,
    propertyNo: null,
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
      const propertyList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
    try {
      if (editMode) {
        // Update existing property
        const propertyRef = doc(db, 'properties', propertyDetails.id);
        await updateDoc(propertyRef, propertyDetails);
        setProperties(
          properties.map((property) =>
            property.id === propertyDetails.id ? { ...propertyDetails } : property
          )
        );
      } else {
        // Assign a sequential property number.
        // (This simply uses the current count of properties + 1.
        // In a real-world scenario, you might need a more robust solution.)
        const propertyNo = properties.length + 1;
        const newPropertyData = { ...propertyDetails, propertyNo };

        // Add new property to Firestore and let Firestore generate a document ID.
        const docRef = await addDoc(collection(db, 'properties'), newPropertyData);
        console.log('New property added with propertyNo:', propertyNo, 'and doc id:', docRef.id);
        // Update state with the new property (include the generated doc id)
        setProperties([...properties, { id: docRef.id, ...newPropertyData }]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding/updating property:', error);
    }
  };

  const handleEdit = (id) => {
    const property = properties.find((p) => p.id === id);
    if (property) {
      setPropertyDetails(property);
      setEditMode(true);
      setOpenDialog(true);
    } else {
      console.error('Property not found for editing');
    }
  };

  // Use propertyNo (the sequential property number) for deletion
  const handleDelete = async (propertyNo) => {
    try {
      if (!propertyNo) {
        console.error('Error: Property number is undefined or null');
        return;
      }
      // Query Firestore for the document with the matching propertyNo
      const q = query(collection(db, 'properties'), where('propertyNo', '==', propertyNo));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.error('No property found with property number:', propertyNo);
        return;
      }
      const docId = querySnapshot.docs[0].id;
      await deleteDoc(doc(db, 'properties', docId));
      setProperties(properties.filter((property) => property.propertyNo !== propertyNo));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setPropertyDetails({
      id: null,
      propertyNo: null,
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
                      {property.name} (No. {property.propertyNo})
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
                    {property.occupiedUnits}/{property.totalUnits} (
                    {((property.occupiedUnits / property.totalUnits) * 100).toFixed(1)}%)
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
                      onClick={() => handleDelete(property.propertyNo)}
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
                  onChange={(e) =>
                    setPropertyDetails({ ...propertyDetails, name: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Address"
                  margin="normal"
                  multiline
                  rows={3}
                  value={propertyDetails.address}
                  onChange={(e) =>
                    setPropertyDetails({ ...propertyDetails, address: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Total Units"
                  margin="normal"
                  type="number"
                  value={propertyDetails.totalUnits}
                  onChange={(e) =>
                    setPropertyDetails({
                      ...propertyDetails,
                      totalUnits: parseInt(e.target.value),
                    })
                  }
                />
                <TextField
                  fullWidth
                  label="Rent Amount"
                  margin="normal"
                  type="number"
                  value={propertyDetails.rentAmount}
                  onChange={(e) =>
                    setPropertyDetails({
                      ...propertyDetails,
                      rentAmount: parseFloat(e.target.value),
                    })
                  }
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={propertyDetails.status}
                    onChange={(e) =>
                      setPropertyDetails({ ...propertyDetails, status: e.target.value })
                    }
                  >
                    <MenuItem value="Occupied">Occupied</MenuItem>
                    <MenuItem value="Vacant">Vacant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amenities (comma-separated)"
                  margin="normal"
                  value={propertyDetails.amenities.join(', ')}
                  onChange={(e) => handleArrayInput('amenities', e.target.value)}
                  helperText="Enter amenities separated by commas, e.g., Gym, Pool, Parking"
                />
                <TextField
                  fullWidth
                  label="Photo URLs (comma-separated)"
                  margin="normal"
                  value={propertyDetails.photos.join(', ')}
                  onChange={(e) => handleArrayInput('photos', e.target.value)}
                  helperText="Enter photo URLs separated by commas"
                />
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
    </Box>
  );
};

export default PropertyManagement;
