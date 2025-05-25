import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './Navigation';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Container,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Grid,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  HourglassEmpty as PendingIcon,
  BuildCircle as InProgressIcon,
  CheckCircle as CompletedIcon,
  Search as SearchIcon,
  DarkMode,
  LightMode,
  ArrowDownward,
  Visibility,
  FilterList,
  Analytics,
  Delete,
  Build,
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { saveAs } from 'file-saver';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete } from '@mui/material';
import { Slider } from '@mui/material';

// Add Analytics Dialog component
const AnalyticsDialog = ({ open, onClose, data, darkMode }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: {
        bgcolor: darkMode ? '#1e1e1e' : '#fff',
        color: darkMode ? '#fff' : '#000'
      }
    }}
  >
    <DialogTitle sx={{ color: darkMode ? '#fff' : '#000' }}>
      Maintenance Analytics
    </DialogTitle>
    <DialogContent>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: darkMode ? '#333' : '#fff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>
                Response Metrics
              </Typography>
              <Typography sx={{ color: darkMode ? '#fff' : '#000' }}>
                Average Response Time: {data.averageResponseTime.toFixed(2)} hours
              </Typography>
              <Typography sx={{ color: darkMode ? '#fff' : '#000' }}>
                Resolution Rate: {data.resolutionRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: darkMode ? '#333' : '#fff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>
                Cost Analysis
              </Typography>
              {Object.entries(data.costByCategory).map(([category, cost]) => (
                <Typography key={category} sx={{ color: darkMode ? '#fff' : '#000' }}>
                  {category}: ${cost.toFixed(2)}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: darkMode ? '#333' : '#fff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>
                Resolution Time by Category
              </Typography>
              {Object.entries(data.timeToResolution).map(([category, time]) => (
                <Typography key={category} sx={{ color: darkMode ? '#fff' : '#000' }}>
                  {category}: {time.toFixed(2)} hours
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button 
        onClick={onClose}
        sx={{ color: darkMode ? '#fff' : 'primary.main' }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

// Add Filter Dialog component
const FilterDialog = ({ open, onClose, filters, onFiltersChange, darkMode }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: {
        bgcolor: darkMode ? '#1e1e1e' : '#fff',
        color: darkMode ? '#fff' : '#000'
      }
    }}
  >
    <DialogTitle sx={{ color: darkMode ? '#fff' : '#000' }}>
      Advanced Filters
    </DialogTitle>
    <DialogContent>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange[0]}
                onChange={(date) => onFiltersChange({
                  ...filters,
                  dateRange: [date, filters.dateRange[1]]
                })}
                sx={{
                  '& .MuiInputBase-root': {
                    color: darkMode ? '#fff' : '#000',
                    bgcolor: darkMode ? '#333' : '#fff'
                  }
                }}
              />
              <DatePicker
                label="End Date"
                value={filters.dateRange[1]}
                onChange={(date) => onFiltersChange({
                  ...filters,
                  dateRange: [filters.dateRange[0], date]
                })}
                sx={{
                  '& .MuiInputBase-root': {
                    color: darkMode ? '#fff' : '#000',
                    bgcolor: darkMode ? '#333' : '#fff'
                  }
                }}
              />
            </Stack>
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={['High', 'Medium', 'Low']}
            value={filters.priority}
            onChange={(_, value) => onFiltersChange({
              ...filters,
              priority: value
            })}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Priority"
                sx={{
                  '& .MuiInputBase-root': {
                    color: darkMode ? '#fff' : '#000',
                    bgcolor: darkMode ? '#333' : '#fff'
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? '#fff' : '#000'
                  }
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-tag': {
                bgcolor: darkMode ? '#555' : '#e0e0e0',
                color: darkMode ? '#fff' : '#000'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={['Plumbing', 'Electrical', 'HVAC', 'Structural', 'Other']}
            value={filters.category}
            onChange={(_, value) => onFiltersChange({
              ...filters,
              category: value
            })}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Category"
                sx={{
                  '& .MuiInputBase-root': {
                    color: darkMode ? '#fff' : '#000',
                    bgcolor: darkMode ? '#333' : '#fff'
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? '#fff' : '#000'
                  }
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-tag': {
                bgcolor: darkMode ? '#555' : '#e0e0e0',
                color: darkMode ? '#fff' : '#000'
              }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
            Cost Range
          </Typography>
          <Slider
            value={filters.costRange}
            onChange={(_, value) => onFiltersChange({
              ...filters,
              costRange: value
            })}
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            step={100}
            sx={{
              color: darkMode ? '#fff' : 'primary.main',
              '& .MuiSlider-valueLabel': {
                bgcolor: darkMode ? '#555' : '#fff',
                color: darkMode ? '#fff' : '#000'
              }
            }}
          />
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button 
        onClick={() => onFiltersChange({
          dateRange: [null, null],
          priority: [],
          category: [],
          assignedTo: [],
          status: [],
          propertyType: [],
          costRange: [0, 10000],
        })}
        sx={{ color: darkMode ? '#fff' : 'primary.main' }}
      >
        Reset
      </Button>
      <Button 
        onClick={onClose}
        sx={{ color: darkMode ? '#fff' : 'primary.main' }}
      >
        Apply
      </Button>
    </DialogActions>
  </Dialog>
);

const MaintenanceRequests = () => {
  const [rows, setRows] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('All Properties');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewRequest, setViewRequest] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Add new state variables for enhanced filtering and analytics
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: [null, null],
    priority: [],
    category: [],
    assignedTo: [],
    status: [],
    propertyType: [],
    costRange: [0, 10000],
  });

  const [analyticsData, setAnalyticsData] = useState({
    averageResponseTime: 0,
    resolutionRate: 0,
    priorityDistribution: {},
    costByCategory: {},
    timeToResolution: {},
    propertyTypeBreakdown: {},
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch properties from Firestore
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const propertiesRef = collection(db, 'properties');
        const snapshot = await getDocs(propertiesRef);
        const propertyList = snapshot.docs.map((doc) => doc.data().name);
        setProperties(propertyList);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  // Fetch maintenance requests from Firestore
  useEffect(() => {
    const maintenanceRef = collection(db, 'maintenanceRequests');
    const q = query(maintenanceRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const requests = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          
          // Fetch unit details if unitId exists
          let unitNumber = '';
          if (data.unitId) {
            try {
              const unitDoc = await getDoc(doc(db, 'units', data.unitId));
              if (unitDoc.exists()) {
                unitNumber = unitDoc.data().number || '';
              }
            } catch (error) {
              console.error('Error fetching unit details:', error);
            }
          }

          return {
            id: docSnap.id,
            issue: data.issue || '',
            propertyName: data.propertyName || '',
            unit: unitNumber || data.unit || '',
            unitId: data.unitId || '',
            tenantName: data.tenantName || '',
            status: data.status || 'Pending',
            priority: data.priority || 'Medium',
            createdAt: data.createdAt || null,
            description: data.description || 'No description provided.',
            image: data.image || null,
          };
        }));

        // Filter requests
        const filteredRequests = requests.filter((req) => {
          const matchesProperty =
            selectedProperty === 'All Properties' || req.propertyName === selectedProperty;
          const matchesStatus =
            selectedStatus === 'All Statuses' || req.status === selectedStatus;
          const matchesPriority =
            selectedPriority === 'All Priorities' || req.priority === selectedPriority;
          const matchesSearch =
            req.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.unit.toLowerCase().includes(searchQuery.toLowerCase());

          return matchesProperty && matchesStatus && matchesPriority && matchesSearch;
        });

        setRows(filteredRequests);
      },
      (error) => {
        console.error('Error fetching maintenance requests: ', error);
      }
    );

    return () => unsubscribe();
  }, [selectedProperty, selectedStatus, selectedPriority, searchQuery]);

  // Fetch audit logs
  useEffect(() => {
    const auditQuery = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(auditQuery, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setAuditLogs(logs);
    });

    return () => unsubscribe();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'maintenanceRequests', id), { status: newStatus });
      // Log the status change in the audit log
      await addDoc(collection(db, 'auditLogs'), {
        action: 'Status Updated',
        requestId: id,
        newStatus,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    const csvData = rows.map((row) => ({
      Title: row.issue,
      Property: row.propertyName,
      Date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
      Status: row.status,
      Priority: row.priority,
    }));
    const csvHeaders = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'maintenance_requests.csv');
  };

  // Data for analytics
  const statusData = [
    { name: 'Pending', value: rows.filter((row) => row.status === 'Pending').length },
    { name: 'In Progress', value: rows.filter((row) => row.status === 'In Progress').length },
    { name: 'Completed', value: rows.filter((row) => row.status === 'Completed').length },
  ];

  const priorityData = [
    { name: 'Low', value: rows.filter((row) => row.priority === 'Low').length },
    { name: 'Medium', value: rows.filter((row) => row.priority === 'Medium').length },
    { name: 'High', value: rows.filter((row) => row.priority === 'High').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  const columns = [
    {
      field: 'issue',
      headerName: 'Issue',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'propertyName',
      headerName: 'Property',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'unit',
      headerName: 'Unit No.',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'tenantName',
      headerName: 'Tenant',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
          <Select
            value={params.value}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
            size="small"
            sx={{
            minWidth: 120,
            '& .MuiSelect-select': {
              py: 0.5,
            },
          }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          </Select>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Submitted',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        try {
          if (params.value.seconds) {
            return new Date(params.value.seconds * 1000).toLocaleDateString();
          }
          if (params.value instanceof Date) {
            return params.value.toLocaleDateString();
          }
          return new Date(params.value).toLocaleDateString();
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              onClick={() => setViewRequest(params.row)}
              color="primary"
            >
          <Visibility />
        </IconButton>
          </Tooltip>
          <Tooltip title="Delete Request">
            <IconButton
              onClick={() => handleDeleteRequest(params.row.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Add filter persistence
  useEffect(() => {
    // Load saved filters from localStorage
    const savedFilters = localStorage.getItem('maintenanceFilters');
    if (savedFilters) {
      setAdvancedFilters(JSON.parse(savedFilters));
    }
  }, []);

  // Save filters when they change
  useEffect(() => {
    localStorage.setItem('maintenanceFilters', JSON.stringify(advancedFilters));
  }, [advancedFilters]);

  // Calculate analytics data
  const calculateAnalytics = useCallback((requests) => {
    const analytics = {
      averageResponseTime: 0,
      resolutionRate: 0,
      priorityDistribution: {},
      costByCategory: {},
      timeToResolution: {},
      propertyTypeBreakdown: {},
    };

    if (!requests.length) return analytics;

    // Calculate metrics
    requests.forEach(request => {
      // Priority distribution
      analytics.priorityDistribution[request.priority] = (analytics.priorityDistribution[request.priority] || 0) + 1;
      
      // Cost by category
      if (request.category) {
        analytics.costByCategory[request.category] = (analytics.costByCategory[request.category] || 0) + (request.cost || 0);
      }

      // Time to resolution
      if (request.completedAt && request.createdAt) {
        const resolutionTime = new Date(request.completedAt) - new Date(request.createdAt);
        analytics.timeToResolution[request.category] = analytics.timeToResolution[request.category] || [];
        analytics.timeToResolution[request.category].push(resolutionTime / (1000 * 60 * 60)); // Convert to hours
      }

      // Property type breakdown
      if (request.propertyType) {
        analytics.propertyTypeBreakdown[request.propertyType] = (analytics.propertyTypeBreakdown[request.propertyType] || 0) + 1;
      }
    });

    // Calculate average response time
    const completedRequests = requests.filter(r => r.completedAt);
    if (completedRequests.length) {
      const totalResponseTime = completedRequests.reduce((acc, req) => {
        return acc + (new Date(req.firstResponseAt || req.completedAt) - new Date(req.createdAt));
      }, 0);
      analytics.averageResponseTime = totalResponseTime / (completedRequests.length * 1000 * 60 * 60); // Convert to hours
    }

    // Calculate resolution rate
    analytics.resolutionRate = (completedRequests.length / requests.length) * 100;

    // Average time to resolution by category
    Object.keys(analytics.timeToResolution).forEach(category => {
      const times = analytics.timeToResolution[category];
      analytics.timeToResolution[category] = times.reduce((a, b) => a + b, 0) / times.length;
    });

    return analytics;
  }, []);

  // Apply filters to requests
  const filterRequests = useCallback((requests) => {
    return requests.filter(request => {
      // Date range filter
      if (advancedFilters.dateRange[0] && advancedFilters.dateRange[1]) {
        const requestDate = new Date(request.createdAt);
        if (requestDate < advancedFilters.dateRange[0] || requestDate > advancedFilters.dateRange[1]) {
          return false;
        }
      }

      // Priority filter
      if (advancedFilters.priority.length && !advancedFilters.priority.includes(request.priority)) {
        return false;
      }

      // Category filter
      if (advancedFilters.category.length && !advancedFilters.category.includes(request.category)) {
        return false;
      }

      // Assigned to filter
      if (advancedFilters.assignedTo.length && !advancedFilters.assignedTo.includes(request.assignedTo)) {
        return false;
      }

      // Status filter
      if (advancedFilters.status.length && !advancedFilters.status.includes(request.status)) {
        return false;
      }

      // Property type filter
      if (advancedFilters.propertyType.length && !advancedFilters.propertyType.includes(request.propertyType)) {
        return false;
      }

      // Cost range filter
      if (request.cost < advancedFilters.costRange[0] || request.cost > advancedFilters.costRange[1]) {
        return false;
      }

      return true;
    });
  }, [advancedFilters]);

  // Add new useEffect for analytics calculation
  useEffect(() => {
    if (rows.length) {
      const filteredRequests = filterRequests(rows);
      const analytics = calculateAnalytics(filteredRequests);
      setAnalyticsData(analytics);
    }
  }, [rows, filterRequests, calculateAnalytics]);

  // Add state for dialogs
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Add buttons to toolbar
  const toolbarButtons = (
    <>
      <Button
        startIcon={<FilterList />}
        onClick={() => setFilterDialogOpen(true)}
        sx={{ mr: 1 }}
      >
        Advanced Filters
      </Button>
      <Button
        startIcon={<Analytics />}
        onClick={() => setAnalyticsOpen(true)}
      >
        Analytics
      </Button>
    </>
  );

  // Update the handleDeleteRequest function
  const handleDeleteRequest = async (id) => {
    setDeleteConfirmId(id);
  };

  // Add the confirmDelete function
  const confirmDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'maintenanceRequests', id));
      // Log the deletion in audit log
      await addDoc(collection(db, 'auditLogs'), {
        action: 'Request Deleted',
        requestId: id,
        timestamp: new Date(),
      });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#f5f5f5' }}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3, backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: darkMode ? '#fff' : '#000',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Build sx={{ fontSize: '2rem' }} />
              Maintenance Requests
            </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {rows.length} requests • Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
            <Box>
              {/* Add any other header actions here */}
            </Box>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ my: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 2, 
                height: '100%',
                backgroundColor: darkMode ? '#252525' : '#fff',
                borderLeft: '4px solid #4CAF50'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Build color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Requests
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {rows.length}
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
                borderLeft: '4px solid #FFC107'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Build color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {rows.filter(row => row.status === 'Pending').length}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={rows.length > 0 ? (rows.filter(row => row.status === 'Pending').length / rows.length) * 100 : 0} 
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
                borderLeft: '4px solid #2196F3'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Build color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {rows.filter(row => row.status === 'In Progress').length}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={rows.length > 0 ? (rows.filter(row => row.status === 'In Progress').length / rows.length) * 100 : 0} 
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
                borderLeft: '4px solid #9C27B0'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Build color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {rows.filter(row => row.status === 'Completed').length}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={rows.length > 0 ? (rows.filter(row => row.status === 'Completed').length / rows.length) * 100 : 0} 
                  color="secondary"
                  sx={{ height: 6, mt: 2 }}
                />
              </Card>
            </Grid>
          </Grid>

          {/* Search & Filters */}
          <Box sx={{ display: 'flex', gap: 2, my: 3, flexDirection: isSmallScreen ? 'column' : 'row' }}>
            <TextField
              fullWidth
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: darkMode ? '#333' : '#fff' }}
            />
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: darkMode ? '#333' : '#fff', minWidth: isSmallScreen ? '100%' : 200 }}
            >
              <MenuItem value="All Properties">All Properties</MenuItem>
              {properties.map((property, index) => (
                <MenuItem key={index} value={property}>
                  {property}
                </MenuItem>
              ))}
            </Select>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: darkMode ? '#333' : '#fff', minWidth: isSmallScreen ? '100%' : 200 }}
            >
              <MenuItem value="All Statuses">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: darkMode ? '#333' : '#fff', minWidth: isSmallScreen ? '100%' : 200 }}
            >
              <MenuItem value="All Priorities">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </Box>

          {/* Data Table */}
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            {isSmallScreen ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                px: 1 // Add padding for better mobile spacing
              }}>
                {rows.map((row) => (
                  <Card 
                    key={row.id}
                    sx={{ 
                      p: 2,
                      bgcolor: darkMode ? '#1e1e1e' : '#fff',
                      '&:hover': {
                        bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5',
                      },
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: darkMode ? '#fff' : '#000',
                          flex: 1,
                          minWidth: '200px'
                        }}
                      >
                        {row.issue}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => setViewRequest(row)}
                            color="primary"
                            size="small"
                            sx={{ 
                              bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.04)',
                              '&:hover': {
                                bgcolor: darkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.08)',
                              }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Request">
                          <IconButton
                            onClick={() => handleDeleteRequest(row.id)}
                            color="error"
                            size="small"
                            sx={{ 
                              bgcolor: darkMode ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.04)',
                              '&:hover': {
                                bgcolor: darkMode ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.08)',
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#aaa' : '#666',
                            mb: 0.5
                          }}
                        >
                          Property
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#fff' : '#000',
                            fontWeight: 500
                          }}
                        >
                          {row.propertyName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#aaa' : '#666',
                            mb: 0.5
                          }}
                        >
                          Unit No.
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#fff' : '#000',
                            fontWeight: 500
                          }}
                        >
                          {row.unit}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#aaa' : '#666',
                            mb: 0.5
                          }}
                        >
                          Tenant
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#fff' : '#000',
                            fontWeight: 500
                          }}
                        >
                          {row.tenantName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#aaa' : '#666',
                            mb: 0.5
                          }}
                        >
                          Status
                        </Typography>
                        <Select
                          value={row.status}
                          onChange={(e) => handleStatusChange(row.id, e.target.value)}
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiSelect-select': {
                              py: 0.5,
                              fontSize: '0.875rem',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: darkMode ? '#555' : '#ccc',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: darkMode ? '#666' : '#999',
                            },
                          }}
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#aaa' : '#666',
                            mb: 0.5
                          }}
                        >
                          Submitted
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#fff' : '#000',
                            fontWeight: 500
                          }}
                        >
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            ) : (
              // Desktop view with DataGrid
            <DataGrid
              rows={rows}
              columns={columns}
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50]}
              autoHeight
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: darkMode ? '#333' : 'primary.light',
                  fontSize: 16,
                  color: darkMode ? '#fff' : '#000',
                  borderBottom: `1px solid ${darkMode ? '#555' : '#e0e0e0'}`,
                },
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: darkMode ? '#1e1e1e' : 'action.hover',
                },
                color: darkMode ? '#fff' : '#000',
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  lineHeight: 'normal',
                  padding: '8px',
                  borderColor: darkMode ? '#333' : '#e0e0e0',
                  backgroundColor: darkMode ? '#252525' : '#fff',
                },
                '& .MuiDataGrid-columnHeader': {
                  borderColor: darkMode ? '#333' : '#e0e0e0',
                  backgroundColor: darkMode ? '#333' : 'primary.light',
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: darkMode ? '#252525' : '#fff',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: darkMode ? '#333' : '#f5f5f5',
                  borderTop: `1px solid ${darkMode ? '#555' : '#e0e0e0'}`,
                },
              }}
            />
            )}
          </Box>

          {/* Analytics and Reports */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: darkMode ? '#fff' : '#000' }}>
              Analytics and Reports
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 2, 
                  bgcolor: darkMode ? '#1e1e1e' : '#fff',
                  '& .recharts-text': {
                    fill: darkMode ? '#fff' : '#000'
                  }
                }}>
                  <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>Status Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#333' : '#fff',
                          border: '1px solid #999',
                          color: darkMode ? '#fff' : '#000'
                        }} 
                      />
                      <Legend 
                        formatter={(value) => (
                          <span style={{ color: darkMode ? '#fff' : '#000' }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 2,
                  bgcolor: darkMode ? '#1e1e1e' : '#fff',
                  '& .recharts-text': {
                    fill: darkMode ? '#fff' : '#000'
                  }
                }}>
                  <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>Priority Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={darkMode ? '#555' : '#ccc'}
                      />
                      <XAxis 
                        dataKey="name"
                        tick={{ fill: darkMode ? '#fff' : '#000' }}
                      />
                      <YAxis 
                        tick={{ fill: darkMode ? '#fff' : '#000' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#333' : '#fff',
                          border: '1px solid #999',
                          color: darkMode ? '#fff' : '#000'
                        }}
                      />
                      <Legend 
                        formatter={(value) => (
                          <span style={{ color: darkMode ? '#fff' : '#000' }}>{value}</span>
                        )}
                      />
                      <Bar 
                        dataKey="value" 
                        fill={darkMode ? '#8884d8' : '#8884d8'}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Export Data Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<ArrowDownward />} onClick={exportToCSV}>
              Export to CSV
            </Button>
          </Box>
        </Card>
      </Container>

      {/* Request Details Modal */}
      {viewRequest && (
        <Dialog 
          open={Boolean(viewRequest)} 
          onClose={() => setViewRequest(null)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: darkMode ? '#1e1e1e' : '#fff',
              color: darkMode ? '#fff' : '#000'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid',
            borderColor: darkMode ? '#333' : '#e0e0e0',
            pb: 2
          }}>
            Request Details
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 2, 
                  bgcolor: darkMode ? '#333' : '#f5f5f5',
                  height: '100%'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
                    Basic Information
            </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Issue:</strong> {viewRequest.issue}
            </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Property:</strong> {viewRequest.propertyName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Unit:</strong> {viewRequest.unit}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tenant:</strong> {viewRequest.tenantName}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 2, 
                  bgcolor: darkMode ? '#333' : '#f5f5f5',
                  height: '100%'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
                    Status Information
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Status:</strong> {viewRequest.status}
            </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Priority:</strong> {viewRequest.priority}
            </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Submitted:</strong> {viewRequest.createdAt ? new Date(viewRequest.createdAt).toLocaleDateString() : ''}
            </Typography>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ 
                  p: 2, 
                  bgcolor: darkMode ? '#333' : '#f5f5f5'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
                    Description
                  </Typography>
                <Typography variant="body2">
                    {viewRequest.description}
                  </Typography>
                </Card>
              </Grid>
              {viewRequest.image && (
                <Grid item xs={12}>
                  <Card sx={{ 
                    p: 2, 
                    bgcolor: darkMode ? '#333' : '#f5f5f5'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
                      Attached Image
                </Typography>
                <img
                  src={viewRequest.image}
                  alt="Maintenance issue"
                  style={{
                    width: '100%',
                    maxHeight: 300,
                        borderRadius: 8,
                    objectFit: 'cover',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
                  </Card>
                </Grid>
            )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid',
            borderColor: darkMode ? '#333' : '#e0e0e0',
            pt: 2
          }}>
            <Button 
              onClick={() => handleDeleteRequest(viewRequest.id)}
              color="error"
              startIcon={<Delete />}
            >
              Delete Request
            </Button>
            <Button onClick={() => setViewRequest(null)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <FilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        darkMode={darkMode}
      />
      <AnalyticsDialog
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        data={analyticsData}
        darkMode={darkMode}
      />

      {/* Add the Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#1e1e1e' : '#fff',
            color: darkMode ? '#fff' : '#000'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: darkMode ? '#333' : '#e0e0e0',
          pb: 2
        }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to delete this maintenance request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: darkMode ? '#333' : '#e0e0e0',
          pt: 2
        }}>
          <Button 
            onClick={() => setDeleteConfirmId(null)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              confirmDelete(deleteConfirmId);
              setDeleteConfirmId(null);
            }}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceRequests;