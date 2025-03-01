import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Button, TextField, Grid, Box,
  Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Container, LinearProgress, Badge
} from '@mui/material';
import { 
  PersonAdd, Edit, Payment, 
  Delete, Search, CloudUpload,
  Description, ContactPhone, CalendarToday
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { mockTenants, mockProperties } from '../mockData';
import { styled } from '@mui/material/styles';

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
    emergencyContact: '',
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
    referenceNumber: ''
  });

  useEffect(() => {
    setTenants(mockTenants);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      setTenants(tenants.map(t => 
        t.id === currentTenant.id ? currentTenant : t
      ));
    } else {
      setTenants([...tenants, {
        ...currentTenant,
        id: Math.max(...tenants.map(t => t.id), 0) + 1
      }]);
    }
    handleCloseDialog();
  };

  const handlePaymentSubmit = () => {
    setTenants(tenants.map(t => 
      t.id === selectedTenant.id ? 
      { ...t, paymentStatus: 'Paid', lastPayment: paymentDetails } : t
    ));
    setOpenPaymentDialog(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentTenant({...currentTenant, leaseDocument: file.name});
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Tenant', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StyledBadge badgeContent={params.row.activeLease ? "✓" : "!"} color="secondary">
            <Avatar src={`https://i.pravatar.cc/80?u=${params.row.id}`}>
              {params.row.name[0]}
            </Avatar>
          </StyledBadge>
          <Box>
            <Typography variant="subtitle1">{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'property', 
      headerName: 'Property', 
      width: 200,
      valueGetter: (params) => mockProperties.find(p => p.id === params.row.propertyId)?.name 
    },
    { 
      field: 'paymentStatus', 
      headerName: 'Payment Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Paid' ? 'success' : 
            params.value === 'Pending' ? 'warning' : 'error'
          }
          variant="outlined"
          size="small"
        />
      )
    },
    { 
      field: 'leaseDuration', 
      headerName: 'Lease Duration', 
      width: 200,
      valueGetter: (params) => 
        `${new Date(params.row.leaseStart).toLocaleDateString()} - 
         ${new Date(params.row.leaseEnd).toLocaleDateString()}`
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit"><Edit color="primary" /></Tooltip>}
          onClick={() => handleEdit(params.id)}
          label="Edit"
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Record Payment"><Payment color="success" /></Tooltip>}
          onClick={() => {
            setSelectedTenant(params.row);
            setOpenPaymentDialog(true);
          }}
          label="Payment"
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Delete"><Delete color="error" /></Tooltip>}
          onClick={() => handleDelete(params.id)}
          label="Delete"
        />
      ],
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Tenant Management Portal
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<PersonAdd />}
              onClick={() => setOpenDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Add New Tenant
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
            <Select
              value="all"
              variant="outlined"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All Properties</MenuItem>
              {mockProperties.map(property => (
                <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
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
              }}
            />
          </Box>
        </Card>

        {/* Add/Edit Tenant Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            {editMode ? 'Edit Tenant Details' : 'New Tenant Registration'}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    required
                    variant="outlined"
                    value={currentTenant.name}
                    onChange={e => setCurrentTenant({...currentTenant, name: e.target.value})}
                    InputProps={{
                      startAdornment: <ContactPhone sx={{ color: 'action.active', mr: 1 }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    variant="outlined"
                    value={currentTenant.email}
                    onChange={e => setCurrentTenant({...currentTenant, email: e.target.value})}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    required
                    variant="outlined"
                    value={currentTenant.phone}
                    onChange={e => setCurrentTenant({...currentTenant, phone: e.target.value})}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    variant="outlined"
                    value={currentTenant.emergencyContact}
                    onChange={e => setCurrentTenant({...currentTenant, emergencyContact: e.target.value})}
                    sx={{ mt: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    label="Property Assignment"
                    required
                    variant="outlined"
                    value={currentTenant.propertyId}
                    onChange={e => setCurrentTenant({...currentTenant, propertyId: e.target.value})}
                  >
                    {mockProperties.map(property => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} - {property.type}
                      </MenuItem>
                    ))}
                  </Select>

                  <TextField
                    fullWidth
                    label="Monthly Rent"
                    type="number"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    value={currentTenant.rentAmount}
                    onChange={e => setCurrentTenant({...currentTenant, rentAmount: e.target.value})}
                    sx={{ mt: 2 }}
                  />

                  <DatePicker
                    label="Lease Start Date"
                    value={currentTenant.leaseStart}
                    onChange={(newValue) => setCurrentTenant({...currentTenant, leaseStart: newValue})}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
                  />

                  <DatePicker
                    label="Lease End Date"
                    value={currentTenant.leaseEnd}
                    onChange={(newValue) => setCurrentTenant({...currentTenant, leaseEnd: newValue})}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
                  />

                  <Button
                    fullWidth
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mt: 2 }}
                  >
                    Upload Lease Document
                    <input type="file" hidden onChange={handleFileUpload} />
                  </Button>
                  {currentTenant.leaseDocument && (
                    <Chip
                      label={currentTenant.leaseDocument}
                      onDelete={() => setCurrentTenant({...currentTenant, leaseDocument: null})}
                      sx={{ mt: 1 }}
                      deleteIcon={<Delete fontSize="small" />}
                    />
                  )}
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button variant="outlined" onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} color="primary">
              {editMode ? 'Update Tenant' : 'Create Tenant Record'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
            Record Payment for {selectedTenant?.name}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Amount"
                  variant="outlined"
                  value={paymentDetails.amount}
                  onChange={(e) => setPaymentDetails({...paymentDetails, amount: e.target.value})}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Payment Date"
                  value={paymentDetails.paymentDate}
                  onChange={(newValue) => setPaymentDetails({...paymentDetails, paymentDate: newValue})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select
                  fullWidth
                  label="Payment Method"
                  value={paymentDetails.paymentMethod}
                  onChange={(e) => setPaymentDetails({...paymentDetails, paymentMethod: e.target.value})}
                >
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Check">Check</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reference Number"
                  variant="outlined"
                  value={paymentDetails.referenceNumber}
                  onChange={(e) => setPaymentDetails({...paymentDetails, referenceNumber: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button variant="outlined" onClick={() => setOpenPaymentDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="success" onClick={handlePaymentSubmit}>
              Confirm Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default TenantManagement;