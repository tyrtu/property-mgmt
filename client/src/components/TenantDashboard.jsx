import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
} from "@mui/material";
import { AccountBalanceWallet, Home, Build, Notifications } from "@mui/icons-material";
import TenantNavigation from "./TenantNavigation";
import { useNavigate } from "react-router-dom";

const TenantDashboard = () => {
  const navigate = useNavigate();

  // Dummy tenant data; replace with real data from backend.
  const tenant = {
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=3", // Random profile image
    leaseStart: "2024-01-01",
    leaseEnd: "2024-12-31",
    rentAmount: 1200,
    nextPaymentDue: "2024-04-01",
    maintenanceRequests: [
      { id: 1, issue: "Leaking sink", status: "In Progress" },
      { id: 2, issue: "Broken AC", status: "Resolved" },
    ],
    notifications: ["Your rent is due on April 1st.", "Scheduled maintenance on March 15th."],
    totalOutstanding: 1200, // Amount left to be paid
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", p: 3 }}>
      <TenantNavigation />

      {/* Welcome Header with Avatar */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar src={tenant.avatar} sx={{ width: 50, height: 50, mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Welcome, {tenant.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Lease Period */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Home color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Lease Period
              </Typography>
              <Typography variant="h6">
                {new Date(tenant.leaseStart).toLocaleDateString()} -{" "}
                {new Date(tenant.leaseEnd).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Rent Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <AccountBalanceWallet color="success" sx={{ fontSize: 40 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Rent Amount
              </Typography>
              <Typography variant="h6">${tenant.rentAmount}</Typography>
              <LinearProgress
                variant="determinate"
                value={tenant.totalOutstanding > 0 ? 50 : 100} // Simulating progress
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Next Payment Due */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <AccountBalanceWallet color="warning" sx={{ fontSize: 40 }} />
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
                sx={{ mt: 2, fontWeight: "bold" }}
                onClick={() => navigate("/tenant/payments")}
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Requests */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Build color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Maintenance Requests
              </Typography>
              <Typography variant="h6">{tenant.maintenanceRequests.length}</Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2, fontWeight: "bold" }}
                onClick={() => navigate("/tenant/maintenance")}
              >
                Request Maintenance
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Maintenance Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Recent Maintenance Requests
            </Typography>
            <List>
              {tenant.maintenanceRequests.map((req) => (
                <ListItem key={req.id} sx={{ borderBottom: "1px solid #ddd", py: 1 }}>
                  <ListItemText primary={req.issue} secondary={`Status: ${req.status}`} />
                  <Chip
                    label={req.status}
                    color={req.status === "Resolved" ? "success" : "warning"}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Notifications
            </Typography>
            <List>
              {tenant.notifications.map((note, index) => (
                <ListItem key={index} sx={{ borderBottom: "1px solid #ddd", py: 1 }}>
                  <Notifications color="info" sx={{ mr: 1 }} />
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
