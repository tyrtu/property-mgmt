import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Tabs, Tab, 
  Select, MenuItem, FormControl, InputLabel, Button, IconButton,
  LinearProgress, Chip, useTheme, Stack, Tooltip, Container
} from '@mui/material';
import { 
  LineChart, BarChart, PieChart
} from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download, Print, ShowChart, Money, Home, People, Build, 
  Timeline, Analytics, DarkMode, LightMode, Assessment,
  ArrowUpward, ArrowDownward, Star, Warning
} from '@mui/icons-material';
import Navigation from './Navigation';
import useAutoLogout from '../hooks/useAutoLogout';

// Updated Comprehensive Mock Data
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
    { id: 1, type: '1-year', value: 45 },
    { id: 2, type: '2-year', value: 32 },
    { id: 3, type: 'Month-to-month', value: 18 },
    { id: 4, type: 'Commercial', value: 22 }
  ],
  delinquencyRate: 2.3,
  tenantGrowth: [120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175],
  satisfactionTrend: [4.2, 4.3, 4.4, 4.5, 4.6, 4.5, 4.6, 4.7, 4.7, 4.8, 4.7, 4.7]
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
  emergencyMaintenance: 22,
  responseTimes: [24, 18, 36, 72],
  ticketTrend: [45, 42, 40, 38, 36, 35, 34, 33, 32, 31, 30, 28],
  costTrend: [12000, 11500, 11000, 10500, 10000, 9800, 9500, 9200, 9000, 8800, 8600, 8400]
};

const mockPredictiveData = {
  occupancyActual: [88, 89, 90, 91, 92, 93, 94, 93, 92, 91, 90, 89],
  occupancyForecast: [89, 90, 91, 92, 93, 94, 95, 94, 93, 92, 91, 90],
  forecastMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  revenueProjections: [125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180].map(v => v * 1000),
  forecastQuarters: ['Q1', 'Q2', 'Q3', 'Q4'],
  expenseTrend: [85, 87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 107].map(v => v * 1000),
  netIncomeProjection: [40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73].map(v => v * 1000)
};

const ReportsAnalytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('last_month');
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();

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
            mb: 4
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

          {/* Quick Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                icon: <Money sx={{ fontSize: 34, color: currentColors[0] }} />,
                title: 'Net Profit',
                value: `$${mockFinancialData.netProfit.toLocaleString()}`,
                growth: mockFinancialData.profitGrowth
              },
              { 
                icon: <Home sx={{ fontSize: 34, color: currentColors[1] }} />,
                title: 'Avg Occupancy',
                value: `${mockPropertyMetrics.avgOccupancy}%`,
                progress: mockPropertyMetrics.avgOccupancy
              },
              { 
                icon: <People sx={{ fontSize: 34, color: currentColors[2] }} />,
                title: 'Tenant Retention',
                value: `${mockTenantMetrics.retentionRate}%`,
                extra: `${mockTenantMetrics.newTenants} New`
              },
              { 
                icon: <Build sx={{ fontSize: 34, color: currentColors[3] }} />,
                title: 'Maintenance ROI',
                value: `${mockMaintenanceData.roi}x`,
                extra: `Saved $${mockMaintenanceData.costSavings}k`
              }
            ].map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                  height: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {card.icon}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{card.title}</Typography>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>{card.value}</Typography>
                        {card.growth && (
                          <Chip 
                            icon={card.growth > 0 ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                            label={`${card.growth}%`} 
                            size="small"
                            sx={{ 
                              height: 22,
                              fontSize: '0.75rem',
                              backgroundColor: card.growth > 0 ? (darkMode ? '#1B5E20' : '#C8E6C9') : (darkMode ? '#B71C1C' : '#FFCDD2'),
                              color: card.growth > 0 ? (darkMode ? '#A5D6A7' : '#2E7D32') : (darkMode ? '#EF9A9A' : '#C62828')
                            }}
                          />
                        )}
                        {card.progress && (
                          <LinearProgress 
                            variant="determinate" 
                            value={card.progress} 
                            sx={{ 
                              height: 4, 
                              mt: 1,
                              borderRadius: 3,
                              backgroundColor: darkMode ? '#333' : '#eee',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: currentColors[1]
                              }
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
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                  backgroundColor: currentColors[0]
                }
              }}
            >
              {['Financials', 'Properties', 'Tenants', 'Maintenance', 'Predictive'].map((label, index) => (
                <Tab key={index} label={
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    {[<ShowChart />, <Home />, <People />, <Build />, <Assessment />][index]}
                    <span style={{ marginLeft: 8 }}>{label}</span>
                  </Box>
                } />
              ))}
            </Tabs>
          </Box>

          {/* Financial Performance Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
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
                    <Box sx={{ height: 320 }}>
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
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Expense Breakdown</Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {mockFinancialData.expenseCategories.map((category) => (
                        <Stack 
                          key={category.id} 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center"
                          spacing={2} 
                          sx={{ 
                            p: 0.5,
                            '&:hover': {
                              backgroundColor: darkMode ? '#333' : '#f5f5f5'
                            }
                          }}
                        >
                          <Chip 
                            label={category.label} 
                            size="small" 
                            sx={{ 
                              backgroundColor: darkMode ? '#333' : '#f5f5f5',
                              fontWeight: 'medium'
                            }} 
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ${category.value.toLocaleString()}
                          </Typography>
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Property Performance</Typography>
                    <Box sx={{ height: 300 }}>
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
                        yAxis={[{
                          label: 'Occupancy (%)'
                        }]}
                        margin={{ left: 70, right: 30, top: 20, bottom: 70 }}
                        slotProps={{
                          bar: {
                            rx: 4,
                            width: 30
                          }
                        }}
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
                          label: 'Properties'
                        }]}
                        yAxis={[{
                          label: 'Percentage (%)'
                        }]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Property Portfolio</Typography>
                    <Box sx={{ height: 350 }}>
                      <DataGrid
                        rows={mockPropertyMetrics.properties}
                        columns={propertyColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                        sx={{
                          '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: darkMode ? '#333' : '#f5f5f5'
                          },
                          '& .MuiDataGrid-cell': {
                            borderBottomColor: darkMode ? '#333' : '#f0f0f0'
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tenant Metrics Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Tenant Growth</Typography>
                    <Box sx={{ height: 300 }}>
                      <LineChart
                        series={[
                          { 
                            data: mockTenantMetrics.tenantGrowth,
                            label: 'Tenant Count',
                            color: currentColors[1]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockFinancialData.months,
                          label: 'Month'
                        }]}
                        yAxis={[{
                          label: 'Number of Tenants'
                        }]}
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
                      <LineChart
                        series={[
                          { 
                            data: mockTenantMetrics.satisfactionTrend,
                            label: 'Satisfaction (1-5)',
                            color: currentColors[2]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockFinancialData.months,
                          label: 'Month'
                        }]}
                        yAxis={[{
                          min: 3,
                          max: 5,
                          label: 'Rating'
                        }]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Lease Breakdown</Typography>
                    <Box sx={{ height: 300 }}>
                      <PieChart
                        series={[
                          { 
                            data: mockTenantMetrics.leaseBreakdown,
                            arcLabel: (item) => `${item.value}`,
                            outerRadius: 80,
                            innerRadius: 40,
                            paddingAngle: 2
                          }
                        ]}
                        colors={currentColors}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Lease Types</Typography>
                    <Box sx={{ height: 300 }}>
                      <DataGrid
                        rows={mockTenantMetrics.leaseBreakdown}
                        columns={tenantColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Maintenance Metrics Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Maintenance Tickets</Typography>
                    <Box sx={{ height: 300 }}>
                      <BarChart
                        series={[
                          { 
                            data: mockMaintenanceData.responseTimes,
                            label: 'Response Time (hrs)',
                            color: currentColors[3]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockMaintenanceData.tickets.map(t => t.type),
                          scaleType: 'band',
                          label: 'Ticket Type'
                        }]}
                        yAxis={[{
                          label: 'Hours'
                        }]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Ticket Trends</Typography>
                    <Box sx={{ height: 300 }}>
                      <LineChart
                        series={[
                          { 
                            data: mockMaintenanceData.ticketTrend,
                            label: 'Monthly Tickets',
                            color: currentColors[1]
                          },
                          { 
                            data: mockMaintenanceData.costTrend.map(c => c/100),
                            label: 'Avg Cost ($100)',
                            color: currentColors[0],
                            yAxisKey: 'rightAxis'
                          }
                        ]}
                        xAxis={[{ 
                          data: mockFinancialData.months,
                          label: 'Month'
                        }]}
                        yAxis={[
                          { label: 'Ticket Count' },
                          { label: 'Avg Cost', position: 'right' }
                        ]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Maintenance Details</Typography>
                    <Box sx={{ height: 350 }}>
                      <DataGrid
                        rows={mockMaintenanceData.tickets}
                        columns={maintenanceColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Predictive Analytics Tab */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Occupancy Forecast</Typography>
                    <Box sx={{ height: 300 }}>
                      <LineChart
                        series={[
                          { 
                            data: mockPredictiveData.occupancyActual,
                            label: 'Actual',
                            color: currentColors[1]
                          },
                          { 
                            data: mockPredictiveData.occupancyForecast,
                            label: 'Forecast',
                            color: currentColors[2]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockPredictiveData.forecastMonths,
                          label: 'Month'
                        }]}
                        yAxis={[{
                          label: 'Occupancy (%)'
                        }]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Revenue Projections</Typography>
                    <Box sx={{ height: 300 }}>
                      <BarChart
                        series={[
                          { 
                            data: mockPredictiveData.revenueProjections,
                            label: 'Projected Revenue',
                            color: currentColors[0]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockPredictiveData.forecastQuarters,
                          scaleType: 'band',
                          label: 'Quarter'
                        }]}
                        yAxis={[{
                          label: 'Amount ($)'
                        }]}
                        slotProps={{
                          bar: {
                            rx: 4,
                            width: 25
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Expense Trend</Typography>
                    <Box sx={{ height: 300 }}>
                      <LineChart
                        series={[
                          { 
                            data: mockPredictiveData.expenseTrend,
                            label: 'Projected Expenses',
                            color: currentColors[3]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockPredictiveData.forecastMonths,
                          label: 'Month'
                        }]}
                        yAxis={[{
                          label: 'Amount ($)'
                        }]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Net Income Projection</Typography>
                    <Box sx={{ height: 300 }}>
                      <LineChart
                        series={[
                          { 
                            data: mockPredictiveData.netIncomeProjection,
                            label: 'Projected Net Income',
                            color: currentColors[0]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockPredictiveData.forecastMonths,
                          label: 'Month'
                        }]}
                        yAxis={[{
                          label: 'Amount ($)'
                        }]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Export Controls */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<Download />}
              sx={{
                backgroundColor: currentColors[0],
                '&:hover': { backgroundColor: currentColors[0], opacity: 0.9 }
              }}
            >
              Export PDF
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Print />}
              sx={{
                borderColor: currentColors[0],
                color: currentColors[0],
                '&:hover': {
                  borderColor: currentColors[0],
                  backgroundColor: darkMode ? 'rgba(0, 230, 118, 0.08)' : 'rgba(76, 175, 80, 0.08)'
                }
              }}
            >
              Print Report
            </Button>
          </Box>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportsAnalytics;