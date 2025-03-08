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
  const [notificationOpen, setNotificationOpen] = useState(false);

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

  useEffect(() => {
    setTenants(mockTenants);
  }, []);

  const handleEdit = (id) => {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
      setCurrentTenant(tenant);
      setEditMode(true);
      setOpenDialog(true);
    }
  };

  const handleDelete = (id) => {
    setTenants(tenants.filter(t => t.id !== id));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentTenant({
      id: null, name: '', email: '', phone: '', emergencyContact: '', propertyId: '', rentAmount: '', leaseStart: null, leaseEnd: null, paymentStatus: 'Pending', leaseDocument: null
    });
  };

  const handlePaymentSubmit = () => {
    setTenants(tenants.map(t => t.id === selectedTenant?.id ? { ...t, paymentStatus: 'Paid' } : t));
    setOpenPaymentDialog(false);
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Tenant', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StyledBadge badgeContent={params.row?.activeLease ? '✓' : '!'} color="secondary">
            <Avatar src={`https://i.pravatar.cc/80?u=${params.row?.id || 'default'}`}>{params.row?.name?.[0] || '?'}</Avatar>
          </StyledBadge>
          <Box>
            <Typography variant="subtitle1">{params.row?.name || 'Unknown'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row?.email || 'No Email'}
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
        const property = mockProperties.find(p => p.id === params.row?.propertyId);
        return property ? property.name : 'Unknown Property';
      }
    },
    { 
      field: 'paymentStatus', 
      headerName: 'Payment Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.row?.paymentStatus || 'Unknown'}
          color={params.row?.paymentStatus === 'Paid' ? 'success' : 'warning'}
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
        return params.row?.leaseStart && params.row?.leaseEnd ?
          `${new Date(params.row.leaseStart).toLocaleDateString()} - ${new Date(params.row.leaseEnd).toLocaleDateString()}` : 'Unknown';
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => handleEdit(params.row?.id)} />,
        <GridActionsCellItem icon={<Payment />} label="Payment" onClick={() => {
          setSelectedTenant(params.row);
          setOpenPaymentDialog(true);
        }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDelete(params.row?.id)} />
      ],
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
          <Typography variant="h4">Tenant Management Portal</Typography>
          <Box sx={{ height: 600, width: '100%', mt: 3 }}>
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
    </LocalizationProvider>
  );
};

export default TenantManagement;
