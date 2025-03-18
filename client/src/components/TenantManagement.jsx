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
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Info,
  Notifications,
  MarkEmailRead,
  CheckCircle,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { collection, getDocs, onSnapshot, query, where, orderBy, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [properties, setProperties] = useState([]); // Store properties from Firebase
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [viewTenant, setViewTenant] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useAutoLogout();

  // Fetch tenants from Firestore
  useEffect(() => {
    const tenantsQuery = query(collection(db, 'users'), where('role', '==', 'tenant'));

    const unsubscribe = onSnapshot(tenantsQuery, (snapshot) => {
      const tenantData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTenants(tenantData);
      setFilteredTenants(tenantData); // Initialize filtered list
    });

    return () => unsubscribe();
  }, []);

  // Fetch properties dynamically from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertyList = propertiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name, // Ensure each property has a "name" field
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
  };

  // Success notification
  const handleNotificationSuccess = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Table columns
  const columns = [
    {
      field: 'name',
      headerName: 'Tenant',
      width: 300, // Increased width for better visibility
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={`https://i.pravatar.cc/80?u=${params.row.id}`}>
            {params.row.name[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {params.row.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'normal' }}>
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'paymentStatus', headerName: 'Payment Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="primary" onClick={() => handleViewTenant(params.row.id)}>
            View More
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleDeleteTenant(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Tenant Management Portal
          </Typography>

          {/* Search & Filter */}
          <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
            <TextField
              fullWidth
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search /> }}
            />
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Data Table */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredTenants}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
            />
          </Box>

          {/* Recent Notifications */}
          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5">
              <Notifications color="primary" /> Recently Sent Notifications
            </Typography>
            <List>
              {recentNotifications.map((note) => (
                <React.Fragment key={note.id}>
                  <ListItem>
                    <ListItemIcon>
                      {note.isRead ? <MarkEmailRead color="success" /> : <CheckCircle />}
                    </ListItemIcon>
                    <ListItemText
                      primary={note.message}
                      secondary={`Sent to ${note.tenantName} on ${note.createdAt.toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Card>
      </Container>

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
    </>
  );
};

export default TenantManagement;
