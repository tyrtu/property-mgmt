import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  Container,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Info,
  Notifications,
  MarkEmailRead,
  CheckCircle,
  DarkMode,
  LightMode,
  Send,
  Payment,
  History,
  Assignment,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { collection, getDocs, onSnapshot, query, where, orderBy, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [viewTenant, setViewTenant] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useAutoLogout();

  // Fetch tenants from Firestore
  useEffect(() => {
    const tenantsQuery = query(collection(db, 'users'), where('role', '==', 'tenant'));

    const unsubscribe = onSnapshot(tenantsQuery, (snapshot) => {
      const tenantData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTenants(tenantData);
      setFilteredTenants(tenantData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch properties dynamically from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertyList = propertiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setProperties(propertyList);
    };

    fetchProperties();
  }, []);

  // Fetch recent notifications
  useEffect(() => {
    const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isRead: doc.data().isRead || false,
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setRecentNotifications(notifications);
    });

    return () => unsubscribe();
  }, []);

  // Filter tenants based on property selection and search input
  useEffect(() => {
    let filtered = tenants;

    if (selectedProperty !== 'all') {
      filtered = filtered.filter((tenant) => tenant.propertyId === selectedProperty);
    }

    if (searchTerm) {
      filtered = filtered.filter((tenant) =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTenants(filtered);
  }, [searchTerm, selectedProperty, tenants]);

  // Fetch full tenant details when "View More" is clicked
  const handleViewTenant = async (tenantId) => {
    try {
      const tenantDoc = await getDoc(doc(db, 'users', tenantId));
      if (tenantDoc.exists()) {
        setViewTenant({ id: tenantDoc.id, ...tenantDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error);
    }
  };

  const handleCloseViewDialog = () => setViewTenant(null);

  // Delete tenant from Firestore
  const handleDeleteTenant = async (tenantId) => {
    try {
      await deleteDoc(doc(db, 'users', tenantId));
      setSnackbarMessage('Tenant deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Error deleting tenant');
      setSnackbarOpen(true);
    }
    setConfirmDelete(null);
  };

  // Confirm delete dialog
  const handleConfirmDelete = (tenantId) => {
    setConfirmDelete(tenantId);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ backgroundColor: darkMode ? '#121212' : '#f5f5f5', minHeight: '100vh' }}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3, backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#000' }}>
              Tenant Management Portal
            </Typography>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Search & Filter */}
          <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
            <TextField
              fullWidth
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search /> }}
              sx={{ backgroundColor: darkMode ? '#333' : '#fff' }}
            />
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: darkMode ? '#333' : '#fff' }}
            >
              <MenuItem value="all">All Properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Tenant Profile Cards */}
          <Grid container spacing={3}>
            {filteredTenants.map((tenant) => (
              <Grid item xs={12} sm={6} md={4} key={tenant.id}>
                <Card sx={{ p: 2, backgroundColor: darkMode ? '#333' : '#fff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={`https://i.pravatar.cc/80?u=${tenant.id}`}>
                      {tenant.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>
                        {tenant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tenant.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={tenant.paymentStatus}
                      color={
                        tenant.paymentStatus === 'Paid'
                          ? 'success'
                          : tenant.paymentStatus === 'Pending'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewTenant(tenant.id)}
                    >
                      View More
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleConfirmDelete(tenant.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Confirm Delete Dialog */}
          <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this tenant?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button onClick={() => handleDeleteTenant(confirmDelete)} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Tenant Details Dialog */}
          {viewTenant && (
            <Dialog open={Boolean(viewTenant)} onClose={handleCloseViewDialog}>
              <DialogTitle>Tenant Details</DialogTitle>
              <DialogContent>
                <Typography>Name: {viewTenant.name}</Typography>
                <Typography>Email: {viewTenant.email}</Typography>
                <Typography>Phone: {viewTenant.phone}</Typography>
                <Typography>Property ID: {viewTenant.propertyId}</Typography>
                <Typography>Rent Amount: {viewTenant.rentAmount}</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseViewDialog}>Close</Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Snackbar for Notifications */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Card>
      </Container>
    </Box>
  );
};

export default TenantManagement;