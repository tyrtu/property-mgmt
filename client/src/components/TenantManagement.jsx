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
import SendNotification from './SendNotification';
import Navigation from './Navigation'; // ✅ Added Navigation Import

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Navigation />  {/* ✅ Navigation added here */}
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
              columns={[] /* Columns here */}
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
