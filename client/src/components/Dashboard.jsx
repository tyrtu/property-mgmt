import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, List, ListItem,
  ListItemIcon, ListItemText, LinearProgress, Chip, TextField,
  Select, MenuItem, Button, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton
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
import { useTheme } from '@mui/material/styles';

// Color mapping for metrics
const colorMap = {
  properties: { main: 'primary.main', light: 'primary.light', dark: 'primary.dark' },
  income: { main: 'success.main', light: 'success.light', dark: 'success.dark' },
  vacancies: { main: 'warning.main', light: 'warning.light', dark: 'warning.dark' },
  expenses: { main: 'error.main', light: 'error.light', dark: 'error.dark' }
};

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

// Enhanced Metric Card Component
const MetricCard = ({ title, value, color = 'primary', trend, icon: Icon }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ 
      p: 3,
      position: 'relative',
      overflow: 'visible',
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: (theme) => theme.palette.mode === 'dark' 
        ? '0 4px 20px rgba(0,0,0,0.5)' 
        : '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': { 
        transform: 'translateY(-4px)', 
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 8px 30px rgba(0,0,0,0.7)' 
          : '0 8px 30px rgba(0,0,0,0.15)' 
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            color: colorMap[title.replace(' ', '').toLowerCase()]?.main || 'primary.main',
            mb: 2
          }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {trend && <TrendIndicator trend={trend} />}
          </Box>
        </Box>
        <Box sx={{ 
          bgcolor: `${color}.light`, 
          p: 1.5, 
          borderRadius: '12px', 
          display: 'flex', 
          color: `${color}.contrastText` 
        }}>
          <Icon fontSize="medium" />
        </Box>
      </Box>
      <LinearProgress variant="determinate" value={100} sx={{ 
        mt: 2, 
        height: 4, 
        borderRadius: 2, 
        backgroundColor: (theme) => theme.palette[color].light,
        '.MuiLinearProgress-bar': { 
          backgroundColor: (theme) => theme.palette[color].main 
        } 
      }} />
    </Card>
  </Grid>
);

const Dashboard = () => {
  const theme = useTheme();
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
  const [isLoading, setIsLoading] = useState(true);

  // Dark mode variables
  const darkModeBg = darkMode ? 'rgba(30, 30, 30, 0.95)' : '#fff';
  const darkModeText = darkMode ? 'rgba(255, 255, 255, 0.87)' : 'text.primary';

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

    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
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
    <Box sx={{ 
      backgroundColor: darkModeBg, 
      minHeight: '100vh',
      p: 3,
      pb: 6 // Added bottom padding
    }}>
      <Navigation />
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: darkModeText,
            letterSpacing: '0.5px'
          }}>
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
            <Card sx={{ 
              height: { xs: 300, md: 400 }, 
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)' 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                {isLoading ? (
                  <Skeleton variant="rectangular" height="100%" animation="wave" />
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 2 
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: darkModeText 
                      }}>
                        Financial Performance
                      </Typography>
                      <Select 
                        value={timePeriod} 
                        onChange={(e) => setTimePeriod(e.target.value)} 
                        sx={{ 
                          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          borderRadius: 1
                        }}
                      >
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
                          { 
                            data: [4000, 3000, 6000, 4500, 7000], 
                            label: 'Income', 
                            color: '#4CAF50', 
                            curve: 'natural',
                            areaStyle: { 
                              fill: 'url(#incomeGradient)',
                              opacity: 0.2 
                            }
                          },
                          { 
                            data: [2000, 1500, 3000, 2500, 4000], 
                            label: 'Expenses', 
                            color: '#F44336', 
                            curve: 'natural',
                            areaStyle: { 
                              fill: 'url(#expenseGradient)',
                              opacity: 0.2 
                            }
                          },
                        ]}
                        margin={{ left: 70, right: 30 }}
                        grid={{ vertical: true, horizontal: true }}
                      >
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F44336" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#F44336" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: { xs: 300, md: 400 },
              borderRadius: 2,
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)' 
              }
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2, 
                  gap: 1 
                }}>
                  <NotificationsIcon color="primary" />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: darkModeText,
                    letterSpacing: '0.5px'
                  }}>
                    Recent Notifications
                  </Typography>
                </Box>
                <List dense sx={{ overflow: 'auto', flexGrow: 1 }}>
                  {mockNotifications.map((note) => (
                    <ListItem 
                      key={note.id} 
                      sx={{ 
                        borderRadius: 1, 
                        mb: 0.5, 
                        bgcolor: note.priority === 'high' ? 'error.light' : 'action.hover', 
                        '&:hover': { bgcolor: 'action.selected' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {note.priority === 'high' ? 
                          <WarningIcon fontSize="small" color="error" /> : 
                          <InfoIcon fontSize="small" color="info" />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500, 
                            color: darkModeText 
                          }}>
                            {note.title}
                          </Typography>
                        }
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Property List */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)' 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: darkModeText,
                  letterSpacing: '0.5px'
                }}>
                  Property List
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          color: darkModeText,
                          fontWeight: 600
                        }}>Property</TableCell>
                        <TableCell sx={{ 
                          color: darkModeText,
                          fontWeight: 600
                        }}>Address</TableCell>
                        <TableCell sx={{ 
                          color: darkModeText,
                          fontWeight: 600
                        }}>Tenants</TableCell>
                        <TableCell sx={{ 
                          color: darkModeText,
                          fontWeight: 600
                        }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockProperties.map((prop) => (
                        <TableRow 
                          key={prop.id}
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
                            },
                            '&:hover': { 
                              bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)' 
                            },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell sx={{ color: darkModeText }}>{prop.name}</TableCell>
                          <TableCell sx={{ color: darkModeText }}>{prop.address}</TableCell>
                          <TableCell sx={{ color: darkModeText }}>{prop.tenants}</TableCell>
                          <TableCell sx={{ color: darkModeText }}>{prop.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Maintenance Requests */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)' 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: darkModeText,
                  letterSpacing: '0.5px'
                }}>
                  Maintenance Requests
                </Typography>
                <List>
                  {mockMaintenanceRequests.map((req) => (
                    <ListItem 
                      key={req.id}
                      sx={{
                        '&:nth-of-type(odd)': { 
                          bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
                        },
                        '&:hover': { 
                          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)' 
                        },
                        transition: 'background-color 0.2s',
                        borderRadius: 1,
                        mb: 0.5
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500, 
                            color: darkModeText 
                          }}>
                            {req.description}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Status: {req.status}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Export Button */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <Button 
            variant="contained" 
            startIcon={<ArrowDownwardIcon />} 
            onClick={exportToCSV}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: 4 
              },
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            Export to CSV
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;