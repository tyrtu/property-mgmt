import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Tabs, Tab, 
  Select, MenuItem, FormControl, InputLabel, Button, IconButton,
  LinearProgress, Chip, useTheme, Paper, Stack, Tooltip
} from '@mui/material';
import { 
  LineChart, BarChart, PieChart, 
  AreaChart, ChartsContainer
} from '@mui/x-charts';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download, Print, ShowChart, Money, Home, People, Build, 
  Timeline, Analytics, DarkMode, LightMode, Assessment
} from '@mui/icons-material';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';

// Comprehensive Mock Data
const mockFinancialData = {
  netProfit: 248765,
  profitGrowth: 12.5,
  income: [125000, 135000, 142000, 156000, 168000, 182000, 195000, 210000, 225000, 238000, 252000, 265000],
  expenses: [85000, 88000, 92000, 95000, 102000, 108000, 112000, 115000, 120000, 125000, 130000, 135000],
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
  properties: [
    { id: 1, name: 'Downtown Apartments', occupancy: 95, value: 4200000 },
    { id: 2, name: 'Riverside Office', occupancy: 88, value: 3800000 },
    { id: 3, name: 'Industrial Park', occupancy: 97, value: 5200000 },
    { id: 4, name: 'Shopping Plaza', occupancy: 90, value: 4800000 }
  ],
  capRates: [6.2, 5.8, 7.1, 6.5],
  appreciation: [3.2, 2.8, 4.1, 3.5]
};

const mockTenantMetrics = {
  retentionRate: 85,
  newTenants: 12,
  tenantSatisfaction: 4.7,
  leaseBreakdown: [
    { id: 1, type: '1-year', count: 45 },
    { id: 2, type: '2-year', count: 32 },
    { id: 3, type: 'Month-to-month', count: 18 },
    { id: 4, type: 'Commercial', count: 22 }
  ],
  delinquencyRate: 2.3
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
  preventiveMaintenance: 78,
  emergencyMaintenance: 22
};

const mockPredictiveData = {
  occupancyActual: [88, 89, 90, 91, 92, 93, 94, 93, 92, 91, 90, 89],
  occupancyForecast: [89, 90, 91, 92, 93, 94, 95, 94, 93, 92, 91, 90],
  forecastMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  revenueProjections: [125000, 130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 170000, 175000, 180000],
  forecastQuarters: ['Q1', 'Q2', 'Q3', 'Q4'],
  expenseTrend: [85000, 87000, 89000, 91000, 93000, 95000, 97000, 99000, 101000, 103000, 105000, 107000],
  netIncomeProjection: [40000, 43000, 46000, 49000, 52000, 55000, 58000, 61000, 64000, 67000, 70000, 73000]
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
            <Tab label={<><Assessment /> Predictive</>} />
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
                    <ChartsContainer>
                      <AreaChart
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
                    </ChartsContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Portfolio Health</Typography>
                    <ChartsContainer>
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
                    </ChartsContainer>
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

          {/* Property Metrics Tab */}
          {tabValue === 1 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Property Performance</Typography>
                    <ChartsContainer>
                      <BarChart
                        series={[
                          { 
                            data: mockPropertyMetrics.properties.map(p => p.occupancy),
                            label: 'Occupancy Rate (%)',
                            color: currentColors[1]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockPropertyMetrics.properties.map(p => p.name),
                          scaleType: 'band',
                          label: 'Properties'
                        }]}
                        height={400}
                      />
                    </ChartsContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Value Appreciation</Typography>
                    <ChartsContainer>
                      <LineChart
                        series={[
                          { 
                            data: mockPropertyMetrics.capRates,
                            label: 'Cap Rates (%)',
                            color: currentColors[0]
                          },
                          { 
                            data: mockPropertyMetrics.appreciation,
                            label: 'Appreciation (%)',
                            color: currentColors[2]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockPropertyMetrics.properties.map(p => p.name),
                          scaleType: 'band',
                          label: 'Properties'
                        }]}
                        height={400}
                      />
                    </ChartsContainer>
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
                    <ChartsContainer>
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
                    </ChartsContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Revenue Projections</Typography>
                    <ChartsContainer>
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
                    </ChartsContainer>
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