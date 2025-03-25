import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Tabs, Tab, 
  Select, MenuItem, FormControl, InputLabel, Button, IconButton,
  LinearProgress, Chip, useTheme, Paper, Stack, Tooltip
} from '@mui/material';
import { 
  LineChart, BarChart, PieChart, ScatterChart, SparkLineChart,
  AreaPlot, BarPlot, MarkPlot, LinePlot, PieArcLabel
} from '@mui/x-charts';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download, Print, ShowChart, Money, Home, People, Build, 
  Predictions, Timeline, Analytics, DarkMode, LightMode
} from '@mui/icons-material';
import Navigation from './Navigation';
import { 
  mockFinancialData, mockPropertyMetrics, 
  mockMaintenanceData, mockPredictiveData 
} from '../mockData';
import useAutoLogout from '../hooks/useAutoLogout';

// Inline mock data for tenant metrics
const mockTenantMetrics = {
  retentionRate: 85,
  newTenants: 12
};

const ReportsAnalytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('last_month');
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();

  useAutoLogout();

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Chart color schemes
  const chartColors = {
    light: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'],
    dark: ['#00E676', '#40C4FF', '#FFD740', '#FF5252', '#D500F9']
  };
  const currentColors = darkMode ? chartColors.dark : chartColors.light;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        color: darkMode ? '#fff' : 'text.primary'
      }}>
        <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: darkMode ? 'primary.light' : 'primary.main'
            }}>
              <Analytics sx={{ verticalAlign: 'middle', mr: 1 }} />
              Advanced Property Analytics
            </Typography>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleDarkMode}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Quick Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Money sx={{ fontSize: 40, color: currentColors[0] }} />
                    <Box>
                      <Typography variant="h6">Net Profit</Typography>
                      <Typography variant="h4">
                        ${mockFinancialData.netProfit.toLocaleString()}
                      </Typography>
                      <Chip 
                        label={`${mockFinancialData.profitGrowth}% Growth`} 
                        color="success" 
                        size="small"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Home sx={{ fontSize: 40, color: currentColors[1] }} />
                    <Box>
                      <Typography variant="h6">Avg Occupancy</Typography>
                      <Typography variant="h4">
                        {mockPropertyMetrics.avgOccupancy}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={mockPropertyMetrics.avgOccupancy} 
                        sx={{ height: 6, mt: 1 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <People sx={{ fontSize: 40, color: currentColors[2] }} />
                    <Box>
                      <Typography variant="h6">Tenant Retention</Typography>
                      <Typography variant="h4">
                        {mockTenantMetrics.retentionRate}%
                      </Typography>
                      <Chip 
                        label={`${mockTenantMetrics.newTenants} New`} 
                        color="info" 
                        size="small"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Build sx={{ fontSize: 40, color: currentColors[3] }} />
                    <Box>
                      <Typography variant="h6">Maintenance ROI</Typography>
                      <Typography variant="h4">
                        {mockMaintenanceData.roi}x
                      </Typography>
                      <Chip 
                        label={`Saved $${mockMaintenanceData.costSavings}k`} 
                        color="warning" 
                        size="small"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }}>
            <Tab label={<><ShowChart /> Financials</>} />
            <Tab label={<><Home /> Properties</>} />
            <Tab label={<><People /> Tenants</>} />
            <Tab label={<><Build /> Maintenance</>} />
            <Tab label={<><Predictions /> Predictive</>} />
          </Tabs>

          {/* Financial Performance Tab */}
          {tabValue === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6">Cash Flow Analysis</Typography>
                      <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <MenuItem value="last_week">Last Week</MenuItem>
                        <MenuItem value="last_month">Last Month</MenuItem>
                        <MenuItem value="last_quarter">Last Quarter</MenuItem>
                        <MenuItem value="last_year">Last Year</MenuItem>
                      </Select>
                    </Box>
                    <AreaPlot
                      series={[
                        { 
                          data: mockFinancialData.income, 
                          label: 'Revenue',
                          color: currentColors[0],
                          area: { fill: 'rgba(76, 175, 80, 0.1)' }
                        },
                        { 
                          data: mockFinancialData.expenses, 
                          label: 'Expenses',
                          color: currentColors[3],
                          area: { fill: 'rgba(244, 67, 54, 0.1)' }
                        }
                      ]}
                      xAxis={[{ data: mockFinancialData.months, scaleType: 'band' }]}
                      height={400}
                      margin={{ left: 70 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Portfolio Health</Typography>
                    <PieChart
                      series={[
                        { 
                          data: mockFinancialData.portfolioAllocation,
                          arcLabel: (item) => `${item.label} (${item.value}%)`,
                          outerRadius: 100,
                          innerRadius: 50,
                          paddingAngle: 5,
                          cornerRadius: 5
                        }
                      ]}
                      colors={currentColors}
                      height={300}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {mockFinancialData.expenseCategories.map((category) => (
                        <Stack key={category.id} direction="row" justifyContent="space-between" spacing={2} sx={{ p: 1 }}>
                          <Chip label={category.label} size="small" />
                          <Typography>${category.value.toLocaleString()}</Typography>
                        </Stack>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Predictive Analytics Tab */}
          {tabValue === 4 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Occupancy Forecast</Typography>
                    <LineChart
                      series={[
                        { 
                          data: mockPredictiveData.occupancyActual, 
                          label: 'Actual',
                          color: currentColors[1],
                          showMark: false
                        },
                        { 
                          data: mockPredictiveData.occupancyForecast, 
                          label: 'Forecast',
                          color: currentColors[2],
                          curve: "step",
                          area: true,
                          showMark: false
                        }
                      ]}
                      xAxis={[{ data: mockPredictiveData.forecastMonths }]}
                      height={400}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Revenue Projections</Typography>
                    <BarChart
                      series={[
                        { 
                          data: mockPredictiveData.revenueProjections,
                          label: 'Projected Revenue',
                          color: currentColors[0]
                        }
                      ]}
                      xAxis={[{ data: mockPredictiveData.forecastQuarters, scaleType: 'band' }]}
                      height={400}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Export Controls */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Download />}>
              Export PDF
            </Button>
            <Button variant="outlined" startIcon={<Print />}>
              Print Report
            </Button>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportsAnalytics;