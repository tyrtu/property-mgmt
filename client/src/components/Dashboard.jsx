import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, List, ListItem, 
  ListItemIcon, ListItemText, LinearProgress, SvgIcon, Chip
} from '@mui/material';
import { 
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  HomeWork as HomeWorkIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import Navigation from './Navigation';
import { mockProperties, mockPayments, mockNotifications } from '../mockData';
import useAutoLogout from '../hooks/useAutoLogout'; // ✅ Import the auto-logout hook

const TrendIndicator = ({ trend }) => (
  <Typography 
    variant="body2" 
    color={trend.startsWith('+') ? 'success.main' : 'error.main'}
    sx={{ 
      ml: 1,
      display: 'flex',
      alignItems: 'center',
      fontWeight: 500
    }}
  >
    {trend}
  </Typography>
);

const MetricCard = ({ title, value, color = 'primary', trend, icon: Icon }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ 
      p: 2,
      position: 'relative',
      overflow: 'visible',
      bgcolor: 'background.paper',
      boxShadow: 1,
      '&:hover': { boxShadow: 3 },
      transition: 'all 0.3s ease',
    }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
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
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    occupiedUnits: 0,
    vacancyRate: 0,
    pendingPayments: 0,
    monthlyIncome: 0
  });

  // ✅ Enable auto-logout after 15 minutes of inactivity
  useAutoLogout();

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
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Navigation />
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Property Dashboard
        </Typography>
        <Chip 
          label="Last updated: Today" 
          variant="outlined" 
          sx={{ borderColor: 'divider' }}
        />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item container spacing={3} xs={12}>
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
            color="success"
            icon={PeopleIcon}
          />
          <MetricCard 
            title="Vacancy Rate" 
            value={`${metrics.vacancyRate}%`} 
            color="warning"
            icon={HomeWorkIcon}
          />
          <MetricCard 
            title="Monthly Income" 
            value={`$${metrics.monthlyIncome.toLocaleString()}`}
            color="info"
            icon={MonetizationOnIcon}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ 
            p: 2, 
            height: 400,
            boxShadow: 2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Financial Performance
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LineChart
                xAxis={[{ 
                  data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                  scaleType: 'band',
                  label: 'Month'
                }]}
                yAxis={[{ label: 'Amount ($)' }]}
                series={[
                  { 
                    data: [4000, 3000, 6000, 4500, 7000], 
                    label: 'Income', 
                    color: '#4CAF50',
                    curve: 'natural'
                  },
                  { 
                    data: [2000, 1500, 3000, 2500, 4000], 
                    label: 'Expenses', 
                    color: '#F44336',
                    curve: 'natural'
                  }
                ]}
                margin={{ left: 70, right: 30 }}
                grid={{ vertical: true, horizontal: true }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 2
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              gap: 1
            }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Notifications
              </Typography>
            </Box>
            <List dense sx={{ overflow: 'auto', flexGrow: 1 }}>
              {mockNotifications.map((note, index) => (
                <ListItem 
                  key={index} 
                  sx={{ 
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: note.type === 'alert' ? 'error.light' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {note.type === 'alert' ? (
                      <WarningIcon fontSize="small" color="error" />
                    ) : (
                      <InfoIcon fontSize="small" color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {note.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(note.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.category}
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
    </Box>
  );
};

export default Dashboard;