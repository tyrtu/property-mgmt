import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { Link } from 'react-router-dom';
import { mockProperties, mockPayments } from '../mockData';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    occupiedUnits: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    // Simulate fetching data
    setMetrics({
      totalProperties: mockProperties.length,
      occupiedUnits: mockProperties.reduce((acc, prop) => acc + prop.occupiedUnits, 0),
      pendingPayments: mockPayments.filter(p => p.status === 'Pending').length
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Navigation Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" component={Link} to="/dashboard">Dashboard</Button>
        <Button variant="outlined" component={Link} to="/properties">Properties</Button>
        <Button variant="outlined" component={Link} to="/tenants">Tenants</Button>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        Property Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                Total Properties
              </Typography>
              <Typography variant="h4">
                {metrics.totalProperties}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={8}>
          <BarChart
            xAxis={[{ data: ['Jan', 'Feb', 'Mar'], scaleType: 'band' }]}
            series={[{ data: [4, 3, 5] }]}
            height={300}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
