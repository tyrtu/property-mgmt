import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';
import Navigation from './Navigation';
import { mockProperties, mockPayments, mockNotifications } from '../mockData';

const TrendIndicator = ({ trend }) => (
  <Typography 
    variant="body2" 
    color={trend.startsWith('+') ? 'success.main' : 'error.main'}
    sx={{ ml: 1 }}
  >
    {trend}
  </Typography>
);

const MetricCard = ({ title, value, color = 'primary', trend }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ 
      bgcolor: `${color}.light`, 
      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
      p: 2 
    }}>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" color={`${color}.dark`}>{value}</Typography>
        {trend && <TrendIndicator trend={trend} />}
      </Box>
    </Card>
  </Grid>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    occupiedUnits: 0,
    vacancyRate: 0,
    pendingPayments: 0,
    monthlyIncome: 0
  });

  useEffect(() => {
    const occupied = mockProperties.reduce((acc, prop) => acc + prop.occupiedUnits, 0);
    const totalUnits = mockProperties.reduce((acc, prop) => acc + prop.totalUnits, 0);
    
    setMetrics({
      totalProperties: mockProperties.length,
      occupiedUnits: occupied,
      vacancyRate: ((totalUnits - occupied) / totalUnits * 100).toFixed(1),
      pendingPayments: mockPayments.filter(p => p.status === 'Pending').length,
      monthlyIncome: mockPayments.filter(p => p.status === 'Paid')
                        .reduce((acc, p) => acc + p.amount, 0)
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Navigation />
      
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Property Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item container spacing={3} xs={12}>
          <MetricCard title="Total Properties" value={metrics.totalProperties} trend="+2.1%"/>
          <MetricCard title="Occupied Units" value={metrics.occupiedUnits} color="success"/>
          <MetricCard title="Vacancy Rate" value={`${metrics.vacancyRate}%`} color="warning"/>
          <MetricCard title="Monthly Income" value={`$${metrics.monthlyIncome.toLocaleString()}`}/>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Income Trends
            </Typography>
            <LineChart
              xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] }]}
              series={[
                { data: [4000, 3000, 6000, 4500, 7000], label: 'Income' },
                { data: [2000, 1500, 3000, 2500, 4000], label: 'Expenses' }
              ]}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <List dense>
              {mockNotifications.map((note, index) => (
                <ListItem key={index} sx={{ borderBottom: '1px solid #eee' }}>
                  <ListItemText 
                    primary={note.title}
                    secondary={note.date}
                    sx={{ color: note.type === 'alert' ? 'error.main' : 'text.primary' }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;