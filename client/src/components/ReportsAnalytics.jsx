import React, { useState, useCallback, Suspense } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Tabs, Tab, 
  Select, MenuItem, FormControl, InputLabel, Button, IconButton,
  LinearProgress, Chip, useTheme, Stack, Tooltip, Container,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, Menu, Autocomplete, CircularProgress
} from '@mui/material';
import { 
  LineChart, BarChart, PieChart, ScatterChart
} from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Download, Print, ShowChart, Money, Home, People, Build, 
  Timeline, Analytics, DarkMode, LightMode, Assessment,
  ArrowUpward, ArrowDownward, Star, Warning, FilterList,
  FileDownload, Share, Settings, Refresh
} from '@mui/icons-material';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';

// Enhanced Mock Data with Proper Structure
const mockFinancialData = {
  netProfit: 248765,
  profitGrowth: 12.5,
  income: [125, 135, 142, 156, 168, 182, 195, 210, 225, 238, 252, 265].map(v => v * 1000),
  expenses: [85, 88, 92, 95, 102, 108, 112, 115, 120, 125, 130, 135].map(v => v * 1000),
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  portfolioAllocation: [
    { id: 0, value: 35, label: 'Residential' },
    { id: 1, value: 25, label: 'Commercial' },
    { id: 2, value: 20, label: 'Industrial' },
    { id: 3, value: 15, label: 'Retail' },
    { id: 4, value: 5, label: 'Special Purpose' }
  ],
  expenseCategories: [
    { id: 1, label: 'Maintenance', value: 48500 },
    { id: 2, label: 'Utilities', value: 32500 },
    { id: 3, label: 'Taxes', value: 78500 },
    { id: 4, label: 'Insurance', value: 42500 },
    { id: 5, label: 'Management', value: 36500 },
    { id: 6, label: 'Marketing', value: 18500 }
  ]
};

const mockPropertyMetrics = {
  avgOccupancy: 92.5,
  properties: ['Sunrise', 'Ocean View', 'Mountain Top', 'City Center'],
  occupancyRates: [92, 88, 95, 82],
  valueMetrics: [
    { id: 1, name: 'Cap Rate', value: 6.2 },
    { id: 2, name: 'Appreciation', value: 3.2 },
    { id: 3, name: 'Rental Growth', value: 2.5 },
    { id: 4, name: 'NOI', value: 8.1 }
  ]
};

const mockTenantMetrics = {
  retentionRate: 85,
  newTenants: 12,
  tenantSatisfaction: 4.7,
  leaseBreakdown: [
    { id: 1, type: '1-year', value: 45 },
    { id: 2, type: '2-year', value: 32 },
    { id: 3, type: 'Month-to-month', value: 18 },
    { id: 4, type: 'Commercial', value: 22 }
  ],
  tenantGrowth: [
    { year: '2020', tenants: 120 },
    { year: '2021', tenants: 145 },
    { year: '2022', tenants: 165 },
    { year: '2023', tenants: 195 }
  ],
  satisfactionTrend: [
    { quarter: 'Q1', rating: 4.2 },
    { quarter: 'Q2', rating: 4.5 },
    { quarter: 'Q3', rating: 4.6 },
    { quarter: 'Q4', rating: 4.7 }
  ]
};

const mockMaintenanceData = {
  roi: 3.2,
  costSavings: 42,
  tickets: [
    { id: 1, type: 'Plumbing', responseTime: 24, cost: 420 },
    { id: 2, type: 'Electrical', responseTime: 18, cost: 380 },
    { id: 3, type: 'HVAC', responseTime: 36, cost: 520 },
    { id: 4, type: 'Structural', responseTime: 72, cost: 480 }
  ],
  trends: [
    { month: 'Jan', tickets: 45, cost: 1200 },
    { month: 'Feb', tickets: 42, cost: 1150 },
    { month: 'Mar', tickets: 40, cost: 1100 },
    { month: 'Apr', tickets: 38, cost: 1050 },
    { month: 'May', tickets: 36, cost: 1000 },
    { month: 'Jun', tickets: 35, cost: 980 }
  ]
};

