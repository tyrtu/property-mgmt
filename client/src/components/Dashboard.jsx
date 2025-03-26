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
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
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

// Financial Report Mock Data
const financialData = {
  monthly: {
    income: [4000, 3000, 6000, 4500, 7000, 8000, 9000],
    expenses: [2000, 1500, 3000, 2500, 4000, 3500, 5000],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  },
  quarterly: {
    income: [12000, 13500, 21000],
    expenses: [6000, 7500, 12000],
    labels: ['Q1', 'Q2', 'Q3']
  },
  yearly: {
    income: [48000, 52000, 60000],
    expenses: [30000, 35000, 40000],
    labels: ['2021', '2022', '2023']
  }
};

// Trend Indicator Component
const TrendIndicator = ({ trend }) => (
  <Typography
    variant="body2"
    color={trend.startsWith('+') ? 'success.main' : 'error.main'}
    sx={{ 
      ml: 1, 
      display: 'flex', 
      alignItems: 'center', 
      fontWeight: 500,
      fontSize: '0.75rem'
    }}
  >
    {trend}
  </Typography>
);

// Enhanced Metric Card Component
const MetricCard = ({ title, value, color = 'primary', trend, icon: Icon }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      p: 2,
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
      <CardContent sx={{ 
        p: 0, 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1
        }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 600, 
            color: 'text.secondary',
            lineHeight: 1.2
          }}>
            {title}
          </Typography>
          <Box sx={{ 
            bgcolor: `${color}.light`, 
            p: 1, 
            borderRadius: '12px', 
            display: 'flex',
            color: `${color}.main`,
            ml: 1
          }}>
            <Icon fontSize="small" />
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          mt: 'auto'
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            color: `${color}.main`,
            lineHeight: 1.2
          }}>
            {value}
          </Typography>
          {trend && <TrendIndicator trend={trend} />}
        </Box>
      </CardContent>
      <LinearProgress 
        variant="determinate" 
        value={100} 
        sx={{ 
          mt: 2,
          height: 4,
          borderRadius: 2,
          backgroundColor: (theme) => theme.palette[color].light,
          '.MuiLinearProgress-bar': { 
            backgroundColor: (theme) => theme.palette[color].main 
          } 
        }} 
      />
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
    noi: 0,
    cashFlow: 0,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced dark mode variables with better contrast
  const darkModeBg = darkMode ? 'rgba(18, 18, 18, 0.95)' : '#fff';
  const darkModeCardBg = darkMode ? 'rgba(30, 30, 30, 0.95)' : '#fff';
  const darkModeText = darkMode ? 'rgba(255, 255, 255, 0.87)' : 'text.primary';
  const darkModeSecondaryText = darkMode ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary';

  // Current financial data based on selected time period
  const currentFinancialData = financialData[timePeriod];

  // Toggle Dark Mode with smooth transition
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.style.transition = 'background-color 0.3s ease';
    document.body.style.backgroundColor = !darkMode ? '#121212' : '#ffffff';
  };

  // Calculate Metrics
  useEffect(() => {
    const occupied = mockProperties.reduce((acc, prop) => acc + prop.tenants, 0);
    const totalUnits = mockProperties.length * 10;
    const noi = mockPayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
    const cashFlow = noi - 5000;

    setMetrics({
      totalProperties: mockProperties.length,
      occupiedUnits: occupied,
      vacancyRate: ((totalUnits - occupied) / totalUnits * 100).toFixed(1),
      pendingPayments: mockPayments.filter(p => p.status === 'Pending').length,
      monthlyIncome: mockPayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0),
      noi,
      cashFlow,
    });

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

  // Chart configurations
  const chartSetting = {
    xAxis: [
      {
        label: 'Time Period',
        scaleType: 'band',
        data: financialData[timePeriod].labels,
      },
    ],
    height: 300,
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'bottom', horizontal: 'middle' },
        padding: 2,
      },
    },
  };

  const incomeBarChart = (
    <BarChart
      dataset={financialData[timePeriod].labels.map((label, index) => ({
        timeperiod: label,
        income: financialData[timePeriod].income[index],
        expenses: financialData[timePeriod].expenses[index],
      }))}
      yAxis={[{ id: 'amount', label: 'Amount ($)', min: 0 }]}
      series={[
        { dataKey: 'income', label: 'Income', color: theme.palette.success.main },
        { dataKey: 'expenses', label: 'Expenses', color: theme.palette.error.main },
      ]}
      xAxis={[{ 
        scaleType: 'band',
        dataKey: 'timeperiod',
        label: timePeriod === 'monthly' ? 'Month' : timePeriod === 'quarterly' ? 'Quarter' : 'Year',
      }]}
      sx={{
        '.MuiChartsAxis-label': {
          fill: darkMode ? '#fff' : '#000',
        },
        '.MuiChartsAxis-tick': {
          fill: darkMode ? '#fff' : '#000',
        },
        '.MuiChartsLegend-label': {
          fill: darkMode ? '#fff' : '#000',
        },
      }}
      {...chartSetting}
    />
  );

  const pieChartData = [
    { id: 0, value: 35, label: 'Residential' },
    { id: 1, value: 25, label: 'Commercial' },
    { id: 2, value: 20, label: 'Industrial' },
    { id: 3, value: 20, label: 'Mixed Use' },
  ];

  const propertyTypePieChart = (
    <PieChart
      series={[
        {
          data: pieChartData,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30 },
        },
      ]}
      height={300}
      slotProps={{
        legend: {
          direction: 'row',
          position: { vertical: 'bottom', horizontal: 'middle' },
          padding: 2,
        },
      }}
      sx={{
        '.MuiChartsLegend-label': {
          fill: darkMode ? '#fff' : '#000',
        },
      }}
    />
  );

  return (
    <Box sx={{ 
      backgroundColor: darkModeBg, 
      minHeight: '100vh',
      width: '100%',
      transition: 'background-color 0.3s ease'
    }}>
      <Navigation />
      <Box sx={{ 
        pt: 0,
        px: { xs: 2, sm: 3, md: 4 },
        pb: 6,
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '100%'
      }}>
        {/* Enhanced Header */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 3,
          borderBottom: 1,
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider',
          pb: 2
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: darkModeText,
            letterSpacing: '0.5px',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}>
            Property Dashboard
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            '& .MuiChip-root': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider',
              color: darkModeSecondaryText
            }
          }}>
            <Chip 
              label="Last updated: Today" 
              variant="outlined" 
              size="small"
              sx={{ 
                borderRadius: 1,
                height: 32
              }} 
            />
            <IconButton 
              onClick={toggleDarkMode} 
              sx={{
                color: darkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)'
                }
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <MetricCard 
            title="Total Properties" 
            value={metrics.totalProperties} 
            trend="+2.1%" 
            icon={ApartmentIcon} 
            color="primary" 
          />
          <MetricCard 
            title="Occupied Units" 
            value={metrics.occupiedUnits} 
            icon={PeopleIcon} 
            color="success" 
          />
          <MetricCard 
            title="Vacancy Rate" 
            value={`${metrics.vacancyRate}%`} 
            icon={HomeWorkIcon} 
            color="warning" 
          />
          <MetricCard 
            title="Monthly Income" 
            value={`$${metrics.monthlyIncome.toLocaleString()}`} 
            icon={MonetizationOnIcon} 
            color="info" 
          />
          <MetricCard 
            title="Net Operating Income" 
            value={`$${metrics.noi.toLocaleString()}`} 
            icon={MonetizationOnIcon} 
            color="success" 
          />
          <MetricCard 
            title="Cash Flow" 
            value={`$${metrics.cashFlow.toLocaleString()}`} 
            icon={MonetizationOnIcon} 
            color="info" 
          />
        </Grid>

        {/* Enhanced Financial Performance Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              p: 3, 
              bgcolor: darkModeCardBg,
              borderRadius: 2,
              boxShadow: darkMode 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: darkMode 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
              }}>
                <Typography variant="h6" sx={{ 
                  color: darkModeText,
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                Financial Overview
              </Typography>
                <Select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  size="small"
                  sx={{
                    minWidth: 120,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </Box>
              {incomeBarChart}
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: 3, 
              bgcolor: darkModeCardBg,
              borderRadius: 2,
              boxShadow: darkMode 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: darkMode 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                color: darkModeText,
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}>
                Property Type Distribution
              </Typography>
              {propertyTypePieChart}
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Notifications Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: { xs: 300, md: 400 },
              bgcolor: darkModeCardBg,
            borderRadius: 2,
              boxShadow: darkMode 
              ? '0 4px 20px rgba(0,0,0,0.5)' 
              : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-4px)', 
                boxShadow: darkMode 
                ? '0 8px 30px rgba(0,0,0,0.7)' 
                : '0 8px 30px rgba(0,0,0,0.15)' 
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                  mb: 3, 
                gap: 1 
              }}>
                  <NotificationsIcon sx={{ color: darkMode ? 'primary.light' : 'primary.main' }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: darkModeText,
                  letterSpacing: '0.5px'
                }}>
                  Recent Notifications
                </Typography>
              </Box>
                <List dense sx={{ 
                  overflow: 'auto', 
                  flexGrow: 1,
                  '& .MuiListItem-root': {
                    borderRadius: 1,
                    mb: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                    }
                  }
                }}>
                {mockNotifications.map((note) => (
                  <ListItem 
                    key={note.id} 
                    sx={{ 
                        bgcolor: note.priority === 'high' 
                          ? darkMode ? 'error.dark' : 'error.light'
                          : darkMode ? 'rgba(255,255,255,0.05)' : 'action.hover'
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
                          <Box component="span" sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            color: darkModeSecondaryText
                          }}>
                            <Typography variant="caption">
                            {new Date(note.date).toLocaleDateString()}
                          </Typography>
                            <Typography variant="caption">
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

          {/* Enhanced Property List Section */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              bgcolor: darkModeCardBg,
              borderRadius: 2,
              boxShadow: darkMode 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: darkMode 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)' 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3 
                }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: darkModeText,
                  letterSpacing: '0.5px'
                }}>
                  Property List
                </Typography>
                  <TextField
                    size="small"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '& fieldset': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                        },
                        '&:hover fieldset': {
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'primary.main'
                        }
                      }
                    }}
                  />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          color: darkModeSecondaryText,
                          fontWeight: 600,
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                        }}>Property</TableCell>
                        <TableCell sx={{ 
                          color: darkModeSecondaryText,
                          fontWeight: 600,
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                        }}>Address</TableCell>
                        <TableCell sx={{ 
                          color: darkModeSecondaryText,
                          fontWeight: 600,
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                        }}>Tenants</TableCell>
                        <TableCell sx={{ 
                          color: darkModeSecondaryText,
                          fontWeight: 600,
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
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
                          <TableCell sx={{ 
                            color: darkModeText,
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                          }}>{prop.name}</TableCell>
                          <TableCell sx={{ 
                            color: darkModeText,
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                          }}>{prop.address}</TableCell>
                          <TableCell sx={{ 
                            color: darkModeText,
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                          }}>{prop.tenants}</TableCell>
                          <TableCell sx={{ 
                            color: darkModeText,
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                          }}>
                            <Chip 
                              label={prop.status} 
                              size="small"
                              color={prop.status === 'Occupied' ? 'success' : 'warning'}
                              sx={{ 
                                borderRadius: 1,
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Maintenance Requests Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ 
              bgcolor: darkModeCardBg,
              borderRadius: 2,
              boxShadow: darkMode 
                ? '0 4px 20px rgba(0,0,0,0.5)' 
                : '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: darkMode 
                  ? '0 8px 30px rgba(0,0,0,0.7)' 
                  : '0 8px 30px rgba(0,0,0,0.15)' 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
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
                        bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        '&:hover': { 
                          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)' 
                        },
                        transition: 'all 0.2s ease',
                        borderRadius: 1,
                        mb: 1
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
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1,
                            mt: 0.5
                          }}>
                            <Chip 
                              label={req.status} 
                              size="small"
                              color={
                                req.status === 'Completed' ? 'success' :
                                req.status === 'In Progress' ? 'warning' : 'error'
                              }
                              sx={{ 
                                borderRadius: 1,
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
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

        {/* Enhanced Export Button */}
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
              transition: 'all 0.2s ease',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: 4 
              }
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