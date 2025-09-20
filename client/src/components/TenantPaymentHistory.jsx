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
  Pagination,
  useTheme,
  useMediaQuery,
  Container,
  Card,
  CardContent
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
  Info as InfoIcon,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useDarkMode } from '../context/DarkModeContext';

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
  const { darkMode } = useDarkMode();
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Toggle dark mode
  const toggleDarkMode = () => {
    // This function is now empty as the dark mode is managed by the useDarkMode context
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: darkMode ? '#121212' : '#f5f5f5',
      color: darkMode ? '#fff' : 'text.primary',
      transition: 'all 0.3s ease',
      pb: { xs: 8, sm: 4 }
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 3,
            gap: 2,
            ml: 2
          }}>
            <PaymentIcon sx={{ 
              fontSize: 40,
              color: darkMode ? '#fff' : 'primary.main',
              ml: 1
            }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: darkMode ? '#fff' : 'text.primary'
              }}
            >
        Payment History
      </Typography>
          </Box>

      {/* Analytics Cards */}
          <Grid container spacing={3} sx={{ mb: 4, px: 2 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                height: '85%',
                backgroundColor: darkMode ? '#252525' : '#fff',
                borderLeft: '4px solid #4CAF50'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Paid
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  ${totalPaid.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {payments.filter(p => p.status === 'Paid').length} payments
                </Typography>
          </Paper>
        </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                height: '85%',
                backgroundColor: darkMode ? '#252525' : '#fff',
                borderLeft: '4px solid #FFC107'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PendingIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Pending
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  ${totalPending.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {payments.filter(p => p.status === 'Pending').length} payments
                </Typography>
          </Paper>
        </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                height: '85%',
                backgroundColor: darkMode ? '#252525' : '#fff',
                borderLeft: '4px solid #F44336'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HourglassIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Overdue
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  ${totalOverdue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {payments.filter(p => p.status === 'Overdue').length} payments
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                height: '85%',
                backgroundColor: darkMode ? '#252525' : '#fff',
                borderLeft: '4px solid #2196F3'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
            </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  ${(totalPaid + totalPending + totalOverdue).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {payments.length} total payments
                </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters Section */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: 3,
              backgroundColor: darkMode ? '#252525' : '#fff'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#fff' : 'text.primary' }}>Filters</Typography>
        <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
                    <InputLabel sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'inherit' }}>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
                      sx={{
                        color: darkMode ? '#fff' : 'inherit',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'inherit'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'inherit'
                        }
                      }}
              >
                {getUniqueValues('status').map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
                <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
                    <InputLabel sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'inherit' }}>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
                      sx={{
                        color: darkMode ? '#fff' : 'inherit',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'inherit'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'inherit'
                        }
                      }}
              >
                {getUniqueValues('category').map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
                <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
                    <InputLabel sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'inherit' }}>Property</InputLabel>
              <Select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                label="Property"
                      sx={{
                        color: darkMode ? '#fff' : 'inherit',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'inherit'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'inherit'
                        }
                      }}
              >
                {getUniqueValues('property').map(property => (
                  <MenuItem key={property} value={property}>{property}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
                <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'inherit' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: darkMode ? '#fff' : 'inherit',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'inherit'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'inherit'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'inherit'
                      }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
          </Grid>

      {/* Data Grid */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: { xs: 1, sm: 2 }, 
              height: { xs: 500, sm: 600 },
              backgroundColor: darkMode ? '#252525' : '#fff'
            }}>
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
                  border: 'none',
                  backgroundColor: darkMode ? '#252525' : '#fff',
                  '& .MuiDataGrid-main': {
                    backgroundColor: darkMode ? '#252525' : '#fff',
                    color: darkMode ? '#fff' : 'inherit',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: darkMode ? '#333' : 'primary.main',
                    color: '#fff',
                    borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
                  },
                  '& .MuiDataGrid-columnHeadersInner': {
                    backgroundColor: darkMode ? '#333' : 'primary.main',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: darkMode ? '#333' : 'primary.main',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: darkMode ? '#252525' : '#fff',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: darkMode ? '#555' : '#ccc',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: darkMode ? '#252525' : '#f5f5f5',
                    },
                  },
                  '& .MuiDataGrid-virtualScrollerContent': {
                    backgroundColor: darkMode ? '#252525' : '#fff',
                  },
                  '& .MuiDataGrid-virtualScrollerRenderZone': {
                    backgroundColor: darkMode ? '#252525' : '#fff',
                  },
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
                    color: darkMode ? '#fff' : 'inherit'
                  },
                  '& .MuiDataGrid-row': {
                    backgroundColor: darkMode ? '#252525' : '#fff',
                    '&:hover': {
                      backgroundColor: darkMode ? '#333' : 'rgba(0, 0, 0, 0.04)'
                    }
                  },
                  '& .MuiDataGrid-footerContainer': {
                    backgroundColor: darkMode ? '#252525' : '#fff',
                    color: darkMode ? '#fff' : 'inherit',
                    borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
                  },
                  '& .MuiCheckbox-root': {
                    color: darkMode ? '#fff' : 'inherit'
                  },
                  '& .MuiTablePagination-root': {
                    color: darkMode ? '#fff' : 'inherit'
                  },
                  '& .MuiButton-root': {
                    color: darkMode ? '#fff' : 'inherit'
                  },
                  '& .MuiIconButton-root': {
                    color: darkMode ? '#fff' : 'inherit'
                  },
                  '& .MuiDataGrid-toolbarContainer': {
                    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                    padding: '8px',
                    '& button': {
                      color: darkMode ? '#fff' : 'inherit'
                    }
                  }
          }}
        />
      </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Payment Dialog */}
      <Dialog 
        open={openPaymentModal} 
        onClose={handleClosePaymentModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#252525' : '#fff',
            color: darkMode ? '#fff' : 'inherit',
          }
        }}
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