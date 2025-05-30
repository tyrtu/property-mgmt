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
  Switch,
  CircularProgress,
  Container,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add, Edit, Delete, Search, Apartment, Home, Hotel, MeetingRoom, LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';
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
  where,
} from 'firebase/firestore';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const [propertyDetails, setPropertyDetails] = useState({
    id: null,
    propertyNo: null,
    name: '',
    address: '',
    totalUnits: 0,
    rentAmount: 0,
    amenities: [],
    photos: [],
    status: 'Vacant',
    unitNumbers: '', // comma-separated unit numbers input
    occupiedUnits: 0, // number of occupied units (for percentage calculation)
  });

  // State for viewing full property details
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);

  // Enable auto-logout after 15 minutes of inactivity
  useAutoLogout();

  // Fetch properties from Firestore
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'properties'));
        const propertyList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProperties(propertyList);

        // Select the first property by default
        if (propertyList.length > 0) {
          handleViewDetails(propertyList[0]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
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
        // Assign a sequential property number (current count + 1)
        const propertyNo = properties.length + 1;
        // Remove the id field from propertyDetails before adding new property
        const { id, ...detailsWithoutId } = propertyDetails;
        const newPropertyData = { ...detailsWithoutId, propertyNo, occupiedUnits: 0 };

        // Add new property to Firestore (Firestore auto-generates an ID)
        const docRef = await addDoc(collection(db, 'properties'), newPropertyData);
        console.log('New property added with propertyNo:', propertyNo, 'and doc id:', docRef.id);
        setProperties([...properties, { id: docRef.id, ...newPropertyData }]);

        // Create units in the "units" subcollection if unitNumbers were provided
        if (newPropertyData.unitNumbers.trim() !== '') {
          const unitNumbersArr = newPropertyData.unitNumbers
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
          for (const unitNumber of unitNumbersArr) {
            await addDoc(collection(db, 'properties', docRef.id, 'units'), {
              number: unitNumber,
              occupied: false,
              tenantId: null,
            });
          }
        }
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

  // Delete property using its sequential propertyNo
  const handleDelete = async (propertyNo) => {
    try {
      if (!propertyNo) {
        console.error('Error: Property number is undefined or null');
        return;
      }
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
      unitNumbers: '',
      occupiedUnits: 0,
    });
  };

  // Handle array inputs (amenities and photos)
  const handleArrayInput = (field, value) => {
    setPropertyDetails((prev) => ({
      ...prev,
      [field]: value.split(',').map((item) => item.trim()),
    }));
  };

  // Handle viewing full property details (including units)
  const handleViewDetails = async (property) => {
    try {
      setLoading(true);
      let propertyId = property.id;
      // If id is not available, query by propertyNo
      if (!propertyId) {
        const q = query(collection(db, 'properties'), where('propertyNo', '==', property.propertyNo));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          propertyId = querySnapshot.docs[0].id;
        } else {
          console.error('No property found with propertyNo:', property.propertyNo);
          return;
        }
      }
      const unitsSnapshot = await getDocs(collection(db, 'properties', propertyId, 'units'));
      const unitsData = unitsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Count how many units are occupied
      const occupiedCount = unitsData.filter((unit) => unit.occupied).length;
      // If the count has changed, update the property document
      if (occupiedCount !== property.occupiedUnits) {
        await updateDoc(doc(db, 'properties', propertyId), { occupiedUnits: occupiedCount });
        property.occupiedUnits = occupiedCount;
      }
      setSelectedProperty({ ...property, id: propertyId, units: unitsData });
    } catch (error) {
      console.error('Error fetching property units:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle occupancy status of a unit
  const handleToggleOccupancy = async (unitId, isOccupied) => {
    try {
      const unitRef = doc(db, 'properties', selectedProperty.id, 'units', unitId);
      await updateDoc(unitRef, { occupied: !isOccupied });
      // Refresh the selected property details
      handleViewDetails(selectedProperty);
    } catch (error) {
      console.error('Error toggling occupancy:', error);
    }
  };

  // Data for the occupancy pie chart
  const occupancyData = selectedProperty
    ? [
        { name: 'Occupied', value: selectedProperty.occupiedUnits },
        { name: 'Vacant', value: selectedProperty.totalUnits - selectedProperty.occupiedUnits },
      ]
    : [];

  const COLORS = ['#0088FE', '#00C49F'];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: darkMode ? '#121212' : '#f5f5f5',
      pt: 0
    }}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexDirection: isXSmallScreen ? 'column' : 'row',
          gap: isXSmallScreen ? 2 : 0
        }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: darkMode ? '#fff' : '#000',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              <Apartment sx={{ verticalAlign: 'middle', mr: 1 }} />
              Properties
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {properties.length} properties • Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Add Property
            </Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: '4px solid #4CAF50'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Home color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Properties
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {properties.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                color="success"
                sx={{ height: 6, mt: 2 }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: '4px solid #2196F3'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Hotel color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Occupied Units
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {properties.reduce((acc, property) => acc + property.occupiedUnits, 0)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={properties.length > 0 ? 
                  (properties.reduce((acc, property) => acc + property.occupiedUnits, 0) / 
                  properties.reduce((acc, property) => acc + property.totalUnits, 0) * 100) : 0} 
                color="primary"
                sx={{ height: 6, mt: 2 }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: '4px solid #FFC107'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MeetingRoom color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Vacant Units
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {properties.reduce((acc, property) => acc + (property.totalUnits - property.occupiedUnits), 0)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={properties.length > 0 ? 
                  (properties.reduce((acc, property) => acc + (property.totalUnits - property.occupiedUnits), 0) / 
                  properties.reduce((acc, property) => acc + property.totalUnits, 0) * 100) : 0} 
                color="warning"
                sx={{ height: 6, mt: 2 }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: '4px solid #9C27B0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Apartment color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Units
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {properties.reduce((acc, property) => acc + property.totalUnits, 0)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                color="secondary"
                sx={{ height: 6, mt: 2 }}
              />
            </Card>
          </Grid>
        </Grid>

        {/* Property List Table */}
        <TableContainer component={Paper} sx={{ 
          backgroundColor: darkMode ? '#252525' : '#fff',
          '& .MuiTableCell-root': {
            color: darkMode ? '#fff' : 'inherit',
            borderColor: darkMode ? '#333' : 'inherit'
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: darkMode ? '#333' : '#f5f5f5',
            color: darkMode ? '#fff' : 'inherit'
          }
        }}>
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
                    {property.totalUnits > 0 ? ((property.occupiedUnits / property.totalUnits) * 100).toFixed(1) : 0}%)
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
                    <Button startIcon={<Edit />} onClick={() => handleEdit(property.id)} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button
                      startIcon={<Delete />}
                      onClick={() => handleDelete(property.propertyNo)}
                      color="error"
                      sx={{ mr: 1 }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Property Details Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, color: darkMode ? '#fff' : 'inherit' }}>Property Details</Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: darkMode ? '#aaa' : 'inherit' }}>Select Property</InputLabel>
            <Select
              value={selectedProperty ? selectedProperty.id : ''}
              onChange={(e) => {
                const property = properties.find((p) => p.id === e.target.value);
                if (property) {
                  handleViewDetails(property);
                }
              }}
              sx={{
                color: darkMode ? '#fff' : 'inherit',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#666' : 'inherit'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#888' : 'inherit'
                }
              }}
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name} (No. {property.propertyNo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedProperty ? (
            <Card sx={{ 
              p: 3, 
              borderRadius: 2,
              backgroundColor: darkMode ? '#252525' : '#fff',
              '& .MuiTypography-root': {
                color: darkMode ? '#fff' : 'inherit'
              },
              '& .MuiTableCell-root': {
                color: darkMode ? '#fff' : 'inherit',
                borderColor: darkMode ? '#333' : 'inherit'
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: darkMode ? '#333' : '#f5f5f5',
                color: darkMode ? '#fff' : 'inherit'
              }
            }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">
                    {selectedProperty.name} (No. {selectedProperty.propertyNo})
                  </Typography>
                  <Typography variant="body1">
                    Address: {selectedProperty.address}
                  </Typography>
                  <Typography variant="body1">
                    Occupancy: {selectedProperty.occupiedUnits}/{selectedProperty.totalUnits} (
                    {selectedProperty.totalUnits > 0
                      ? ((selectedProperty.occupiedUnits / selectedProperty.totalUnits) * 100).toFixed(1)
                      : 0}
                    %)
                  </Typography>
                  <Typography variant="body1">
                    Rent: ${selectedProperty.rentAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    Status: {selectedProperty.status}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Units:</Typography>
                    {selectedProperty.units && selectedProperty.units.length > 0 ? (
                      <TableContainer component={Paper} sx={{ 
                        backgroundColor: darkMode ? '#252525' : '#fff',
                        '& .MuiTableCell-root': {
                          color: darkMode ? '#fff' : 'inherit',
                          borderColor: darkMode ? '#333' : 'inherit'
                        },
                        '& .MuiTableHead-root .MuiTableCell-root': {
                          backgroundColor: darkMode ? '#333' : '#f5f5f5',
                          color: darkMode ? '#fff' : 'inherit'
                        }
                      }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Unit Number</TableCell>
                              <TableCell>Occupied</TableCell>
                              <TableCell>Toggle Occupancy</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProperty.units.map((unit) => (
                              <TableRow key={unit.id}>
                                <TableCell>{unit.number}</TableCell>
                                <TableCell>{unit.occupied ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                  <Switch
                                    checked={unit.occupied}
                                    onChange={() => handleToggleOccupancy(unit.id, unit.occupied)}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2">No units available.</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Occupancy Chart</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={occupancyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {occupancyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: '10px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Card>
          ) : (
            <Typography variant="body1">No property selected.</Typography>
          )}
        </Box>

        {/* Dialog for adding/editing property */}
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
                    setPropertyDetails({ ...propertyDetails, totalUnits: parseInt(e.target.value) })
                  }
                />
                <TextField
                  fullWidth
                  label="Rent Amount"
                  margin="normal"
                  type="number"
                  value={propertyDetails.rentAmount}
                  onChange={(e) =>
                    setPropertyDetails({ ...propertyDetails, rentAmount: parseFloat(e.target.value) })
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Units (comma-separated)"
                  margin="normal"
                  value={propertyDetails.unitNumbers}
                  onChange={(e) =>
                    setPropertyDetails({ ...propertyDetails, unitNumbers: e.target.value })
                  }
                  helperText="Enter unit numbers separated by commas, e.g., 101,102,103"
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
      </Container>
    </Box>
  );
};

export default PropertyManagement;
