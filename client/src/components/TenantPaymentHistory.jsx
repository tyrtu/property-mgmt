import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Chip, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Paper,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { 
  DataGrid, 
  GridToolbar,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector 
} from '@mui/x-data-grid';
import { 
  AttachMoney as AttachMoneyIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// API Configuration
const API_BASE_URL = "https://1605-102-0-11-254.ngrok-free.app";

// Mock data for demonstration
const generateMockPayments = () => {
  const statuses = ['Paid', 'Pending', 'Overdue', 'Processing', 'Failed'];
  const methods = ['MPESA', 'Bank Transfer', 'Credit Card', 'Cash'];
  const categories = ['Rent', 'Utilities', 'Maintenance', 'Deposit'];
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    amount: Math.floor(Math.random() * 2000) + 500,
    dueDate: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)).toISOString().split('T')[0],
    paidDate: i % 3 === 0 ? new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 15)).toISOString().split('T')[0] : null,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    paymentMethod: i % 2 === 0 ? methods[Math.floor(Math.random() * methods.length)] : null,
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    property: `Property ${Math.floor(Math.random() * 3) + 1}`,
    unit: `Unit ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 10)}`
  }));
};

const TenantPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterProperty, setFilterProperty] = useState('All');
  const [sortModel, setSortModel] = useState([{ field: 'dueDate', sort: 'desc' }]);

  // Initialize with mock data
  useEffect(() => {
    const mockData = generateMockPayments();
    setPayments(mockData);
    setFilteredPayments(mockData);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...payments];
    
    // Status filter
    if (filterStatus !== 'All') {
      result = result.filter(payment => payment.status === filterStatus);
    }
    
    // Category filter
    if (filterCategory !== 'All') {
      result = result.filter(payment => payment.category === filterCategory);
    }
    
    // Property filter
    if (filterProperty !== 'All') {
      result = result.filter(payment => payment.property === filterProperty);
    }
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => 
        payment.invoiceNumber.toLowerCase().includes(term) ||
        payment.paymentMethod?.toLowerCase().includes(term) ||
        payment.property.toLowerCase().includes(term) ||
        payment.unit.toLowerCase().includes(term)
      );
    }
    
    setFilteredPayments(result);
  }, [payments, filterStatus, filterCategory, filterProperty, searchTerm]);

  // Get unique values for filters
  const getUniqueValues = (field) => {
    const values = payments.map(payment => payment[field]);
    return ['All', ...new Set(values)];
  };

  const handleOpenPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setMessage({ text: '', severity: 'info' });
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedPayment(null);
    setLoading(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    
    setLoading(true);
    setMessage({ text: '', severity: 'info' });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/stkpush`, 
        {
          amount: "1", // Using 1 for testing
          phone: "254708374149", // Test number
          accountReference: `PAY-${selectedPayment.id}-${Date.now()}`
        },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (response.data.ResponseCode === "0") {
        setMessage({ 
          text: "Check your phone to complete payment!", 
          severity: 'success' 
        });
        // Update payment status
        setPayments(prev => 
          prev.map(p => 
            p.id === selectedPayment.id ? { ...p, status: "Processing" } : p
          )
        );
      } else {
        setMessage({ 
          text: `Failed: ${response.data.ResponseDescription}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || "Payment initiation failed",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    alert(`Printing receipt for ${selectedPayment?.invoiceNumber}`);
  };

  const handleDownloadReceipt = () => {
    alert(`Downloading receipt for ${selectedPayment?.invoiceNumber}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircleIcon color="success" />;
      case 'Pending': return <PendingIcon color="warning" />;
      case 'Processing': return <HourglassIcon color="info" />;
      case 'Overdue': return <HourglassIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70 
    },
    {
      field: 'invoiceNumber',
      headerName: 'Invoice #',
      width: 150
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => `$${params.value.toLocaleString()}`
    },
    { 
      field: 'dueDate', 
      headerName: 'Due Date', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
          {params.value}
        </Box>
      )
    },
    {
      field: 'paidDate',
      headerName: 'Paid Date',
      width: 120,
      renderCell: (params) => (
        params.value ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
            {params.value}
          </Box>
        ) : '--'
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon(params.value)}
          <Chip
            label={params.value}
            color={
              params.value === 'Paid'
                ? 'success'
                : params.value === 'Pending'
                ? 'warning'
                : params.value === 'Overdue'
                ? 'error'
                : params.value === 'Processing'
                ? 'info'
                : 'default'
            }
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120
    },
    {
      field: 'property',
      headerName: 'Property',
      width: 120
    },
    {
      field: 'unit',
      headerName: 'Unit',
      width: 80
    },
    {
      field: 'paymentMethod',
      headerName: 'Method',
      width: 120,
      renderCell: (params) => params.value || '--'
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => {
        if (params.row.status === 'Paid') {
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View Receipt">
                <IconButton size="small" onClick={() => handleOpenPaymentModal(params.row)}>
                  <ReceiptIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleOpenPaymentModal(params.row)}
            startIcon={<PaymentIcon />}
          >
            Pay
          </Button>
        );
      }
    }
  ];

  // Custom pagination component
  function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
      <Pagination
        color="primary"
        count={pageCount}
        page={page + 1}
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
      />
    );
  }

  // Calculate summary statistics
  const totalPaid = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPending = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOverdue = payments
    .filter(p => p.status === 'Overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AttachMoneyIcon sx={{ mr: 2, fontSize: 40 }} />
        Payment History
      </Typography>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'success.light' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h6" color="text.secondary">Paid</Typography>
                <Typography variant="h4">${totalPaid.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {payments.filter(p => p.status === 'Paid').length} payments
                </Typography>
              </div>
              <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'warning.light' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h6" color="text.secondary">Pending</Typography>
                <Typography variant="h4">${totalPending.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {payments.filter(p => p.status === 'Pending').length} payments
                </Typography>
              </div>
              <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                <PendingIcon fontSize="large" />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'error.light' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h6" color="text.secondary">Overdue</Typography>
                <Typography variant="h4">${totalOverdue.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {payments.filter(p => p.status === 'Overdue').length} payments
                </Typography>
              </div>
              <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                <HourglassIcon fontSize="large" />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                {getUniqueValues('status').map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                {getUniqueValues('category').map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                label="Property"
              >
                {getUniqueValues('property').map(property => (
                  <MenuItem key={property} value={property}>{property}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ p: 2, height: 600 }}>
        <DataGrid
          rows={filteredPayments}
          columns={columns}
          slots={{ 
            toolbar: GridToolbar,
            pagination: CustomPagination
          }}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel }
          }}
          onSortModelChange={(model) => setSortModel(model)}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>

      {/* Payment Dialog */}
      <Dialog 
        open={openPaymentModal} 
        onClose={handleClosePaymentModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <PaymentIcon sx={{ mr: 1 }} />
          {selectedPayment?.status === 'Paid' ? 'Payment Details' : 'Make Payment'}
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <>
              {message.text && (
                <Alert severity={message.severity} sx={{ mb: 2 }}>
                  {message.text}
                </Alert>
              )}
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Invoice Number</Typography>
                  <Typography>{selectedPayment.invoiceNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography>{selectedPayment.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Property</Typography>
                  <Typography>{selectedPayment.property}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Unit</Typography>
                  <Typography>{selectedPayment.unit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Due Date</Typography>
                  <Typography>{selectedPayment.dueDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(selectedPayment.status)}
                    <Typography sx={{ ml: 1 }}>{selectedPayment.status}</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6">Amount Due</Typography>
                <Typography variant="h5" color="primary">
                  ${selectedPayment.amount.toLocaleString()}
                </Typography>
              </Box>
              
              {selectedPayment.status === 'Paid' && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Paid Date</Typography>
                      <Typography>{selectedPayment.paidDate}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Payment Method</Typography>
                      <Typography>{selectedPayment.paymentMethod}</Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {selectedPayment?.status === 'Paid' ? (
            <>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                onClick={handlePrintReceipt}
              >
                Print Receipt
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={handleDownloadReceipt}
              >
                Download
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleClosePaymentModal}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleConfirmPayment} 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantPaymentHistory;