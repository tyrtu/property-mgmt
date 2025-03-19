import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Select,
  MenuItem,
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
  DarkMode,
  LightMode,
  ArrowDownward,
  Visibility,
  CheckCircle,
  Send,
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Mock data for rent payments
const mockPayments = [
  { id: 1, tenant: 'John Doe', amount: 1200, dueDate: '2024-03-01', status: 'Paid', property: 'Property A' },
  { id: 2, tenant: 'Jane Smith', amount: 1500, dueDate: '2024-03-05', status: 'Pending', property: 'Property B' },
  { id: 3, tenant: 'Alice Johnson', amount: 1300, dueDate: '2024-03-10', status: 'Overdue', property: 'Property C' },
  { id: 4, tenant: 'Bob Brown', amount: 1400, dueDate: '2024-03-15', status: 'Paid', property: 'Property A' },
];

// Mock data for properties
const mockProperties = ['Property A', 'Property B', 'Property C'];

const RentPayment = () => {
  const [rows, setRows] = useState(mockPayments);
  const [filteredRows, setFilteredRows] = useState(mockPayments);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewPayment, setViewPayment] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Filter payments based on status, property, and search query
  useEffect(() => {
    let filtered = rows;

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((row) => row.status === selectedStatus);
    }

    if (selectedProperty !== 'All') {
      filtered = filtered.filter((row) => row.property === selectedProperty);
    }

    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.tenant.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRows(filtered);
  }, [selectedStatus, selectedProperty, searchQuery, rows]);

  // Handle bulk actions
  const handleBulkAction = (action) => {
    switch (action) {
      case 'markAsPaid':
        const updatedRows = rows.map((row) =>
          selectedRows.includes(row.id) ? { ...row, status: 'Paid' } : row
        );
        setRows(updatedRows);
        setSelectedRows([]);
        break;
      default:
        break;
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    const csvData = filteredRows.map((row) => ({
      Tenant: row.tenant,
      Amount: row.amount,
      'Due Date': row.dueDate,
      Status: row.status,
      Property: row.property,
    }));
    const csvHeaders = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'rent_payments.csv');
  };

  // Data for analytics
  const statusData = [
    { name: 'Paid', value: filteredRows.filter((row) => row.status === 'Paid').length },
    { name: 'Pending', value: filteredRows.filter((row) => row.status === 'Pending').length },
    { name: 'Overdue', value: filteredRows.filter((row) => row.status === 'Overdue').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'tenant', headerName: 'Tenant', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'dueDate', headerName: 'Due Date', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Paid' ? 'success' :
            params.value === 'Pending' ? 'warning' : 'error'
          }
        />
      ),
    },
    {
      field: 'property',
      headerName: 'Property',
      width: 160,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <IconButton onClick={() => setViewPayment(params.row)}>
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
              Rent Payments
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
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ backgroundColor: darkMode ? '#333' : '#fff' }}
            />
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: darkMode ? '#333' : '#fff', minWidth: isSmallScreen ? '100%' : 200 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              displayEmpty
              sx={{ backgroundColor: darkMode ? '#333' : '#fff', minWidth: isSmallScreen ? '100%' : 200 }}
            >
              <MenuItem value="All">All Properties</MenuItem>
              {mockProperties.map((property, index) => (
                <MenuItem key={index} value={property}>
                  {property}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Bulk Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => handleBulkAction('markAsPaid')}
              disabled={selectedRows.length === 0}
            >
              Mark as Paid
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => handleBulkAction('sendReminder')}
              disabled={selectedRows.length === 0}
            >
              Send Reminder
            </Button>
          </Box>

          {/* Data Table */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
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
                  <Typography variant="h6">Payment Status Distribution</Typography>
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

      {/* Payment Details Modal */}
      {viewPayment && (
        <Dialog open={Boolean(viewPayment)} onClose={() => setViewPayment(null)} maxWidth="md" fullWidth>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogContent>
            <Typography><strong>Tenant:</strong> {viewPayment.tenant}</Typography>
            <Typography><strong>Amount:</strong> ${viewPayment.amount}</Typography>
            <Typography><strong>Due Date:</strong> {viewPayment.dueDate}</Typography>
            <Typography><strong>Status:</strong> {viewPayment.status}</Typography>
            <Typography><strong>Property:</strong> {viewPayment.property}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewPayment(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default RentPayment;