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
  LinearProgress,
  Warning,
  Visibility,
  PendingActions,
  Stack
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
  BarChart as BarChartIcon,
  Receipt,
  Build,
  Description,
  Email,
  Phone,
  Home,
  Apartment,
  CalendarToday,
  Money,
  CreditCard,
  Print,
  Download,
  MoreVert,
  PieChart as PieChartIcon,
  Timeline
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { collection, getDocs, onSnapshot, query, where, orderBy, doc, getDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';
import { 
  PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter
} from 'recharts';
import { format } from 'date-fns';
import { alpha } from '@mui/material/styles';
import { saveAs } from 'file-saver';

// Mock data generation for analytics
const generateMockAnalytics = () => {
  const properties = ['Sunset Villas', 'Mountain View', 'Ocean Breeze', 'Downtown Lofts'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    paymentStatus: [
      { name: 'Paid', value: Math.floor(Math.random() * 50) + 20 },
      { name: 'Pending', value: Math.floor(Math.random() * 30) + 10 },
      { name: 'Overdue', value: Math.floor(Math.random() * 20) + 5 },
    ],
    propertyPerformance: properties.map(property => ({
      name: property,
      occupancy: Math.floor(Math.random() * 80) + 20,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      maintenance: Math.floor(Math.random() * 10) + 2
    })),
    monthlyTrends: months.map((month, index) => ({
      name: month,
      paid: Math.floor(Math.random() * 30) + 10,
      pending: Math.floor(Math.random() * 20) + 5,
      overdue: Math.floor(Math.random() * 15) + 3,
      month: index
    })),
    tenantDistribution: [
      { name: '1-6 months', value: Math.floor(Math.random() * 20) + 10 },
      { name: '6-12 months', value: Math.floor(Math.random() * 15) + 8 },
      { name: '1-2 years', value: Math.floor(Math.random() * 25) + 12 },
      { name: '2+ years', value: Math.floor(Math.random() * 10) + 5 },
    ],
    maintenanceRequests: [
      { name: 'Open', value: Math.floor(Math.random() * 15) + 5 },
      { name: 'In Progress', value: Math.floor(Math.random() * 10) + 3 },
      { name: 'Completed', value: Math.floor(Math.random() * 20) + 8 },
    ]
  };
};

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
  const [analyticsData, setAnalyticsData] = useState(generateMockAnalytics());
  const [showAnalytics, setShowAnalytics] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));

  useAutoLogout();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch tenants from Firestore
  useEffect(() => {
    const tenantsQuery = query(collection(db, 'users'), where('role', '==', 'tenant'));

    const unsubscribe = onSnapshot(tenantsQuery, (snapshot) => {
      const tenantData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        paymentStatus: ['Paid', 'Pending', 'Overdue'][Math.floor(Math.random() * 3)] // Mock status for demo
      }));
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
        propertyNo: doc.data().propertyNo,
      }));
      setProperties(propertyList);
    };

    fetchProperties();
  }, []);

  // Generate mock maintenance requests
  useEffect(() => {
    const mockRequests = Array.from({ length: 10 }, (_, i) => ({
      id: `req-${i}`,
      tenant: `Tenant ${i + 1}`,
      property: `Property ${String.fromCharCode(65 + (i % 4))}`,
      issue: ['Plumbing', 'Electrical', 'HVAC', 'Structural'][i % 4],
      status: ['Open', 'In Progress', 'Completed'][i % 3],
      date: format(new Date(Date.now() - (i * 3) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      priority: ['Low', 'Medium', 'High'][i % 3]
    }));
    setMaintenanceRequests(mockRequests);
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
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.phone && tenant.phone.includes(searchTerm))
      );
    }

    setFilteredTenants(filtered);
  }, [searchTerm, selectedProperty, selectedPaymentStatus, tenants]);

  // Fetch full tenant details when "View More" is clicked
  const handleViewTenant = async (tenantId) => {
    try {
      const tenantDoc = await getDoc(doc(db, 'users', tenantId));
      if (tenantDoc.exists()) {
        setViewTenant({ 
          id: tenantDoc.id, 
          ...tenantDoc.data(),
          rentAmount: Math.floor(Math.random() * 2000) + 800, // Mock data
          leaseStart: format(new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          leaseEnd: format(new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          paymentMethod: ['Bank Transfer', 'Credit Card', 'MPESA', 'Cash'][Math.floor(Math.random() * 4)],
          lastPayment: format(new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        });
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    switch (action) {
      case 'sendNotification':
        setSnackbarMessage(`Notifications sent to ${selectedTenants.length} tenants`);
        setSnackbarOpen(true);
        break;
      case 'updatePaymentStatus':
        setSnackbarMessage(`Payment status updated for ${selectedTenants.length} tenants`);
        setSnackbarOpen(true);
        break;
      case 'exportData':
        exportTenantData();
        break;
      default:
        break;
    }
  };

  // Export tenant data to CSV
  const exportTenantData = () => {
    const dataToExport = filteredTenants.map(tenant => ({
      Name: tenant.name,
      Email: tenant.email,
      Phone: tenant.phone || '',
      Property: properties.find(p => p.id === tenant.propertyId)?.name || tenant.propertyId,
      'Payment Status': tenant.paymentStatus,
      'Rent Amount': `$${tenant.rentAmount || ''}`
    }));

    const csvHeaders = Object.keys(dataToExport[0]).join(',');
    const csvRows = dataToExport.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `tenants_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    setSnackbarMessage('Tenant data exported successfully');
    setSnackbarOpen(true);
  };

  // Columns for DataGrid
  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
      renderCell: (params) => (
        <Badge 
          color="primary" 
          badgeContent={params.row.lastReminder ? '!' : null}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {params.value}
        </Badge>
      )
    },
    { 
      field: 'name', 
      headerName: 'Tenant', 
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.unit || 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Email fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Phone fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
          {params.value || 'N/A'}
        </Box>
      )
    },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const getIcon = () => {
          switch(params.value) {
            case 'Paid': return <CheckCircle fontSize="small" />;
            case 'Pending': return <PendingActions fontSize="small" />;
            case 'Overdue': return <Warning fontSize="small" />;
            default: return <MoreVert fontSize="small" />;
          }
        };
        
        return (
          <Chip
            label={params.value}
            icon={getIcon()}
            color={
              params.value === 'Paid' ? 'success' :
              params.value === 'Pending' ? 'warning' : 'error'
            }
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'propertyId',
      headerName: 'Property',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Home fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
          {properties.find(p => p.id === params.value)?.name || params.value}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton onClick={() => handleViewTenant(params.row.id)} size="small">
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Notification">
            <IconButton size="small">
              <Email fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              onClick={() => handleConfirmDelete(params.row.id)} 
              size="small"
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Custom toolbar for DataGrid
  const CustomToolbar = () => (
    <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      <Button
        variant="contained"
        startIcon={<Send />}
        onClick={() => handleBulkAction('sendNotification')}
        disabled={selectedTenants.length === 0}
        size="small"
      >
        Notify
      </Button>
      <Button
        variant="contained"
        startIcon={<Payment />}
        onClick={() => handleBulkAction('updatePaymentStatus')}
        disabled={selectedTenants.length === 0}
        size="small"
      >
        Update Status
      </Button>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={() => handleBulkAction('exportData')}
        size="small"
      >
        Export
      </Button>
      <Button
        variant="outlined"
        startIcon={<Print />}
        onClick={() => window.print()}
        size="small"
      >
        Print
      </Button>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      color: darkMode ? '#fff' : 'text.primary'
    }}>
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
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
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              <Group sx={{ verticalAlign: 'middle', mr: 1 }} />
              Tenant Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {filteredTenants.length} tenants • Last updated: {format(new Date(), 'MMM dd, yyyy h:mm a')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="contained" startIcon={<Group />}>
              Add Tenant
            </Button>
          </Box>
        </Box>

        {/* Filters Section */}
        <Card sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
          boxShadow: theme.shadows[3]
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2,
            flexDirection: isXSmallScreen ? 'column' : 'row',
            alignItems: isXSmallScreen ? 'stretch' : 'center'
          }}>
            <TextField
              fullWidth
              placeholder="Search tenants, emails, phones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />
              }}
              size="small"
              sx={{ flex: 2 }}
            />
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 180, flex: 1 }}
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
              size="small"
              sx={{ minWidth: 180, flex: 1 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </Box>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: '4px solid #4CAF50'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Group color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Tenants
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {tenants.length}
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
                <CheckCircle color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Paid Tenants
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {tenants.filter(t => t.paymentStatus === 'Paid').length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={tenants.length > 0 ? 
                  (tenants.filter(t => t.paymentStatus === 'Paid').length / tenants.length * 100) : 0} 
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
                <PendingActions color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Payments
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {tenants.filter(t => t.paymentStatus === 'Pending').length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={tenants.length > 0 ? 
                  (tenants.filter(t => t.paymentStatus === 'Pending').length / tenants.length * 100) : 0} 
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
              borderLeft: '4px solid #F44336'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Overdue Payments
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {tenants.filter(t => t.paymentStatus === 'Overdue').length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={tenants.length > 0 ? 
                  (tenants.filter(t => t.paymentStatus === 'Overdue').length / tenants.length * 100) : 0} 
                color="error"
                sx={{ height: 6, mt: 2 }}
              />
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Data Table */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#1e1e1e' : '#fff'
            }}>
              <Box sx={{ height: 600 }}>
                <DataGrid
                  rows={filteredTenants}
                  columns={columns}
                  slots={{ 
                    toolbar: () => <CustomToolbar />,
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  checkboxSelection
                  onRowSelectionModelChange={(newSelection) => setSelectedTenants(newSelection)}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: darkMode ? '#333' : 'primary.main',
                      color: '#fff',
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottomColor: darkMode ? '#333' : 'divider',
                      color: darkMode ? '#fff' : 'text.primary'
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: darkMode ? alpha('#333', 0.5) : 'action.hover',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTopColor: darkMode ? '#333' : 'divider',
                      backgroundColor: darkMode ? '#333' : 'background.default'
                    },
                    '& .MuiCheckbox-root': {
                      color: darkMode ? '#fff' : undefined,
                    },
                  }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Analytics Section */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#1e1e1e' : '#fff'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6">
                  <BarChartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Tenant Analytics
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAnalytics}
                      onChange={() => setShowAnalytics(!showAnalytics)}
                      color="primary"
                    />
                  }
                  label="Show"
                  sx={{ m: 0 }}
                />
              </Box>

              {showAnalytics && (
                <>
                  {/* Payment Status Distribution */}
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Payment Status
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData.paymentStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.paymentStatus.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke={darkMode ? '#1e1e1e' : '#fff'}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: darkMode ? '#333' : '#fff',
                          borderColor: darkMode ? '#555' : '#ddd',
                          borderRadius: 4,
                          color: darkMode ? '#fff' : '#333'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Property Performance */}
                  <Typography variant="subtitle2" sx={{ mt: 3 }}>
                    Property Occupancy
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analyticsData.propertyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
                      <XAxis 
                        dataKey="name" 
                        stroke={darkMode ? '#fff' : '#666'} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke={darkMode ? '#fff' : '#666'} />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: darkMode ? '#333' : '#fff',
                          borderColor: darkMode ? '#555' : '#ddd',
                          borderRadius: 4,
                          color: darkMode ? '#fff' : '#333'
                        }}
                      />
                      <Bar 
                        dataKey="occupancy" 
                        fill="#8884d8" 
                        name="Occupancy %"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Maintenance Requests */}
                  <Typography variant="subtitle2" sx={{ mt: 3 }}>
                    Maintenance Requests
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData.maintenanceRequests}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.maintenanceRequests.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index + 2 % COLORS.length]} 
                            stroke={darkMode ? '#1e1e1e' : '#fff'}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: darkMode ? '#333' : '#fff',
                          borderColor: darkMode ? '#555' : '#ddd',
                          borderRadius: 4,
                          color: darkMode ? '#fff' : '#333'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Analytics Section */}
        <Card sx={{ 
          mt: 3, 
          p: 2,
          backgroundColor: darkMode ? '#1e1e1e' : '#fff'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <Timeline sx={{ verticalAlign: 'middle', mr: 1 }} />
            Payment Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={analyticsData.monthlyTrends}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
              <XAxis 
                dataKey="name" 
                stroke={darkMode ? '#fff' : '#666'} 
              />
              <YAxis stroke={darkMode ? '#fff' : '#666'} />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  borderColor: darkMode ? '#555' : '#ddd',
                  borderRadius: 4,
                  color: darkMode ? '#fff' : '#333'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="paid" 
                stackId="1"
                stroke="#4CAF50" 
                fill="#4CAF50" 
                fillOpacity={0.2} 
                name="Paid"
              />
              <Area 
                type="monotone" 
                dataKey="pending" 
                stackId="1"
                stroke="#FFC107" 
                fill="#FFC107" 
                fillOpacity={0.2} 
                name="Pending"
              />
              <Area 
                type="monotone" 
                dataKey="overdue" 
                stackId="1"
                stroke="#F44336" 
                fill="#F44336" 
                fillOpacity={0.2} 
                name="Overdue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Tenant Details Dialog */}
        {viewTenant && (
          <Dialog 
            open={Boolean(viewTenant)} 
            onClose={handleCloseViewDialog} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: darkMode ? '#252525' : '#fff'
              }
            }}
          >
            <DialogTitle sx={{ 
              backgroundColor: darkMode ? '#333' : 'primary.main',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              Tenant Details
              <Chip
                label={viewTenant.paymentStatus}
                color={
                  viewTenant.paymentStatus === 'Paid' ? 'success' :
                  viewTenant.paymentStatus === 'Pending' ? 'warning' : 'error'
                }
                sx={{ color: '#fff' }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Personal Information</strong>
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography>{viewTenant.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Contact Information
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" />
                        <Typography>{viewTenant.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" />
                        <Typography>{viewTenant.phone || 'N/A'}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Identification
                      </Typography>
                      <Typography>ID: {viewTenant.idNumber || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Lease Information</strong>
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Property
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Home fontSize="small" />
                        <Typography>
                          {properties.find(p => p.id === viewTenant.propertyId)?.name || viewTenant.propertyId}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Lease Period
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" />
                        <Typography>
                          {viewTenant.leaseStart} to {viewTenant.leaseEnd}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Rent Amount
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Money fontSize="small" />
                        <Typography>${viewTenant.rentAmount || 'N/A'}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCard fontSize="small" />
                        <Typography>{viewTenant.paymentMethod || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Grid>
                {viewTenant.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Additional Notes</strong>
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography>{viewTenant.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              backgroundColor: darkMode ? '#333' : 'background.default',
              p: 2
            }}>
              <Button 
                onClick={handleCloseViewDialog}
                color="inherit"
              >
                Close
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Email />}
              >
                Send Message
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Receipt />}
                sx={{ ml: 1 }}
              >
                Generate Receipt
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Confirm Delete Dialog */}
        <Dialog 
          open={Boolean(confirmDelete)} 
          onClose={() => setConfirmDelete(null)}
          PaperProps={{
            sx: {
              backgroundColor: darkMode ? '#252525' : '#fff'
            }
          }}
        >
          <DialogTitle sx={{ color: darkMode ? '#fff' : '#000' }}>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: darkMode ? '#fff' : '#000' }}>
              Are you sure you want to delete this tenant? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDelete(null)}
              sx={{ color: darkMode ? '#fff' : '#000' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleDeleteTenant(confirmDelete)} 
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="success"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default TenantManagement;