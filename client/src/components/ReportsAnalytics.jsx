import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  LineChart, 
  BarChart, 
  PieChart 
} from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Navigation from './Navigation';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { mockFinancialData, mockPropertyMetrics } from '../mockData';

const ReportsAnalytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('last_month');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
        <Navigation />
        <Typography variant="h4" gutterBottom sx={{ 
          mb: 4, 
          fontWeight: 700,
          color: 'primary.main',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Financial Reports & Analytics
        </Typography>

        {/* Filters Section */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }}>
          <Tab label="Financial Performance" />
          <Tab label="Property Metrics" />
          <Tab label="Tenant Analytics" />
        </Tabs>

        {tabValue === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%', boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Income vs Expenses Trend
                  </Typography>
                  <LineChart
                    series={[
                      { 
                        data: mockFinancialData.income,
                        label: 'Income',
                        color: '#4CAF50',
                        area: true,
                        showMark: false
                      },
                      { 
                        data: mockFinancialData.expenses,
                        label: 'Expenses',
                        color: '#F44336',
                        area: true,
                        showMark: false
                      }
                    ]}
                    xAxis={[{ 
                      data: mockFinancialData.months,
                      scaleType: 'band',
                      label: 'Months'
                    }]}
                    height={400}
                    margin={{ left: 70 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%', boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Expense Breakdown
                  </Typography>
                  <PieChart
                    series={[
                      {
                        data: mockFinancialData.expenseCategories,
                        innerRadius: 40,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 5,
                      }
                    ]}
                    height={300}
                    slotProps={{
                      legend: { hidden: true }
                    }}
                  />
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {mockFinancialData.expenseCategories.map((category) => (
                      <Box key={category.id} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 1,
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}>
                        <Typography>{category.label}</Typography>
                        <Typography>${category.value.toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detailed Financial Records
                  </Typography>
                  <DataGrid
                    rows={mockFinancialData.transactions}
                    columns={[
                      { field: 'date', headerName: 'Date', width: 120 },
                      { field: 'description', headerName: 'Description', width: 250 },
                      { field: 'category', headerName: 'Category', width: 150 },
                      { field: 'amount', headerName: 'Amount', width: 120 },
                      { field: 'property', headerName: 'Property', width: 180 },
                      { field: 'status', headerName: 'Status', width: 120 },
                    ]}
                    autoHeight
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Occupancy Rates
                  </Typography>
                  <BarChart
                    series={[
                      { 
                        data: mockPropertyMetrics.occupancyRates,
                        label: 'Occupancy Rate',
                        color: '#2196F3'
                      }
                    ]}
                    xAxis={[{ 
                      data: mockPropertyMetrics.properties,
                      scaleType: 'band',
                      label: 'Properties'
                    }]}
                    height={400}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Maintenance Costs
                  </Typography>
                  <LineChart
                    series={[
                      { 
                        data: mockPropertyMetrics.maintenanceCosts,
                        label: 'Maintenance Costs',
                        color: '#FF9800',
                        area: true
                      }
                    ]}
                    xAxis={[{ 
                      data: mockPropertyMetrics.months,
                      scaleType: 'band',
                      label: 'Months'
                    }]}
                    height={400}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ReportsAnalytics;