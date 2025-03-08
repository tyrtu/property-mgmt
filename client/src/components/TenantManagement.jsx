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
  Description, ContactPhone, CalendarToday, Send
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { mockTenants, mockProperties } from '../mockData';
import { styled } from '@mui/material/styles';
import Navigation from './Navigation';
import SendNotification from './SendNotification'; // Import SendNotification component

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
  const [notificationOpen, setNotificationOpen] = useState(false); // State for SendNotification dialog

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentTenant({
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
  };

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
      setCurrentTenant({ ...currentTenant, leaseDocument: file.name });
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
      valueGetter: (params) => {
        const property = mockProperties.find(p => p.id === params.row.propertyId);
        return property ? property.name : '';
      }
    },
    { 
      field: 'paymentStatus', 
      headerName: 'Payment Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Paid' ? 'success' : 'warning'}
          variant="outlined"
          size="small"
        />
      )
    },
    { 
      field: 'leaseDuration', 
      headerName: 'Lease Duration', 
      width: 200,
      valueGetter: (params) => {
        return `${new Date(params.row.leaseStart).toLocaleDateString()} - ${new Date(params.row.leaseEnd).toLocaleDateString()}`;
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => handleEdit(params.id)} />,
        <GridActionsCellItem icon={<Payment />} label="Payment" onClick={() => {
          setSelectedTenant(params.row);
          setOpenPaymentDialog(true);
        }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDelete(params.id)} />
      ],
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Tenant Management Portal</Typography>
            <Button variant="contained" startIcon={<Send />} onClick={() => setNotificationOpen(true)}>
              Send Notification
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search tenants..."
              InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value="all" variant="outlined" sx={{ minWidth: 180 }}>
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
              components={{ LoadingOverlay: LinearProgress }}
              sx={{ borderRadius: 2, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'primary.main', color: 'white' }}}
            />
          </Box>
        </Card>
      </Container>

      {/* Send Notification Dialog */}
      <SendNotification tenants={tenants} open={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </LocalizationProvider>
  );
};

export default TenantManagement;
