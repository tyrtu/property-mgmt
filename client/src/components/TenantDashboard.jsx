import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import TenantNavigation from './TenantNavigation';
import { useNavigate } from 'react-router-dom';

const TenantDashboard = () => {
  const navigate = useNavigate();

  // Dummy tenant data; replace with real data from your backend.
  const tenant = {
    name: 'John Doe',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentAmount: 1200,
    nextPaymentDue: '2024-04-01',
    maintenanceRequests: [
      { id: 1, issue: 'Leaking sink', status: 'In Progress' },
      { id: 2, issue: 'Broken AC', status: 'Resolved' },
    ],
    notifications: [
      "Your rent is due on April 1st.",
      "Scheduled maintenance on March 15th.",
    ],
    totalOutstanding: 1200, // Amount left to be paid
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <TenantNavigation />

      <Typography variant="h4" sx={{ mb: 3 }}>
        Welcome, {tenant.name}
      </Typography>

      <Grid container spacing={3}>
        {/* Lease Period */}
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

        {/* Rent Amount */}
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

        {/* Next Payment Due */}
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
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/tenant/payments')}
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Requests */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Maintenance Requests
              </Typography>
              <Typography variant="h6">{tenant.maintenanceRequests.length}</Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/tenant/maintenance')}
              >
                Request Maintenance
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Maintenance Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Recent Maintenance Requests</Typography>
            <List>
              {tenant.maintenanceRequests.map((req) => (
                <ListItem key={req.id}>
                  <ListItemText primary={req.issue} secondary={`Status: ${req.status}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Notifications</Typography>
            <List>
              {tenant.notifications.map((note, index) => (
                <ListItem key={index}>
                  <ListItemText primary={note} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantDashboard;
