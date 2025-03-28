import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Navigation from './Navigation';
import {
  Box,
  Container,
  Card,
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
  Grid,
  Avatar,
  Badge,
  Divider,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  ArrowDownward,
  Visibility,
  CheckCircle,
  Send,
  Receipt,
  AttachMoney,
  CalendarToday,
  FilterList,
  Search,
  MoreVert,
  Notifications,
  Paid,
  PendingActions,
  Warning,
  Download,
  Print,
  Email,
  Sms,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline,
  Home,
  Apartment,
  Money,
  CreditCard
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { alpha } from '@mui/material/styles';

// Enhanced mock data generation
const generateMockPayments = () => {
  const statuses = ['Paid', 'Pending', 'Overdue', 'Partial', 'Cancelled'];
  const properties = ['Sunset Villas', 'Mountain View', 'Ocean Breeze', 'Downtown Lofts', 'Garden Apartments'];
  const paymentMethods = ['Bank Transfer', 'Credit Card', 'MPESA', 'Cash', 'Check'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const amount = Math.floor(Math.random() * 2000) + 800;
    const paidAmount = statuses[i % 5] === 'Paid' ? amount : 
                      statuses[i % 5] === 'Partial' ? Math.floor(amount * 0.5) : 0;
    const dueDate = new Date(2024, i % 12, (i % 28) + 1);
    const paidDate = statuses[i % 5] === 'Paid' || statuses[i % 5] === 'Partial' ? 
                    new Date(dueDate.getTime() + (i % 10 - 5) * 24 * 60 * 60 * 1000) : null;
    
    return {
      id: i + 1,
      tenant: `Tenant ${i + 1}`,
      email: `tenant${i + 1}@example.com`,
      phone: `+2547${Math.floor(Math.random() * 9000000 + 1000000)}`,
      amount,
      paidAmount,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      paidDate: paidDate ? format(paidDate, 'yyyy-MM-dd') : null,
      status: statuses[i % 5],
      property: properties[i % 5],
      unit: `${String.fromCharCode(65 + (i % 5))}${i % 10 + 1}`,
      paymentMethod: statuses[i % 5] === 'Paid' || statuses[i % 5] === 'Partial' ? 
                    paymentMethods[i % 5] : null,
      leaseStart: format(new Date(2023, i % 12, 1), 'yyyy-MM-dd'),
      leaseEnd: format(new Date(2025, i % 12, 1), 'yyyy-MM-dd'),
      notes: i % 3 === 0 ? 'Special arrangement' : '',
      lastReminder: i % 4 === 0 ? format(new Date(Date.now() - (i % 7) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') : null
    };
  });
};

const RentPayment = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewPayment, setViewPayment] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize with mock data
  useEffect(() => {
    const mockData = generateMockPayments();
    setRows(mockData);
    setFilteredRows(mockData);
  }, []);

  // Filter payments based on filters
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
        row.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.phone.includes(searchQuery)
      );
    }

    if (minAmount) {
      filtered = filtered.filter((row) => row.amount >= Number(minAmount));
    }

    if (maxAmount) {
      filtered = filtered.filter((row) => row.amount <= Number(maxAmount));
    }

    if (startDate) {
      filtered = filtered.filter((row) => row.dueDate >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((row) => row.dueDate <= endDate);
    }

    setFilteredRows(filtered);
  }, [rows, selectedStatus, selectedProperty, searchQuery, minAmount, maxAmount, startDate, endDate]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    const updatedRows = rows.map((row) => {
      if (!selectedRows.includes(row.id)) return row;
      
      switch (action) {
        case 'markAsPaid':
          return { 
            ...row, 
            status: 'Paid',
            paidAmount: row.amount,
            paidDate: format(new Date(), 'yyyy-MM-dd'),
            paymentMethod: 'Manual Entry'
          };
        case 'sendReminder':
          return { 
            ...row, 
            lastReminder: format(new Date(), 'yyyy-MM-dd')
          };
        default:
          return row;
      }
    });
    
    setRows(updatedRows);
    setSelectedRows([]);
  };

  // Export data to CSV
  const exportToCSV = () => {
    const csvData = filteredRows.map((row) => ({
      Tenant: row.tenant,
      Email: row.email,
      Phone: row.phone,
      Amount: row.amount,
      'Paid Amount': row.paidAmount,
      'Due Date': row.dueDate,
      'Paid Date': row.paidDate || '',
      Status: row.status,
      Property: row.property,
      Unit: row.unit,
      'Payment Method': row.paymentMethod || '',
      'Lease Start': row.leaseStart,
      'Lease End': row.leaseEnd,
      Notes: row.notes || ''
    }));
    
    const csvHeaders = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `rent_payments_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
  };

  // Data for analytics
  const statusData = [
    { name: 'Paid', value: filteredRows.filter((row) => row.status === 'Paid').length },
    { name: 'Pending', value: filteredRows.filter((row) => row.status === 'Pending').length },
    { name: 'Overdue', value: filteredRows.filter((row) => row.status === 'Overdue').length },
    { name: 'Partial', value: filteredRows.filter((row) => row.status === 'Partial').length },
    { name: 'Cancelled', value: filteredRows.filter((row) => row.status === 'Cancelled').length },
  ];

  const propertyData = filteredRows.reduce((acc, row) => {
    const existing = acc.find(item => item.name === row.property);
    if (existing) {
      existing.value += row.amount;
      existing.count += 1;
    } else {
      acc.push({ name: row.property, value: row.amount, count: 1 });
    }
    return acc;
  }, []);

  const monthlyData = filteredRows.reduce((acc, row) => {
    const month = new Date(row.dueDate).getMonth();
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += row.amount;
      existing.paid += row.paidAmount || 0;
    } else {
      acc.push({ 
        month, 
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month],
        amount: row.amount,
        paid: row.paidAmount || 0
      });
    }
    return acc;
  }, []).sort((a, b) => a.month - b.month);

  const paymentMethodData = filteredRows
    .filter(row => row.paymentMethod)
    .reduce((acc, row) => {
      const existing = acc.find(item => item.name === row.paymentMethod);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: row.paymentMethod, value: 1 });
      }
      return acc;
    }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
      field: 'tenant', 
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
              {params.row.unit}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      renderCell: (params) => (
        <Box>
          <Typography>${params.value.toLocaleString()}</Typography>
          {params.row.paidAmount > 0 && params.row.paidAmount < params.row.amount && (
            <Typography variant="caption" color="text.secondary">
              Paid: ${params.row.paidAmount.toLocaleString()}
            </Typography>
          )}
        </Box>
      )
    },
    { 
      field: 'dueDate', 
      headerName: 'Due Date', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
          {format(new Date(params.value), 'MMM dd')}
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const getIcon = () => {
          switch(params.value) {
            case 'Paid': return <Paid fontSize="small" />;
            case 'Pending': return <PendingActions fontSize="small" />;
            case 'Overdue': return <Warning fontSize="small" />;
            case 'Partial': return <AttachMoney fontSize="small" />;
            default: return <MoreVert fontSize="small" />;
          }
        };
        
        return (
          <Chip
            label={params.value}
            icon={getIcon()}
            color={
              params.value === 'Paid' ? 'success' :
              params.value === 'Pending' ? 'warning' : 
              params.value === 'Overdue' ? 'error' :
              params.value === 'Partial' ? 'info' : 'default'
            }
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'property',
      headerName: 'Property',
      width: 150,
    },
    {
      field: 'paymentMethod',
      headerName: 'Method',
      width: 120,
      renderCell: (params) => params.value || '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton onClick={() => setViewPayment(params.row)} size="small">
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Reminder">
            <IconButton size="small">
              <Sms fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Custom toolbar component
  const CustomToolbar = () => (
    <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<CheckCircle />}
        onClick={() => handleBulkAction('markAsPaid')}
        disabled={selectedRows.length === 0}
        size="small"
      >
        Mark Paid
      </Button>
      <Button
        variant="outlined"
        startIcon={<Email />}
        onClick={() => handleBulkAction('sendReminder')}
        disabled={selectedRows.length === 0}
        size="small"
      >
        Email
      </Button>
      <Button
        variant="outlined"
        startIcon={<Sms />}
        onClick={() => handleBulkAction('sendReminder')}
        disabled={selectedRows.length === 0}
        size="small"
      >
        SMS
      </Button>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={exportToCSV}
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
      {/* Navigation Component - Now properly placed at the top */}
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
              Rent Payments
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {filteredRows.length} records found • Last updated: {format(new Date(), 'MMM dd, yyyy h:mm a')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton 
                onClick={toggleDarkMode} 
                sx={{ 
                  color: darkMode ? '#fff' : '#000',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<Receipt />}>
              Quick Payment
            </Button>
          </Box>
        </Box>

        {/* Filters Section - Improved layout */}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />
              }}
              size="small"
              sx={{ flex: 2 }}
            />
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 150, flex: 1 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Partial">Partial</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 180, flex: 1 }}
            >
              <MenuItem value="All">All Properties</MenuItem>
              {[...new Set(rows.map(row => row.property))].map((property, index) => (
                <MenuItem key={index} value={property}>
                  {property}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              size="small"
              sx={{ flex: isXSmallScreen ? 1 : 'none' }}
            >
              Advanced
            </Button>
          </Box>

          {/* Advanced Filters - Improved layout */}
          {showAdvancedFilters && (
            <Box sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
              flexWrap: 'wrap',
              '& > *': { 
                flex: isXSmallScreen ? '1 1 100%' : '1 1 200px',
                minWidth: isXSmallScreen ? '100%' : '200px'
              }
            }}>
              <TextField
                label="Min Amount"
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
              <TextField
                label="Max Amount"
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
              <TextField
                label="From Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="To Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
        </Card>

        {/* Stats Cards - Added icons and improved layout */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: '4px solid #4CAF50'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Money color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Collected
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                ${filteredRows.reduce((sum, row) => sum + (row.paidAmount || 0), 0).toLocaleString()}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={filteredRows.length > 0 ? 
                  (filteredRows.filter(row => row.status === 'Paid').length / filteredRows.length * 100) : 0} 
                color="success"
                sx={{ height: 6, mt: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {filteredRows.filter(row => row.status === 'Paid').length} paid payments
              </Typography>
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
                ${filteredRows
                  .filter(row => row.status === 'Pending')
                  .reduce((sum, row) => sum + row.amount, 0)
                  .toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {filteredRows.filter(row => row.status === 'Pending').length} pending
              </Typography>
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
                ${filteredRows
                  .filter(row => row.status === 'Overdue')
                  .reduce((sum, row) => sum + row.amount, 0)
                  .toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {filteredRows.filter(row => row.status === 'Overdue').length} overdue
              </Typography>
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
                <CreditCard color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Collection Rate
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {filteredRows.length > 0 ?
                  Math.round(
                    filteredRows.filter(row => row.status === 'Paid').length / 
                    filteredRows.length * 100
                  ) : 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={filteredRows.length > 0 ? 
                  (filteredRows.filter(row => row.status === 'Paid').length / filteredRows.length * 100) : 0} 
                color="primary"
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
                  rows={filteredRows}
                  columns={columns}
                  slots={{ 
                    toolbar: () => <CustomToolbar />,
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  checkboxSelection
                  onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-main, & .MuiDataGrid-virtualScroller, & .MuiDataGrid-virtualScrollerRenderZone, & .MuiDataGrid-virtualScrollerContent, & .MuiDataGrid-footerContainer, & .MuiDataGrid-columnHeaders': {
                      backgroundColor: darkMode ? '#252525' : '#fff'
                    },
                    '& .MuiDataGrid-row': {
                      backgroundColor: darkMode ? '#252525' : '#fff',
                      '&:hover': {
                        backgroundColor: darkMode ? '#333' : '#f5f5f5'
                      }
                    },
                    '& .MuiDataGrid-cell': {
                      backgroundColor: darkMode ? '#252525' : '#fff',
                      color: darkMode ? '#fff' : 'inherit',
                      borderBottom: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: darkMode ? '#333' : 'primary.main',
                      color: '#fff',
                      borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
                      backgroundColor: darkMode ? '#333' : '#f5f5f5'
                    },
                    '& .MuiTablePagination-root': {
                      color: darkMode ? '#fff' : 'inherit'
                    },
                    '& .MuiDataGrid-selectedRowCount': {
                      color: darkMode ? '#fff' : 'inherit'
                    },
                    '& .MuiCheckbox-root': {
                      color: darkMode ? '#fff' : 'inherit'
                    }
                  }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Analytics Section - Improved Payment Methods chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: darkMode ? '#1e1e1e' : '#fff'
            }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <BarChartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Payment Analytics
              </Typography>

              {/* Payment Status Distribution */}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Payment Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
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
                      borderRadius: 4
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Monthly Collection */}
              <Typography variant="subtitle2" sx={{ mt: 3 }}>
                Monthly Collection
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#fff' : '#666'} />
                  <YAxis stroke={darkMode ? '#fff' : '#666'} />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#333' : '#fff',
                      borderColor: darkMode ? '#555' : '#ddd',
                      borderRadius: 4
                    }}
                  />
                  <Bar dataKey="paid" fill="#4CAF50" name="Paid" />
                  <Bar dataKey="amount" fill="#F44336" name="Due" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>

              {/* Payment Methods - Improved with better styling */}
              <Typography variant="subtitle2" sx={{ mt: 3 }}>
                Payment Methods
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={paymentMethodData}
                  layout="vertical"
                  margin={{ left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
                  <XAxis type="number" stroke={darkMode ? '#fff' : '#666'} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke={darkMode ? '#fff' : '#666'}
                    width={80}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#333' : '#fff',
                      borderColor: darkMode ? '#555' : '#ddd',
                      borderRadius: 4
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#2196F3" 
                    name="Count"
                    radius={[0, 4, 4, 0]}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Property Performance */}
        <Card sx={{ 
          mt: 3, 
          p: 2,
          backgroundColor: darkMode ? '#1e1e1e' : '#fff'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <Timeline sx={{ verticalAlign: 'middle', mr: 1 }} />
            Property Performance
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={propertyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
              <XAxis dataKey="name" stroke={darkMode ? '#fff' : '#666'} />
              <YAxis stroke={darkMode ? '#fff' : '#666'} />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  borderColor: darkMode ? '#555' : '#ddd',
                  borderRadius: 4
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#FF9800" 
                fill="#FF9800" 
                fillOpacity={0.2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </Container>

      {/* Payment Details Modal */}
      {viewPayment && (
        <Dialog 
          open={Boolean(viewPayment)} 
          onClose={() => setViewPayment(null)} 
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
            Payment Details
            <Chip
              label={viewPayment.status}
              color={
                viewPayment.status === 'Paid' ? 'success' :
                viewPayment.status === 'Pending' ? 'warning' : 
                viewPayment.status === 'Overdue' ? 'error' :
                viewPayment.status === 'Partial' ? 'info' : 'default'
              }
              sx={{ color: '#fff' }}
            />
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Tenant Information</strong>
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tenant Name
                    </Typography>
                    <Typography>{viewPayment.tenant}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Property
                    </Typography>
                    <Typography>{viewPayment.property} (Unit {viewPayment.unit})</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contact
                    </Typography>
                    <Typography>{viewPayment.email}</Typography>
                    <Typography>{viewPayment.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lease Period
                    </Typography>
                    <Typography>
                      {format(new Date(viewPayment.leaseStart), 'MMM dd, yyyy')} -{' '}
                      {format(new Date(viewPayment.leaseEnd), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Payment Details</strong>
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Amount Due
                    </Typography>
                    <Typography>${viewPayment.amount.toLocaleString()}</Typography>
                  </Box>
                  {viewPayment.paidAmount > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Amount Paid
                      </Typography>
                      <Typography>${viewPayment.paidAmount.toLocaleString()}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography>
                      {format(new Date(viewPayment.dueDate), 'MMM dd, yyyy')}
                      {viewPayment.status === 'Overdue' && (
                        <Chip 
                          label="Overdue" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </Typography>
                  </Box>
                  {viewPayment.paidDate && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Paid Date
                      </Typography>
                      <Typography>
                        {format(new Date(viewPayment.paidDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  )}
                  {viewPayment.paymentMethod && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Typography>{viewPayment.paymentMethod}</Typography>
                    </Box>
                  )}
                  {viewPayment.lastReminder && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Reminder Sent
                      </Typography>
                      <Typography>
                        {format(new Date(viewPayment.lastReminder), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
              {viewPayment.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Notes</strong>
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography>{viewPayment.notes}</Typography>
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
              onClick={() => setViewPayment(null)}
              color="inherit"
            >
              Close
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Email />}
            >
              Send Receipt
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Sms />}
              sx={{ ml: 1 }}
            >
              Send Reminder
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default RentPayment;