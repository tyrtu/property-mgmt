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
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { collection, getDocs, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import SendNotification from './SendNotification';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';

// Styled badge for active lease indicator
const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]); // Filtered tenants list
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all'); // Property filter
  const [viewTenant, setViewTenant] = useState(null); // Tenant details view
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Auto logout
  useAutoLogout();

  // Fetch tenants from Firestore
  useEffect(() => {
    const tenantsQuery = query(collection(db, 'users'), where('role', '==', 'tenant'));

    const unsubscribe = onSnapshot(tenantsQuery, (snapshot) => {
      const tenantData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTenants(tenantData);
      setFilteredTenants(tenantData); // Set initial filtered list
    });

    return () => unsubscribe();
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

  // Property filtering logic
  useEffect(() => {
    let filtered = tenants;
    if (selectedProperty !== 'all') {
      filtered = tenants.filter((tenant) => tenant.propertyId === selectedProperty);
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
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={`https://i.pravatar.cc/80?u=${params.row.id}`}>
            {params.row.name[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">
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
            <Select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
              <MenuItem value="all">All Properties</MenuItem>
              <MenuItem value="property1">Property 1</MenuItem>
              <MenuItem value="property2">Property 2</MenuItem>
            </Select>
          </Box>

          {/* Data Table */}
          <DataGrid rows={filteredTenants} columns={columns} pageSize={10} />

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

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
};

export default TenantManagement;
