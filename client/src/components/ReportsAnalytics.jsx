import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Tabs, Tab, 
  Select, MenuItem, FormControl, InputLabel, Button, IconButton,
  LinearProgress, Chip, useTheme, Stack, Tooltip, Container
} from '@mui/material';
import { 
  LineChart, BarChart, PieChart
} from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download, Print, ShowChart, Money, Home, People, Build, 
  Timeline, Analytics, DarkMode, LightMode, Assessment,
  ArrowUpward, ArrowDownward, Star, Warning
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
  properties: [
    { id: 1, name: 'Downtown Apartments', occupancy: 95, value: 4200000 },
    { id: 2, name: 'Riverside Office', occupancy: 88, value: 3800000 },
    { id: 3, name: 'Industrial Park', occupancy: 97, value: 5200000 },
    { id: 4, name: 'Shopping Plaza', occupancy: 90, value: 4800000 }
  ],
  valueMetrics: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    capRates: [6.2, 5.8, 7.1, 6.5],
    appreciation: [3.2, 2.8, 4.1, 3.5],
    rentalGrowth: [2.5, 2.8, 3.1, 2.9]
  }
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
  tenantGrowth: {
    labels: ['2020', '2021', '2022', '2023'],
    values: [120, 145, 165, 195]
  },
  satisfactionTrend: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [4.2, 4.5, 4.6, 4.7]
  }
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
  trends: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    ticketCounts: [45, 42, 40, 38, 36, 35],
    costs: [1200, 1150, 1100, 1050, 1000, 980]
  }
};

const mockPredictiveData = {
  occupancy: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    actual: [88, 89, 90, 91, 92, 93],
    forecast: [89, 90, 91, 92, 93, 94]
  },
  revenue: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    projections: [125, 130, 135, 140].map(v => v * 1000)
  },
  expenses: {
    labels: ['2023', '2024', '2025'],
    projections: [85, 90, 95].map(v => v * 1000)
  },
  netIncome: {
    labels: ['2023', '2024', '2025'],
    projections: [40, 45, 50].map(v => v * 1000)
  }
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

  // Compute averages for predictive occupancy
  const occupancyAvgActual = useMemo(() => {
    const sum = mockPredictiveData.occupancy.actual.reduce((a, b) => a + b, 0);
    return (sum / mockPredictiveData.occupancy.actual.length).toFixed(1);
  }, []);
  const occupancyAvgForecast = useMemo(() => {
    const sum = mockPredictiveData.occupancy.forecast.reduce((a, b) => a + b, 0);
    return (sum / mockPredictiveData.occupancy.forecast.length).toFixed(1);
  }, []);

  // Compute averages for value metrics
  const avgCapRate = useMemo(() => {
    const sum = mockPropertyMetrics.valueMetrics.capRates.reduce((a, b) => a + b, 0);
    return (sum / mockPropertyMetrics.valueMetrics.capRates.length).toFixed(1);
  }, []);
  const avgAppreciation = useMemo(() => {
    const sum = mockPropertyMetrics.valueMetrics.appreciation.reduce((a, b) => a + b, 0);
    return (sum / mockPropertyMetrics.valueMetrics.appreciation.length).toFixed(1);
  }, []);

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
                  height: 120,
                  borderRadius: 2,
                  boxShadow: 'none'
                }}>
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {card.icon}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 0.5, lineHeight: 1.2 }}>
                          {card.value}
                        </Typography>
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
                      </Box>
                    </Stack>
                  </CardContent>
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
                      <PieChart
                        series={[
                          {
                            // Using computed averages for a pie chart display
                            data: [
                              { label: 'Cap Rates', value: Number(avgCapRate) },
                              { label: 'Appreciation', value: Number(avgAppreciation) }
                            ],
                            outerRadius: 80,
                            innerRadius: 40,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            arcLabel: (item) => `${item.value}%`
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
                            data: mockTenantMetrics.tenantGrowth.values,
                            label: 'Tenant Count',
                            color: currentColors[1]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockTenantMetrics.tenantGrowth.labels,
                          scaleType: 'band',
                          label: 'Year'
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
                      <PieChart
                        series={[
                          { 
                            data: mockTenantMetrics.satisfactionTrend.labels.map((label, i) => ({
                              label,
                              value: mockTenantMetrics.satisfactionTrend.values[i]
                            })),
                            outerRadius: 80,
                            innerRadius: 40,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            arcLabel: (item) => `${item.value}`
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
                      <LineChart
                        series={[
                          { 
                            data: mockMaintenanceData.trends.ticketCounts,
                            label: 'Ticket Count',
                            color: currentColors[3]
                          },
                          { 
                            data: mockMaintenanceData.trends.costs,
                            label: 'Cost ($)',
                            color: currentColors[0],
                            yAxisKey: 'rightAxis'
                          }
                        ]}
                        xAxis={[{ 
                          data: mockMaintenanceData.trends.labels,
                          label: 'Month'
                        }]}
                        yAxis={[
                          { label: 'Ticket Count' },
                          { label: 'Cost ($)', position: 'right' }
                        ]}
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
                      <PieChart
                        series={[
                          {
                            data: [
                              { label: 'Actual Avg', value: Number(occupancyAvgActual) },
                              { label: 'Forecast Avg', value: Number(occupancyAvgForecast) }
                            ],
                            outerRadius: 80,
                            innerRadius: 40,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            arcLabel: (item) => `${item.value}%`
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
                            data: mockPredictiveData.revenue.projections,
                            label: 'Projected Revenue',
                            color: currentColors[0]
                          }
                        ]}
                        xAxis={[{ 
                          data: mockPredictiveData.revenue.labels,
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
            </Grid>
          )}

          {/* Export Controls */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
