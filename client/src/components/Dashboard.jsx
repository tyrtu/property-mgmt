import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, List, ListItem,
  ListItemIcon, ListItemText, LinearProgress, Chip, TextField,
  Select, MenuItem, Button, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  HomeWork as HomeWorkIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { LineChart, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from '@mui/x-charts';
import { saveAs } from 'file-saver';
import useAutoLogout from '../hooks/useAutoLogout';
import Navigation from './Navigation';

// Mock Data
const mockProperties = [
  { id: 1, name: 'Property A', address: '123 Main St', tenants: 5, status: 'Occupied' },
  { id: 2, name: 'Property B', address: '456 Elm St', tenants: 3, status: 'Vacant' },
  { id: 3, name: 'Property C', address: '789 Oak St', tenants: 8, status: 'Occupied' },
];

const mockPayments = [
  { id: 1, tenant: 'John Doe', amount: 1200, status: 'Paid', date: '2024-03-01' },
  { id: 2, tenant: 'Jane Smith', amount: 1500, status: 'Pending', date: '2024-03-05' },
  { id: 3, tenant: 'Alice Johnson', amount: 1300, status: 'Overdue', date: '2024-03-10' },
];

const mockNotifications = [
  { id: 1, title: 'Rent Payment Received', date: '2024-03-01', type: 'info', priority: 'low' },
  { id: 2, title: 'Maintenance Request', date: '2024-03-02', type: 'alert', priority: 'high' },
  { id: 3, title: 'New Tenant Added', date: '2024-03-03', type: 'info', priority: 'medium' },
];

const mockMaintenanceRequests = [
  { id: 1, description: 'Fix Leaking Faucet', status: 'Pending' },
  { id: 2, description: 'Replace Light Bulbs', status: 'Completed' },
  { id: 3, description: 'Paint Walls', status: 'In Progress' },
];

// Trend Indicator Component
const TrendIndicator = ({ trend }) => (
  <Typography
    variant="body2"
    color={trend.startsWith('+') ? 'success.main' : 'error.main'}
    sx={{ ml: 1, display: 'flex', alignItems: 'center', fontWeight: 500 }}
  >
    {trend}
  </Typography>
);

// Metric Card Component
const MetricCard = ({ title, value, color = 'primary', trend, icon: Icon }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ p: 2, position: 'relative', overflow: 'visible', bgcolor: 'background.paper', boxShadow: 1, '&:hover': { boxShadow: 3 }, transition: 'all 0.3s ease' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {trend && <TrendIndicator trend={trend} />}
          </Box>
        </Box>
        <Box sx={{ bgcolor: `${color}.light`, p: 1.5, borderRadius: '12px', display: 'flex', color: `${color}.contrastText` }}>
          <Icon fontSize="medium" />
        </Box>
      </Box>
      <LinearProgress variant="determinate" value={100} sx={{ mt: 2, height: 4, borderRadius: 2, backgroundColor: (theme) => theme.palette[color].light, '.MuiLinearProgress-bar': { backgroundColor: (theme) => theme.palette[color].main } }} />
    </Card>
  </Grid>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    occupiedUnits: 0,
    vacancyRate: 0,
    pendingPayments: 0,
    monthlyIncome: 0,
    noi: 0, // Net Operating Income
    cashFlow: 0,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Calculate Metrics
  useEffect(() => {
    const occupied = mockProperties.reduce((acc, prop) => acc + prop.tenants, 0);
    const totalUnits = mockProperties.length * 10; // Mock total units
    const noi = mockPayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
    const cashFlow = noi - 5000; // Mock expenses

    setMetrics({
      totalProperties: mockProperties.length,
      occupiedUnits: occupied,
      vacancyRate: ((totalUnits - occupied) / totalUnits * 100).toFixed(1),
      pendingPayments: mockPayments.filter(p => p.status === 'Pending').length,
      monthlyIncome: mockPayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0),
      noi,
      cashFlow,
    });
  }, []);

  // Export to CSV
  const exportToCSV = () => {
    const csvData = mockPayments.map((row) => ({
      Tenant: row.tenant,
      Amount: row.amount,
      Status: row.status,
      Date: row.date,
    }));
    const csvHeaders = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'rent_payments.csv');
  };

  return (
    <Box sx={{ backgroundColor: darkMode ? '#121212' : '#f5f5f5', minHeight: '100vh' }}>
      <Navigation />
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: darkMode ? '#fff' : '#000' }}>
            Property Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label="Last updated: Today" variant="outlined" sx={{ borderColor: 'divider' }} />
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Metrics */}
        <Grid container spacing={3}>
          <MetricCard title="Total Properties" value={metrics.totalProperties} trend="+2.1%" icon={ApartmentIcon} color="primary" />
          <MetricCard title="Occupied Units" value={metrics.occupiedUnits} icon={PeopleIcon} color="success" />
          <MetricCard title="Vacancy Rate" value={`${metrics.vacancyRate}%`} icon={HomeWorkIcon} color="warning" />
          <MetricCard title="Monthly Income" value={`$${metrics.monthlyIncome.toLocaleString()}`} icon={MonetizationOnIcon} color="info" />
          <MetricCard title="Net Operating Income" value={`$${metrics.noi.toLocaleString()}`} icon={MonetizationOnIcon} color="success" />
          <MetricCard title="Cash Flow" value={`$${metrics.cashFlow.toLocaleString()}`} icon={MonetizationOnIcon} color="info" />
        </Grid>

        {/* Financial Performance Chart */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, height: 400, boxShadow: 2, display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#1e1e1e' : '#fff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>
                  Financial Performance
                </Typography>
                <Select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} sx={{ bgcolor: darkMode ? '#333' : '#fff' }}>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <LineChart
                  xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], scaleType: 'band', label: 'Month' }]}
                  yAxis={[{ label: 'Amount ($)' }]}
                  series={[
                    { data: [4000, 3000, 6000, 4500, 7000], label: 'Income', color: '#4CAF50', curve: 'natural' },
                    { data: [2000, 1500, 3000, 2500, 4000], label: 'Expenses', color: '#F44336', curve: 'natural' },
                  ]}
                  margin={{ left: 70, right: 30 }}
                  grid={{ vertical: true, horizontal: true }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column', boxShadow: 2, bgcolor: darkMode ? '#1e1e1e' : '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>
                  Recent Notifications
                </Typography>
              </Box>
              <List dense sx={{ overflow: 'auto', flexGrow: 1 }}>
                {mockNotifications.map((note) => (
                  <ListItem key={note.id} sx={{ borderRadius: 1, mb: 0.5, bgcolor: note.priority === 'high' ? 'error.light' : 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {note.priority === 'high' ? <WarningIcon fontSize="small" color="error" /> : <InfoIcon fontSize="small" color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 500, color: darkMode ? '#fff' : '#000' }}>{note.title}</Typography>}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(note.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {note.priority}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>

        {/* Property List */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ p: 2, boxShadow: 2, bgcolor: darkMode ? '#1e1e1e' : '#fff' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>
                Property List
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>Property</TableCell>
                      <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>Address</TableCell>
                      <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>Tenants</TableCell>
                      <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockProperties.map((prop) => (
                      <TableRow key={prop.id}>
                        <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>{prop.name}</TableCell>
                        <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>{prop.address}</TableCell>
                        <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>{prop.tenants}</TableCell>
                        <TableCell sx={{ color: darkMode ? '#fff' : '#000' }}>{prop.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Maintenance Requests */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ p: 2, boxShadow: 2, bgcolor: darkMode ? '#1e1e1e' : '#fff' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>
                Maintenance Requests
              </Typography>
              <List>
                {mockMaintenanceRequests.map((req) => (
                  <ListItem key={req.id}>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 500, color: darkMode ? '#fff' : '#000' }}>{req.description}</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary">Status: {req.status}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>

        {/* Export Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" startIcon={<ArrowDownwardIcon />} onClick={exportToCSV}>
            Export to CSV
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;