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
  InputAdornment,
  IconButton,
  Tooltip,
  Container,
  LinearProgress,
  Badge,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Payment,
  Delete,
  Search,
  CloudUpload,
  Description,
  ContactPhone,
  CalendarToday,
  Send,
  Info,
  CheckCircle,
  Notifications,
  MarkEmailRead,
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { mockTenants, mockProperties } from '../mockData';
import { styled } from '@mui/material/styles';
import SendNotification from './SendNotification'; // Import the SendNotification component
import Navigation from './Navigation'; // Import the Navigation component
import useAutoLogout from '../hooks/useAutoLogout'; // Import the auto-logout hook

// Firebase Firestore imports
import { collection, getDocs, onSnapshot, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [currentTenant, setCurrentTenant] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    emergencyContact: { name: '', relationship: '', phone: '' },
    propertyId: '',
    rentAmount: '',
    leaseStart: null,
    leaseEnd: null,
    paymentStatus: 'Pending',
    leaseDocument: null,
  });

  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    paymentDate: new Date(),
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
  });

  const [notificationOpen, setNotificationOpen] = useState(false); // State for SendNotification dialog
  const [viewTenant, setViewTenant] = useState(null); // State for viewing tenant details
  const [recentNotifications, setRecentNotifications] = useState([]); // State for recently sent notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for success message
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Success message text

  // Enable auto-logout after 15 minutes of inactivity
  useAutoLogout();

  // -------------------------------------------------------------------------
  // FIRESTORE REAL-TIME LISTENER: Fetch all tenants (role === 'tenant') from the "users" collection
  // -------------------------------------------------------------------------
  useEffect(() => {
    const tenantsCollection = collection(db, 'users');
    const tenantsQuery = query(tenantsCollection, where('role', '==', 'tenant'));

    const fetchInitialData = async () => {
      const snapshot = await getDocs(tenantsQuery);
      setTenants(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchInitialData();

    const unsubscribe = onSnapshot(tenantsQuery, (snapshot) => {
      setTenants(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------------------------
  // Fetch recently sent notifications
  // -------------------------------------------------------------------------
  useEffect(() => {
    const notificationsCollection = collection(db, 'notifications');
    const notificationsQuery = query(notificationsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setRecentNotifications(notifications);
    });

    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------------------------
  // Handlers for dialogs and form submission
  // -------------------------------------------------------------------------
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentTenant({
      id: null,
      name: '',
      email: '',
      phone: '',
      emergencyContact: { name: '', relationship: '', phone: '' },
      propertyId: '',
      rentAmount: '',
      leaseStart: null,
      leaseEnd: null,
      paymentStatus: 'Pending',
      leaseDocument: null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      setTenants(tenants.map((t) => (t.id === currentTenant.id ? currentTenant : t)));
    } else {
      setTenants([
        ...tenants,
        {
          ...currentTenant,
          id: Math.max(...tenants.map((t) => t.id), 0) + 1,
        },
      ]);
    }
    handleCloseDialog();
  };

  const handlePaymentSubmit = () => {
    setTenants(
      tenants.map((t) =>
        t.id === selectedTenant.id ? { ...t, paymentStatus: 'Paid', lastPayment: paymentDetails } : t
      )
    );
    setOpenPaymentDialog(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentTenant({ ...currentTenant, leaseDocument: file.name });
    }
  };

  const handleViewTenant = (tenant) => {
    setViewTenant(tenant);
  };

  const handleCloseViewDialog = () => {
    setViewTenant(null);
  };

  const handleEdit = (id) => {
    const tenant = tenants.find((t) => t.id === id);
    setCurrentTenant(tenant);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setTenants(tenants.filter((t) => t.id !== id));
  };

  // -------------------------------------------------------------------------
  // Success message after sending notifications
  // -------------------------------------------------------------------------
  const handleNotificationSuccess = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Tenant',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', padding: '8px 0' }}>
          <StyledBadge badgeContent={params.row.activeLease ? '✓' : '!'} color="secondary">
            <Avatar src={`https://i.pravatar.cc/80?u=${params.row.id}`}>{params.row.name[0]}</Avatar>
          </StyledBadge>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" noWrap>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: '1.2' }}>
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'property',
      headerName: 'Property',
      width: 200,
      valueGetter: (params) => {
        if (!params || !params.row || !params.row.propertyId) return '';
        const property = mockProperties.find((p) => p.id === params.row.propertyId);
        return property ? property.name : '';
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Paid' ? 'success' : params.value === 'Pending' ? 'warning' : 'error'}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'leaseDuration',
      headerName: 'Lease Duration',
      width: 200,
      valueGetter: (params) => {
        if (!params || !params.row || !params.row.leaseStart || !params.row.leaseEnd) return '';
        return `${new Date(params.row.leaseStart).toLocaleDateString()} - ${new Date(
          params.row.leaseEnd
        ).toLocaleDateString()}`;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="View Details">
              <Info color="primary" />
            </Tooltip>
          }
          onClick={() => handleViewTenant(params.row)}
          label="View"
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit">
              <Edit color="primary" />
            </Tooltip>
          }
          onClick={() => handleEdit(params.id)}
          label="Edit"
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete">
              <Delete color="error" />
            </Tooltip>
          }
          onClick={() => handleDelete(params.id)}
          label="Delete"
        />,
      ],
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Tenant Management Portal
            </Typography>
            <Button variant="contained" startIcon={<Send />} onClick={() => setNotificationOpen(true)}>
              Send Notification
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search tenants..."
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value="all" variant="outlined" sx={{ minWidth: 180 }}>
              <MenuItem value="all">All Properties</MenuItem>
              {mockProperties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={tenants}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
              disableSelectionOnClick
              components={{
                LoadingOverlay: LinearProgress,
              }}
              sx={{
                borderRadius: 2,
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 2,
                },
                '& .MuiDataGrid-cell': {
                  padding: '8px 16px',
                },
              }}
            />
          </Box>
        </Card>

        {/* Recently Sent Notifications Section */}
        <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" /> Recently Sent Notifications
          </Typography>
          <List>
            {recentNotifications.map((note) => (
              <React.Fragment key={note.id}>
                <ListItem>
                  <ListItemIcon>
                    {note.isRead ? <MarkEmailRead color="success" /> : <CheckCircle color="action" />}
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

        {/* Send Notification Dialog */}
        <SendNotification
          tenants={tenants}
          open={notificationOpen}
          onClose={() => setNotificationOpen(false)}
          onSuccess={handleNotificationSuccess} // Pass success handler
        />

        {/* Success Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default TenantManagement;