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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
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
  FilterList,
  Group,
  BarChart,
  Receipt,
  Build,
  Description,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { collection, getDocs, onSnapshot, query, where, orderBy, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [viewTenant, setViewTenant] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
        propertyNo: doc.data().propertyNo, // Ensure propertyNo is fetched
      }));
      setProperties(propertyList);
    };

    fetchProperties();
  }, []);

  // Filter tenants based on property selection, payment status, and search input
  useEffect(() => {
    let filtered = tenants;

    if (selectedProperty !== 'all') {
      filtered = filtered.filter(
        (tenant) =>
          tenant.propertyId === selectedProperty || tenant.propertyNo === selectedProperty
      );
    }

    if (selectedPaymentStatus !== 'all') {
      filtered = filtered.filter((tenant) => tenant.paymentStatus === selectedPaymentStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter((tenant) =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTenants(filtered);
  }, [searchTerm, selectedProperty, selectedPaymentStatus, tenants]);

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
      // Log the deletion in the audit log
      await addDoc(collection(db, 'auditLogs'), {
        action: 'Tenant Deleted',
        tenantId,
        timestamp: new Date(),
      });
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

  // Handle bulk actions
  const handleBulkAction = (action) => {
    switch (action) {
      case 'sendNotification':
        // Implement notification logic
        setSnackbarMessage('Notifications sent to selected tenants');
        setSnackbarOpen(true);
        break;
      case 'updatePaymentStatus':
        // Implement payment status update logic
        setSnackbarMessage('Payment status updated for selected tenants');
        setSnackbarOpen(true);
        break;
      default:
        break;
    }
  };

  // Data for analytics
  const paymentData = [
    { name: 'Paid', value: tenants.filter((t) => t.paymentStatus === 'Paid').length },
    { name: 'Pending', value: tenants.filter((t) => t.paymentStatus === 'Pending').length },
    { name: 'Overdue', value: tenants.filter((t) => t.paymentStatus === 'Overdue').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

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
          <Box sx={{ display: 'flex', gap: 2, my: 3, flexDirection: isSmallScreen ? 'column' : 'row' }}>
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
              sx={{ backgroundColor: darkMode ? '#333' : '#fff', minWidth: isSmallScreen ? '100%' : 200 }}
            >
              <MenuItem value="all">All Properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name} (No. {property.propertyNo})
                </MenuItem>
              ))}
            </Select>
            <Select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: darkMode ? '#333' : '#fff', minWidth: isSmallScreen ? '100%' : 200 }}
            >
              <MenuItem value="all">All Payment Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </Box>

          {/* Bulk Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: isSmallScreen ? 'column' : 'row' }}>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => handleBulkAction('sendNotification')}
              sx={{ height: isSmallScreen ? 'auto' : 40 }}
            >
              Send Notification
            </Button>
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={() => handleBulkAction('updatePaymentStatus')}
              sx={{ height: isSmallScreen ? 'auto' : 40 }}
            >
              Update Payment Status
            </Button>
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

          {/* Analytics and Reports */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: darkMode ? '#fff' : '#000' }}>
              Analytics and Reports
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6">Payment Status</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6">Maintenance Requests</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={maintenanceRequests}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="createdAt" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="status" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>

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