const mockPredictiveData = {
  occupancy: [
    { month: 'Jan', actual: 88, forecast: 89 },
    { month: 'Feb', actual: 89, forecast: 90 },
    { month: 'Mar', actual: 90, forecast: 91 },
    { month: 'Apr', actual: 91, forecast: 92 },
    { month: 'May', actual: 92, forecast: 93 },
    { month: 'Jun', actual: 93, forecast: 94 }
  ],
  revenue: [
    { quarter: 'Q1', projection: 125000 },
    { quarter: 'Q2', projection: 130000 },
    { quarter: 'Q3', projection: 135000 },
    { quarter: 'Q4', projection: 140000 }
  ],
  expenses: [
    { year: '2023', projection: 85000 },
    { year: '2024', projection: 90000 },
    { year: '2025', projection: 95000 }
  ],
  netIncome: [
    { year: '2023', projection: 40000 },
    { year: '2024', projection: 45000 },
    { year: '2025', projection: 50000 }
  ]
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong loading this section.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Loading Fallback Component
const LoadingFallback = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <CircularProgress />
    <Typography variant="body1" sx={{ mt: 2 }}>
      Loading analytics data...
    </Typography>
  </Box>
);

const ReportsAnalytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('last_month');
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();
  
  // New state variables for enhanced features
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshInterval, setRefreshInterval] = useState(0);
  
  // Filter options
  const metricOptions = [
    'Revenue', 'Expenses', 'Occupancy', 'Maintenance',
    'Tenant Satisfaction', 'Response Time', 'ROI'
  ];

  const propertyOptions = mockPropertyMetrics.properties;

  // Handle filter menu
  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  // Error handling for data refresh
  const handleRefreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSnackbar({
        open: true,
        message: 'Data refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to refresh data. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Error handling for export
  const handleExport = async (format) => {
    try {
      setIsLoading(true);
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExportDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Report exported as ${format.toUpperCase()} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      setSnackbar({
        open: true,
        message: `Failed to export as ${format.toUpperCase()}. Please try again.`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chart data loading errors
  const handleChartError = (error) => {
    console.error('Chart rendering error:', error);
    setSnackbar({
      open: true,
      message: 'Error loading chart data. Please refresh the page.',
      severity: 'error'
    });
  };

  // Auto-refresh effect
  React.useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(handleRefreshData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, handleRefreshData]);

  useAutoLogout();

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const chartColors = {
    light: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'],
    dark: ['#00E676', '#40C4FF', '#FFD740', '#FF5252', '#D500F9']
  };
  const currentColors = darkMode ? chartColors.dark : chartColors.light;

  // Data Grid columns
  const propertyColumns = [
    { field: 'name', headerName: 'Property', width: 200 },
    { field: 'occupancy', headerName: 'Occupancy (%)', width: 150 },
    { 
      field: 'value', 
      headerName: 'Value', 
      width: 150, 
      valueFormatter: (params) => params.value ? `$${params.value.toLocaleString()}` : 'N/A'
    }
  ];

  const tenantColumns = [
    { field: 'type', headerName: 'Lease Type', width: 150 },
    { field: 'value', headerName: 'Count', width: 120 }
  ];

  const maintenanceColumns = [
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'responseTime', headerName: 'Response (hrs)', width: 150 },
    { 
      field: 'cost', 
      headerName: 'Avg Cost', 
      width: 150, 
      valueFormatter: (params) => params.value ? `$${params.value}` : 'N/A'
    }
  ];

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: darkMode ? '#121212' : '#f5f5f5',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            
            <Container maxWidth="xl" sx={{ p: 3 }}>
              {/* Header Section */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: darkMode ? 'primary.light' : 'primary.main',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Analytics sx={{ mr: 1, fontSize: '2rem' }} />
                  Advanced Property Analytics
                </Typography>
                <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                  <IconButton onClick={toggleDarkMode} sx={{ ml: 2 }}>
                    {darkMode ? <LightMode /> : <DarkMode />}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Loading Progress */}
              {isLoading && (
                <LinearProgress 
                  sx={{ 
                    mb: 2,
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: currentColors[0]
                    }
                  }} 
                />
              )}

              {/* Control Panel */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={handleFilterClick}
                    sx={{
                      borderColor: currentColors[0],
                      color: currentColors[0]
                    }}
                  >
                    Filters
                  </Button>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Auto Refresh</InputLabel>
                    <Select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(e.target.value)}
                      label="Auto Refresh"
                    >
                      <MenuItem value={0}>Off</MenuItem>
                      <MenuItem value={30}>30 seconds</MenuItem>
                      <MenuItem value={60}>1 minute</MenuItem>
                      <MenuItem value={300}>5 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRefreshData}
                    sx={{
                      borderColor: currentColors[0],
                      color: currentColors[0]
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FileDownload />}
                    onClick={() => setExportDialogOpen(true)}
                    sx={{
                      backgroundColor: currentColors[0],
                      '&:hover': { backgroundColor: currentColors[0], opacity: 0.9 }
                    }}
                  >
                    Export
                  </Button>
                </Stack>
              </Box>

              {/* Filter Menu */}
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    width: 350,
                    backgroundColor: darkMode ? '#1e1e1e' : '#fff'
                  }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Filter Analytics
                  </Typography>
                  <Stack spacing={2}>
                    <DatePicker
                      label="Start Date"
                      value={dateRange[0]}
                      onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true }
                      }}
                    />
                    <DatePicker
                      label="End Date"
                      value={dateRange[1]}
                      onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true }
                      }}
                    />
                    <Autocomplete
                      multiple
                      size="small"
                      options={propertyOptions}
                      value={selectedProperties}
                      onChange={(event, newValue) => setSelectedProperties(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Properties" />
                      )}
                    />
                    <Autocomplete
                      multiple
                      size="small"
                      options={metricOptions}
                      value={selectedMetrics}
                      onChange={(event, newValue) => setSelectedMetrics(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Metrics" />
                      )}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        handleFilterClose();
                        handleRefreshData();
                      }}
                      sx={{
                        backgroundColor: currentColors[0],
                        '&:hover': { backgroundColor: currentColors[0], opacity: 0.9 }
                      }}
                    >
                      Apply Filters
                    </Button>
                  </Stack>
                </Box>
              </Menu>

              {/* Export Dialog */}
              <Dialog 
                open={exportDialogOpen} 
                onClose={() => setExportDialogOpen(false)}
                PaperProps={{
                  sx: {
                    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                    minWidth: 400
                  }
                }}
              >
                <DialogTitle>Export Report</DialogTitle>
                <DialogContent>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Choose the format to export your analytics report:
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={() => handleExport('pdf')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Export as PDF
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={() => handleExport('excel')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Export as Excel
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={() => handleExport('csv')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Export as CSV
                    </Button>
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                </DialogActions>
              </Dialog>

              {/* Snackbar Notifications */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Alert 
                  onClose={() => setSnackbar({ ...snackbar, open: false })} 
                  severity={snackbar.severity}
                  sx={{ width: '100%' }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>

              {/* Quick Stats Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { 
                    icon: <Money sx={{ fontSize: 30, color: currentColors[0] }} />,
                    title: 'Net Profit',
                    value: `$${mockFinancialData.netProfit.toLocaleString()}`,
                    growth: mockFinancialData.profitGrowth
                  },
                  { 
                    icon: <Home sx={{ fontSize: 30, color: currentColors[1] }} />,
                    title: 'Avg Occupancy',
                    value: `${mockPropertyMetrics.avgOccupancy}%`,
                    progress: mockPropertyMetrics.avgOccupancy
                  },
                  { 
                    icon: <People sx={{ fontSize: 30, color: currentColors[2] }} />,
                    title: 'Tenant Retention',
                    value: `${mockTenantMetrics.retentionRate}%`,
                    extra: `${mockTenantMetrics.newTenants} New`
                  },
                  { 
                    icon: <Build sx={{ fontSize: 30, color: currentColors[3] }} />,
                    title: 'Maintenance ROI',
                    value: `${mockMaintenanceData.roi}x`,
                    extra: `Saved $${mockMaintenanceData.costSavings}k`
                  }
                ].map((card, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ 
                      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 2,
                      boxShadow: 'none',
                      p: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {card.icon}
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {card.title}
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 0.5 }}>
                            {card.value}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        {card.growth && (
                          <Chip 
                            icon={card.growth > 0 ? <ArrowUpward sx={{ fontSize: 12 }} /> : <ArrowDownward sx={{ fontSize: 12 }} />}
                              label={`${card.growth}%`} 
                              size="small"
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem',
                                backgroundColor: card.growth > 0 ? (darkMode ? '#1B5E20' : '#C8E6C9') : (darkMode ? '#B71C1C' : '#FFCDD2'),
                                color: card.growth > 0 ? (darkMode ? '#A5D6A7' : '#2E7D32') : (darkMode ? '#EF9A9A' : '#C62828')
                              }}
                          />
                        )}
                        {card.extra && (
                          <Typography variant="caption" sx={{ 
                            display: 'block',
                            color: darkMode ? '#90CAF9' : '#1976D2',
                            mt: 0.5
                          }}>
                            {card.extra}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Tabs Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTabs-indicator': {
                      height: 2,
                      backgroundColor: currentColors[0]
                    }
                  }}
                >
                  {['Financials', 'Properties', 'Tenants', 'Maintenance', 'Predictive'].map((label, index) => (
                    <Tab key={index} label={
                      <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, px: 1.5 }}>
                        {[<ShowChart />, <Home />, <People />, <Build />, <Assessment />][index]}
                        <span style={{ marginLeft: 6, fontSize: '0.875rem' }}>{label}</span>
                      </Box>
                    } />
                  ))}
                </Tabs>
              </Box>

              {/* Financial Performance Tab */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={8}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>Cash Flow Analysis</Typography>
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Time Range</InputLabel>
                            <Select 
                              value={timeRange} 
                              onChange={(e) => setTimeRange(e.target.value)}
                              label="Time Range"
                            >
                              <MenuItem value="last_week">Last Week</MenuItem>
                              <MenuItem value="last_month">Last Month</MenuItem>
                              <MenuItem value="last_quarter">Last Quarter</MenuItem>
                              <MenuItem value="last_year">Last Year</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Box sx={{ height: 300 }}>
                          <BarChart
                            series={[
                              { 
                                data: mockFinancialData.income,
                                label: 'Revenue',
                                color: currentColors[0]
                              },
                              { 
                                data: mockFinancialData.expenses,
                                label: 'Expenses',
                                color: currentColors[3]
                              }
                            ]}
                            xAxis={[{ 
                              data: mockFinancialData.months, 
                              scaleType: 'band',
                              label: 'Month'
                            }]}
                            yAxis={[{
                              label: 'Amount ($)'
                            }]}
                            margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                            slotProps={{
                              legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                labelStyle: {
                                  fontSize: 12,
                                  fill: darkMode ? '#fff' : '#666'
                                }
                              },
                              bar: {
                                rx: 4,
                                width: 30
                              }
                            }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={4}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Portfolio Allocation</Typography>
                        <Box sx={{ height: 250 }}>
                          <PieChart
                            series={[
                              { 
                                data: mockFinancialData.portfolioAllocation,
                                arcLabel: (item) => `${item.value}%`,
                                outerRadius: 80,
                                innerRadius: 40,
                                paddingAngle: 2,
                                cornerRadius: 4
                              }
                            ]}
                            colors={currentColors}
                            slotProps={{
                              legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                labelStyle: {
                                  fontSize: 12,
                                  fill: darkMode ? '#fff' : '#666'
                                }
                              }
                            }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Property Metrics Tab */}
              {tabValue === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Property Performance</Typography>
                        <Box sx={{ height: 300 }}>
                          <PieChart
                            series={[
                              { 
                                data: mockPropertyMetrics.properties.map((property, index) => ({
                                  id: index,
                                  value: mockPropertyMetrics.occupancyRates[index],
                                  label: property
                                })),
                                arcLabel: (item) => `${item.value}%`,
                                outerRadius: 80,
                                innerRadius: 40,
                                paddingAngle: 2,
                                cornerRadius: 4
                              }
                            ]}
                            colors={currentColors}
                            slotProps={{
                              legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                labelStyle: {
                                  fontSize: 12,
                                  fill: darkMode ? '#fff' : '#666'
                                }
                              }
                            }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Value Metrics</Typography>
                        <Box sx={{ height: 300 }}>
                          <BarChart
                            series={[
                              { 
                                data: mockPropertyMetrics.valueMetrics.map(item => item.value),
                                label: 'Value (%)',
                                color: currentColors[0]
                              }
                            ]}
                            xAxis={[{ 
                              data: mockPropertyMetrics.valueMetrics.map(item => item.name),
                              scaleType: 'band',
                              label: 'Metric'
                            }]}
                            yAxis={[{
                              label: 'Value (%)'
                            }]}
                            margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Tenant Metrics Tab */}
              {tabValue === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Tenant Growth</Typography>
                        <Box sx={{ height: 300 }}>
                          <BarChart
                            series={[
                              { 
                                data: mockTenantMetrics.tenantGrowth.map(item => item.tenants),
                                label: 'Tenant Count',
                                color: currentColors[1]
                              }
                            ]}
                            xAxis={[{ 
                              data: mockTenantMetrics.tenantGrowth.map(item => item.year),
                              scaleType: 'band',
                              label: 'Year'
                            }]}
                            yAxis={[{
                              label: 'Number of Tenants'
                            }]}
                            margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Satisfaction Trend</Typography>
                        <Box sx={{ height: 300 }}>
                          <PieChart
                            series={[
                              { 
                                data: mockTenantMetrics.satisfactionTrend.map((item, index) => ({
                                  id: index,
                                  value: item.rating * 20,
                                  label: item.quarter
                                })),
                                arcLabel: (item) => `${item.value/20}`,
                                outerRadius: 80,
                                innerRadius: 40,
                                paddingAngle: 2,
                                cornerRadius: 4
                              }
                            ]}
                            colors={currentColors}
                            slotProps={{
                              legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                labelStyle: {
                                  fontSize: 12,
                                  fill: darkMode ? '#fff' : '#666'
                                }
                              }
                            }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Maintenance Metrics Tab */}
              {tabValue === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Maintenance Trends</Typography>
                        <Box sx={{ height: 300 }}>
                          <BarChart
                            series={[
                              { 
                                data: mockMaintenanceData.trends.map(item => item.tickets),
                                label: 'Ticket Count',
                                color: currentColors[3]
                              }
                            ]}
                            xAxis={[{ 
                              data: mockMaintenanceData.trends.map(item => item.month),
                              scaleType: 'band',
                              label: 'Month'
                            }]}
                            yAxis={[{
                              label: 'Ticket Count'
                            }]}
                            margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Response Times</Typography>
                        <Box sx={{ height: 300 }}>
                          <BarChart
                            series={[
                              { 
                                data: mockMaintenanceData.tickets.map(t => t.responseTime),
                                label: 'Hours',
                                color: currentColors[1]
                              }
                            ]}
                            xAxis={[{ 
                              data: mockMaintenanceData.tickets.map(t => t.type),
                              scaleType: 'band',
                              label: 'Ticket Type'
                            }]}
                            yAxis={[{
                              label: 'Response Time (hours)'
                            }]}
                            margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Predictive Analytics Tab */}
              {tabValue === 4 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Occupancy Forecast</Typography>
                        <Box sx={{ height: 300 }}>
                          <BarChart
                            series={[
                              { 
                                data: mockPredictiveData.occupancy.map(item => item.actual),
                                label: 'Actual',
                                color: currentColors[1]
                              },
                              { 
                                data: mockPredictiveData.occupancy.map(item => item.forecast),
                                label: 'Forecast',
                                color: currentColors[2]
                              }
                            ]}
                            xAxis={[{ 
                              data: mockPredictiveData.occupancy.map(item => item.month),
                              scaleType: 'band',
                              label: 'Month'
                            }]}
                            yAxis={[{
                              label: 'Occupancy (%)'
                            }]}
                            margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Revenue Projections</Typography>
                        <Box sx={{ height: 300 }}>
                          <BarChart
                            series={[
                              { 
                                data: mockPredictiveData.revenue.map(item => item.projection),
                                label: 'Projection',
                                color: currentColors[0]
                              }
                            ]}
                            xAxis={[{ 
                              data: mockPredictiveData.revenue.map(item => item.quarter),
                              scaleType: 'band',
                              label: 'Quarter'
                            }]}
                            yAxis={[{
                              label: 'Amount ($)'
                            }]}
                            margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                            onError={handleChartError}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Container>
          </Box>
        </LocalizationProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ReportsAnalytics;
