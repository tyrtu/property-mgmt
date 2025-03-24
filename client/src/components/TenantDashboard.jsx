import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from "@mui/material";
import { 
  AccountBalanceWallet, 
  Home, 
  Build, 
  Notifications, 
  ArrowForward,
  Payment,
  Receipt,
  Event,
  Warning,
  CheckCircle,
  MoreVert,
  Search,
  FilterList,
  Add
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { format } from 'date-fns';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [tenantData, setTenantData] = useState({
    name: "Loading...",
    avatar: "https://i.pravatar.cc/150?img=3",
    leaseStart: "2024-01-01",
    leaseEnd: "2024-12-31",
    rentAmount: 1200,
    nextPaymentDue: "2024-04-01",
    totalOutstanding: 0,
    property: "Sunset Apartments",
    unit: "3B"
  });
  const [notifications, setNotifications] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tenant data
  useEffect(() => {
    const fetchTenantData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTenantData(prev => ({
              ...prev,
              name: data.name || "Tenant",
              property: data.property || "Unknown Property",
              unit: data.unit || "Unknown Unit"
            }));
          }
        } catch (error) {
          console.error("Error fetching tenant data:", error);
        }
      }
    };
    fetchTenantData();
  }, []);

  // Fetch notifications
  useEffect(() => {
    let unsubscribe = () => {};
    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            where("createdAt", ">", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          );
          unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate()
            }));
            setNotifications(notes);
          });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
    return () => unsubscribe();
  }, []);

  // Fetch maintenance requests
  useEffect(() => {
    let unsubscribe = () => {};
    const fetchMaintenanceRequests = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          let q = query(
            collection(db, "maintenanceRequests"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          
          if (filterStatus !== "all") {
            q = query(q, where("status", "==", filterStatus));
          }
          
          unsubscribe = onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate()
            }));
            
            // Apply search filter if needed
            const filtered = searchTerm 
              ? requests.filter(req => 
                  req.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  req.status.toLowerCase().includes(searchTerm.toLowerCase()))
              : requests;
            
            setMaintenanceRequests(filtered);
          });
        }
      } catch (error) {
        console.error("Error fetching maintenance requests:", error);
      }
    };
    fetchMaintenanceRequests();
    return () => unsubscribe();
  }, [filterStatus, searchTerm]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'in progress': return 'info';
      case 'resolved': return 'success';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Warning color="warning" />;
      case 'in progress': return <Build color="info" />;
      case 'resolved': return <CheckCircle color="success" />;
      case 'overdue': return <Warning color="error" />;
      default: return <CheckCircle color="disabled" />;
    }
  };

  const RecentActivityItem = ({ icon, title, description, time, action }) => (
    <ListItem
      secondaryAction={
        <IconButton edge="end" onClick={action}>
          <ArrowForward />
        </IconButton>
      }
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover',
          cursor: 'pointer'
        }
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.default' }}>
          {icon}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <>
            <Typography component="span" variant="body2" color="text.primary">
              {description}
            </Typography>
            {time && ` — ${format(time, 'MMM dd, h:mm a')}`}
          </>
        }
      />
    </ListItem>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={tenantData.avatar} sx={{ width: 56, height: 56, mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back, {tenantData.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {tenantData.property} • {tenantData.unit}
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Notifications />}
          onClick={() => navigate("/tenant/notifications")}
        >
          Notifications
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Rent Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Monthly Rent
                </Typography>
                <AccountBalanceWallet color="primary" />
              </Box>
              <Typography variant="h4" component="div">
                ${tenantData.rentAmount}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={tenantData.totalOutstanding > 0 ? 50 : 100} 
                sx={{ height: 8, borderRadius: 4, mt: 2 }}
              />
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate("/tenant/payments")}
              >
                Payment History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Payment Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Next Payment Due
                </Typography>
                <Payment color="secondary" />
              </Box>
              <Typography variant="h4" component="div">
                {format(new Date(tenantData.nextPaymentDue), 'MMM dd')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  label="Pending" 
                  size="small" 
                  color="warning" 
                  icon={<Warning fontSize="small" />}
                />
              </Box>
              <Button 
                fullWidth 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => navigate("/tenant/payments/make-payment")}
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Lease Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Lease Period
                </Typography>
                <Receipt color="success" />
              </Box>
              <Typography variant="h6" component="div">
                {format(new Date(tenantData.leaseStart), 'MMM yyyy')} -{' '}
                {format(new Date(tenantData.leaseEnd), 'MMM yyyy')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {Math.ceil((new Date(tenantData.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
              </Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate("/tenant/lease")}
              >
                View Lease
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Maintenance
                </Typography>
                <Build color="action" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                  {maintenanceRequests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  active requests
                </Typography>
              </Box>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<Add />}
                sx={{ mt: 2 }}
                onClick={() => navigate("/tenant/maintenance/new")}
              >
                New Request
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Maintenance Requests Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Maintenance Requests
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Search requests..."
                    InputProps={{
                      startAdornment: <Search fontSize="small" />
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {maintenanceRequests.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {maintenanceRequests.slice(0, 5).map((request) => (
                    <ListItem
                      key={request.id}
                      secondaryAction={
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                          icon={getStatusIcon(request.status)}
                        />
                      }
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => navigate(`/tenant/maintenance/${request.id}`)}
                    >
                      <ListItemText
                        primary={request.issue}
                        secondary={
                          request.createdAt && format(request.createdAt, 'MMM dd, yyyy')
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Build sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Maintenance Requests
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {filterStatus === 'all' 
                      ? "You haven't submitted any maintenance requests yet."
                      : `You have no ${filterStatus.toLowerCase()} maintenance requests.`}
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => navigate("/tenant/maintenance/new")}
                  >
                    Create Request
                  </Button>
                </Paper>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Payments
              </Typography>
              <List>
                {[
                  {
                    id: 1,
                    amount: 1200,
                    date: new Date(2024, 2, 1),
                    status: 'Paid',
                    method: 'MPESA'
                  },
                  {
                    id: 2,
                    amount: 1200,
                    date: new Date(2024, 1, 1),
                    status: 'Paid',
                    method: 'Bank Transfer'
                  },
                  {
                    id: 3,
                    amount: 1200,
                    date: new Date(2024, 0, 1),
                    status: 'Paid',
                    method: 'MPESA'
                  }
                ].map((payment) => (
                  <RecentActivityItem
                    key={payment.id}
                    icon={<AccountBalanceWallet />}
                    title={`Payment of $${payment.amount}`}
                    description={`${payment.method} • ${payment.status}`}
                    time={payment.date}
                    action={() => navigate(`/tenant/payments/${payment.id}`)}
                  />
                ))}
              </List>
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 1 }}
                onClick={() => navigate("/tenant/payments")}
              >
                View All Payments
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Recent Notifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Notifications
                </Typography>
                <Badge 
                  badgeContent={notifications.length} 
                  color="primary"
                  sx={{ mr: 1 }}
                />
              </Box>

              {notifications.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {notifications.slice(0, 4).map((note) => (
                    <RecentActivityItem
                      key={note.id}
                      icon={<Notifications />}
                      title={note.title || 'Notification'}
                      description={note.message.length > 40 
                        ? `${note.message.substring(0, 40)}...` 
                        : note.message}
                      time={note.createdAt}
                      action={() => navigate(`/tenant/notifications/${note.id}`)}
                    />
                  ))}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Notifications sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Recent Notifications
                  </Typography>
                  <Typography color="text.secondary">
                    You're all caught up with notifications.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<Payment />}
                  onClick={() => navigate("/tenant/payments/make-payment")}
                >
                  Make Payment
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Build />}
                  onClick={() => navigate("/tenant/maintenance/new")}
                >
                  Request Maintenance
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Event />}
                  onClick={() => navigate("/tenant/events")}
                >
                  View Events
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Receipt />}
                  onClick={() => navigate("/tenant/documents")}
                >
                  View Documents
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantDashboard;