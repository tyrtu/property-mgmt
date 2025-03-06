// src/components/TenantDashboard.jsx
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import TenantNavigation from './TenantNavigation';

const TenantDashboard = () => {
  // Dummy tenant data; replace with real data from your backend.
  const tenant = {
    name: 'John Doe',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentAmount: 1200,
    nextPaymentDue: '2024-04-01',
    maintenanceRequests: 1
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <TenantNavigation />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Welcome, {tenant.name}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Lease Period
                </Typography>
                <Typography variant="h6">
                  {new Date(tenant.leaseStart).toLocaleDateString()} -{' '}
                  {new Date(tenant.leaseEnd).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Rent Amount
                </Typography>
                <Typography variant="h6">${tenant.rentAmount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Next Payment Due
                </Typography>
                <Typography variant="h6">
                  {new Date(tenant.nextPaymentDue).toLocaleDateString()}
                </Typography>
                <Chip label="Pending" color="warning" size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Maintenance Requests
                </Typography>
                <Typography variant="h6">{tenant.maintenanceRequests}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TenantDashboard;
