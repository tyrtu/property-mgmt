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
  TextField,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  Menu,
  MenuItem as MuiMenuItem,
  ListItemIcon,
  Fab,
  Zoom
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
  Add,
  DarkMode,
  LightMode,
  Menu as MenuIcon,
  Dashboard,
  Person,
  Settings,
  Logout,
  TrendingUp,
  CalendarToday,
  Description,
  Help,
  Star,
  Speed,
  Security,
  WaterDrop,
  Groups,
  SportsTennis
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { format } from 'date-fns';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
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

  // Add new state for performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    paymentHistory: 95,
    maintenanceResponse: 88,
    communicationScore: 92,
    overallRating: 4.5
  });

  // Add new state for upcoming events
  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: 'Property Inspection',
      date: new Date(2024, 3, 15),
      type: 'inspection'
    },
    {
      id: 2,
      title: 'Lease Renewal',
      date: new Date(2024, 11, 31),
      type: 'lease'
    }
  ]);

  // Add new state for property insights
  const [propertyInsights] = useState({
    energyUsage: 75,
    waterUsage: 60,
    communityScore: 85,
    amenities: ['Pool', 'Gym', 'Parking', 'Security']
  });

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
        <IconButton 
          edge="end" 
          onClick={action}
          sx={{ color: darkMode ? '#fff' : 'inherit' }}
        >
          <ArrowForward />
        </IconButton>
      }
      sx={{
        '&:hover': {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'action.hover',
          cursor: 'pointer'
        }
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ 
          bgcolor: darkMode ? 'primary.dark' : 'background.default',
          color: darkMode ? '#fff' : 'primary.main'
        }}>
          {icon}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
            {title}
          </Typography>
        }
        secondary={
          <>
            <Typography 
              component="span" 
              variant="body2" 
              sx={{ color: darkMode ? '#aaa' : 'text.primary' }}
            >
              {description}
            </Typography>
            {time && (
              <Typography 
                component="span" 
                variant="body2" 
                sx={{ color: darkMode ? '#888' : 'text.secondary' }}
              >
                {` — ${format(time, 'MMM dd, h:mm a')}`}
              </Typography>
            )}
          </>
        }
      />
    </ListItem>
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Add new component for performance metrics
  const PerformanceMetricCard = ({ title, value, icon, color }) => (
    <Card sx={{ 
      height: '100%',
      bgcolor: darkMode ? '#252525' : '#ffffff',
      color: darkMode ? '#fff' : 'text.primary',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: darkMode ? `${color}.dark` : `${color}.lighter`, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>{title}</Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1, color: darkMode ? '#fff' : 'text.primary' }}>
          {value}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={value} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            bgcolor: darkMode ? '#333' : `${color}.lighter`,
            '& .MuiLinearProgress-bar': {
              bgcolor: darkMode ? `${color}.light` : `${color}.main`
            }
          }}
        />
      </CardContent>
    </Card>
  );

  // Add new component for event card
  const EventCard = ({ event }) => (
    <Card 
      sx={{ 
        mb: 2,
        bgcolor: darkMode ? '#252525' : '#ffffff',
        color: darkMode ? '#fff' : 'text.primary',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ 
            bgcolor: darkMode ? 'primary.dark' : 'primary.lighter',
            color: darkMode ? '#fff' : 'primary.main',
            mr: 2 
          }}>
            <CalendarToday />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
              {event.title}
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? '#aaa' : 'text.secondary' }}>
              {format(event.date, 'MMM dd, yyyy')}
            </Typography>
          </Box>
          <Chip 
            label={event.type} 
            size="small" 
            color="primary"
            variant="outlined"
            sx={{
              borderColor: darkMode ? '#555' : undefined,
              color: darkMode ? '#fff' : undefined,
              '& .MuiChip-label': {
                color: darkMode ? '#fff' : undefined
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: darkMode ? '#121212' : '#f5f5f5',
      color: darkMode ? '#fff' : 'text.primary',
      transition: 'all 0.3s ease',
      pb: { xs: 8, sm: 4 }
    }}>
      {/* Enhanced Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        mt: { xs: 10, sm: 0 },
        bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
        borderBottom: 1,
        borderColor: darkMode ? '#333' : '#e0e0e0',
        color: darkMode ? '#fff' : 'text.primary',
        px: 2,
        py: 2,
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
      }}>
        <Avatar 
          src={tenantData.avatar} 
          sx={{ 
            width: { xs: 36, sm: 42 }, 
            height: { xs: 36, sm: 42 },
            border: 2,
            borderColor: darkMode ? 'primary.dark' : 'primary.main'
          }} 
        />
          <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight="medium"
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: darkMode ? '#fff' : 'text.primary',
              lineHeight: 1.2
            }}
          >
            Welcome back,
            </Typography>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              color: darkMode ? '#fff' : 'text.primary',
              lineHeight: 1.2
            }}
          >
            {tenantData.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: darkMode ? '#aaa' : 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Home sx={{ fontSize: 14 }} />
              {tenantData.property} • {tenantData.unit}
            </Typography>
          </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <IconButton 
            sx={{ 
              color: darkMode ? '#fff' : 'inherit',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          onClick={() => navigate("/tenant/notifications")}
        >
            <Badge badgeContent={notifications.length} color="primary">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton 
            sx={{ 
              color: darkMode ? '#fff' : 'inherit',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
            onClick={handleMenuClick}
          >
            <MoreVert />
          </IconButton>
        </Stack>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#1e1e1e' : '#fff',
            color: darkMode ? '#fff' : 'text.primary',
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              fontSize: '0.875rem'
            }
          }
        }}
      >
        <MuiMenuItem onClick={() => navigate("/tenant/profile")}>
          <ListItemIcon>
            <Person fontSize="small" sx={{ color: darkMode ? '#fff' : 'inherit' }} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => navigate("/tenant/settings")}>
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: darkMode ? '#fff' : 'inherit' }} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MuiMenuItem>
        <Divider />
        <MuiMenuItem onClick={() => { handleMenuClose(); logout(); }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: darkMode ? '#fff' : 'inherit' }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MuiMenuItem>
      </Menu>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Rent Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }} gutterBottom>
                  Monthly Rent
                </Typography>
                <AccountBalanceWallet sx={{ color: darkMode ? '#fff' : 'primary.main' }} />
              </Box>
              <Typography variant="h4" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                ${tenantData.rentAmount}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={tenantData.totalOutstanding > 0 ? 50 : 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  mt: 2,
                  bgcolor: darkMode ? '#333' : 'primary.lighter',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: darkMode ? 'primary.light' : 'primary.main'
                  }
                }}
              />
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ 
                  mt: 2,
                  borderColor: darkMode ? '#555' : 'primary.main',
                  color: darkMode ? '#fff' : 'primary.main',
                  '&:hover': {
                    borderColor: darkMode ? '#666' : 'primary.dark',
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                }}
                onClick={() => navigate("/tenant/payments")}
              >
                Payment History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Payment Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }} gutterBottom>
                  Next Payment Due
                </Typography>
                <Payment sx={{ color: darkMode ? '#fff' : 'secondary.main' }} />
              </Box>
              <Typography variant="h4" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                {format(new Date(tenantData.nextPaymentDue), 'MMM dd')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  label="Pending" 
                  size="small" 
                  color="warning" 
                  icon={<Warning fontSize="small" />}
                  sx={{
                    bgcolor: darkMode ? 'rgba(255, 152, 0, 0.1)' : undefined,
                    '& .MuiChip-label': {
                      color: darkMode ? '#ffa726' : undefined
                    }
                  }}
                />
              </Box>
              <Button 
                fullWidth 
                variant="contained" 
                sx={{ 
                  mt: 2,
                  bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                  '&:hover': {
                    bgcolor: darkMode ? 'primary.main' : 'primary.dark'
                  }
                }}
                onClick={() => navigate("/tenant/payments/make-payment")}
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Lease Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }} gutterBottom>
                  Lease Period
                </Typography>
                <Receipt sx={{ color: darkMode ? '#fff' : 'success.main' }} />
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
                sx={{ 
                  mt: 2,
                  borderColor: darkMode ? '#555' : 'success.main',
                  color: darkMode ? '#fff' : 'success.main',
                  '&:hover': {
                    borderColor: darkMode ? '#666' : 'success.dark',
                    bgcolor: darkMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                }}
                onClick={() => navigate("/tenant/lease")}
              >
                View Lease
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }} gutterBottom>
                  Maintenance
                </Typography>
                <Build sx={{ color: darkMode ? '#fff' : 'action.main' }} />
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
                sx={{ 
                  mt: 2,
                  bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                  '&:hover': {
                    bgcolor: darkMode ? 'primary.main' : 'primary.dark'
                  }
                }}
                onClick={() => navigate("/tenant/maintenance/new")}
              >
                New Request
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Add new Performance Metrics */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: darkMode ? '#fff' : 'text.primary' }}>
            Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                height: '100%',
                bgcolor: darkMode ? '#252525' : '#ffffff',
                color: darkMode ? '#fff' : 'text.primary',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <PerformanceMetricCard
                        title="Payment History"
                        value={performanceMetrics.paymentHistory}
                        icon={<TrendingUp />}
                        color="success"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <PerformanceMetricCard
                        title="Maintenance Response"
                        value={performanceMetrics.maintenanceResponse}
                        icon={<Speed />}
                        color="info"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <PerformanceMetricCard
                        title="Communication Score"
                        value={performanceMetrics.communicationScore}
                        icon={<Security />}
                        color="warning"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <PerformanceMetricCard
                        title="Overall Rating"
                        value={performanceMetrics.overallRating * 20}
                        icon={<Star />}
                        color="primary"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Property Insights Section */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                height: '100%',
                bgcolor: darkMode ? '#252525' : '#ffffff',
                color: darkMode ? '#fff' : 'text.primary',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2,
                      color: darkMode ? '#fff' : 'text.primary'
                    }}
                  >
                    Property Insights
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'success.lighter', mr: 1, width: 32, height: 32 }}>
                            <TrendingUp sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                            Energy Usage
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ mb: 1, color: darkMode ? '#fff' : 'text.primary' }}>
                          {propertyInsights.energyUsage}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={propertyInsights.energyUsage} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: darkMode ? '#333' : 'success.lighter',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'success.main'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'info.lighter', mr: 1, width: 32, height: 32 }}>
                            <WaterDrop sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                            Water Usage
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ mb: 1, color: darkMode ? '#fff' : 'text.primary' }}>
                          {propertyInsights.waterUsage}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={propertyInsights.waterUsage} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: darkMode ? '#333' : 'info.lighter',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'info.main'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'warning.lighter', mr: 1, width: 32, height: 32 }}>
                            <Groups sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                            Community Score
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ mb: 1, color: darkMode ? '#fff' : 'text.primary' }}>
                          {propertyInsights.communityScore}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={propertyInsights.communityScore} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: darkMode ? '#333' : 'warning.lighter',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'warning.main'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.lighter', mr: 1, width: 32, height: 32 }}>
                            <SportsTennis sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                            Available Amenities
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {propertyInsights.amenities.map((amenity, index) => (
                            <Chip
                              key={index}
                              label={amenity}
                              size="small"
                              sx={{
                                bgcolor: darkMode ? '#333' : 'primary.lighter',
                                color: darkMode ? '#fff' : 'primary.main',
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Main Content with Enhanced Layout */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Maintenance Requests Section */}
          <Card sx={{ 
            mb: 3,
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                  Maintenance Requests
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Search requests..."
                    InputProps={{
                      startAdornment: <Search fontSize="small" sx={{ color: darkMode ? '#aaa' : 'inherit' }} />,
                      sx: {
                        color: darkMode ? '#fff' : 'inherit',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? '#666' : 'rgba(0, 0, 0, 0.87)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'primary.main' : 'primary.main'
                        }
                      }
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: darkMode ? '#fff' : 'inherit'
                      }
                    }}
                  />
                  <FormControl 
                    size="small" 
                    sx={{ 
                      minWidth: 120,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? '#555' : 'rgba(0, 0, 0, 0.23)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? '#666' : 'rgba(0, 0, 0, 0.87)'
                      }
                    }}
                  >
                    <InputLabel sx={{ color: darkMode ? '#aaa' : 'inherit' }}>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      label="Status"
                      sx={{
                        color: darkMode ? '#fff' : 'inherit',
                        '& .MuiSvgIcon-root': {
                          color: darkMode ? '#fff' : 'inherit'
                        }
                      }}
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

          {/* Add Upcoming Events Section */}
          <Card sx={{ 
            mb: 3,
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }} gutterBottom>
                Upcoming Events
              </Typography>
              {upcomingEvents.map(event => (
                <Card 
                  key={event.id} 
                  sx={{ 
                    mb: 2,
                    bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
                    color: darkMode ? '#fff' : 'text.primary',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        bgcolor: darkMode ? 'primary.dark' : 'primary.lighter',
                        color: darkMode ? '#fff' : 'primary.main',
                        mr: 2 
                      }}>
                        <CalendarToday />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? '#aaa' : 'text.secondary' }}>
                          {format(event.date, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Chip 
                        label={event.type} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                        sx={{
                          borderColor: darkMode ? '#555' : undefined,
                          color: darkMode ? '#fff' : undefined,
                          '& .MuiChip-label': {
                            color: darkMode ? '#fff' : undefined
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Recent Payments Section */}
          <Card sx={{ 
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }} gutterBottom>
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
                sx={{ 
                  mt: 1,
                  borderColor: darkMode ? '#555' : 'primary.main',
                  color: darkMode ? '#fff' : 'primary.main',
                  '&:hover': {
                    borderColor: darkMode ? '#666' : 'primary.dark',
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                }}
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
          <Card sx={{ 
            mb: 3,
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
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
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
                  color: darkMode ? '#fff' : 'text.primary'
                }}>
                  <Notifications sx={{ 
                    fontSize: 60, 
                    color: darkMode ? '#555' : 'text.disabled', 
                    mb: 2 
                  }} />
                  <Typography variant="h6" sx={{ color: darkMode ? '#fff' : 'text.primary' }} gutterBottom>
                    No Recent Notifications
                  </Typography>
                  <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }}>
                    You're all caught up with notifications.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card sx={{ 
            bgcolor: darkMode ? '#252525' : '#ffffff',
            color: darkMode ? '#fff' : 'text.primary',
            mb: { xs: 8, sm: 4 }
          }}>
            <CardContent sx={{ pb: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }} gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<Payment />}
                  onClick={() => navigate("/tenant/payments/make-payment")}
                  sx={{
                    bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                    color: '#fff',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      bgcolor: darkMode ? 'primary.main' : 'primary.dark'
                    }
                  }}
                >
                  Make Payment
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Build />}
                  onClick={() => navigate("/tenant/maintenance/new")}
                  sx={{
                    borderColor: darkMode ? '#555' : 'primary.main',
                    color: darkMode ? '#fff' : 'primary.main',
                    '&:hover': {
                      borderColor: darkMode ? '#666' : 'primary.dark',
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  Request Maintenance
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Event />}
                  onClick={() => navigate("/tenant/events")}
                  sx={{
                    borderColor: darkMode ? '#555' : 'primary.main',
                    color: darkMode ? '#fff' : 'primary.main',
                    '&:hover': {
                      borderColor: darkMode ? '#666' : 'primary.dark',
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  View Events
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Receipt />}
                  onClick={() => navigate("/tenant/documents")}
                  sx={{
                    borderColor: darkMode ? '#555' : 'primary.main',
                    color: darkMode ? '#fff' : 'primary.main',
                    '&:hover': {
                      borderColor: darkMode ? '#666' : 'primary.dark',
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
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