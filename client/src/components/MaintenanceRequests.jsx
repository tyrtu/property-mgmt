import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { saveAs } from 'file-saver';

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
      (snapshot) => {
        const requests = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.issue,
            property: data.property || '',
            date: data.createdAt
              ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
              : '',
            status: data.status || 'Pending',
            priority: data.priority || 'Medium',
            image: data.image || null,
            description: data.description || 'No description provided.',
          };
        });

        // Filter requests
        const filteredRequests = requests.filter((req) => {
          const matchesProperty =
            selectedProperty === 'All Properties' || req.property === selectedProperty;
          const matchesStatus =
            selectedStatus === 'All Statuses' || req.status === selectedStatus;
          const matchesPriority =
            selectedPriority === 'All Priorities' || req.priority === selectedPriority;
          const matchesSearch =
            req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.property.toLowerCase().includes(searchQuery.toLowerCase());

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
      Title: row.title,
      Property: row.property,
      Date: row.date,
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
      field: 'title',
      headerName: 'Request',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'property',
      headerName: 'Property',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params) => {
        const statusColors = {
          Pending: { color: 'orange', icon: <PendingIcon /> },
          'In Progress': { color: 'blue', icon: <InProgressIcon /> },
          Completed: { color: 'green', icon: <CompletedIcon /> },
        };
        return (
          <Select
            value={params.value}
            size="small"
            sx={{
              minWidth: 130,
              backgroundColor: statusColors[params.value]?.color + '1A',
              borderRadius: 1,
            }}
            onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          >
            <MenuItem value="Pending">
              <PendingIcon sx={{ color: 'orange', mr: 1 }} />
              Pending
            </MenuItem>
            <MenuItem value="In Progress">
              <InProgressIcon sx={{ color: 'blue', mr: 1 }} />
              In Progress
            </MenuItem>
            <MenuItem value="Completed">
              <CompletedIcon sx={{ color: 'green', mr: 1 }} />
              Completed
            </MenuItem>
          </Select>
        );
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params) => {
        const priorityColors = {
          Low: { color: 'green', icon: <ArrowDownward /> },
          Medium: { color: 'orange', icon: <ArrowDownward /> },
          High: { color: 'red', icon: <ArrowDownward /> },
        };
        return (
          <Chip
            label={params.value}
            sx={{ backgroundColor: priorityColors[params.value]?.color + '1A' }}
            size="small"
          />
        );
      },
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 160,
      renderCell: (params) =>
        params.value ? (
          <img
            src={params.value}
            alt="Maintenance issue"
            style={{
              width: 60,
              height: 60,
              borderRadius: 5,
              border: '1px solid #ddd',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Chip label="No Image" color="default" size="small" />
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <IconButton onClick={() => setViewRequest(params.row)}>
          <Visibility />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#f5f5f5' }}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3, backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#000' }}>
              Maintenance Requests
            </Typography>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Box>

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
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50]}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: darkMode ? '#333' : 'primary.light',
                  fontSize: 16,
                  color: darkMode ? '#fff' : '#000',
                },
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: darkMode ? '#1e1e1e' : 'action.hover',
                },
                color: darkMode ? '#fff' : '#000',
              }}
            />
          </Box>

          {/* Analytics and Reports */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: darkMode ? '#fff' : '#000' }}>
              Analytics and Reports
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6">Status Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {statusData.map((entry, index) => (
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
                  <Typography variant="h6">Priority Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
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
        <Dialog open={Boolean(viewRequest)} onClose={() => setViewRequest(null)} maxWidth="md" fullWidth>
          <DialogTitle>Request Details</DialogTitle>
          <DialogContent>
            <Typography variant="h6">{viewRequest.title}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Property:</strong> {viewRequest.property}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {viewRequest.date}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {viewRequest.status}
            </Typography>
            <Typography variant="body2">
              <strong>Priority:</strong> {viewRequest.priority}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Description:</strong> {viewRequest.description}
            </Typography>
            {viewRequest.image && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Image:</strong>
                </Typography>
                <img
                  src={viewRequest.image}
                  alt="Maintenance issue"
                  style={{
                    width: '100%',
                    maxHeight: 300,
                    borderRadius: 5,
                    border: '1px solid #ddd',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewRequest(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MaintenanceRequests;