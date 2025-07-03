import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Pagination,
  Badge,
  Chip,
  useTheme,
  Card,
  CardContent,
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  BottomNavigation,
  BottomNavigationAction,
  Fab
} from "@mui/material";
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  NotificationsActive as BellIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode,
  LightMode,
  MarkEmailRead as MarkReadIcon,
  AccessTime as TimeIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Close,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Payment as PaymentsIcon,
  Build as MaintenanceIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  ChevronLeft,
  ChevronRight,
  Edit,
  Save,
  Cancel,
  Phone,
  Home,
  CalendarToday,
  Security,
  PhotoCamera,
  Verified,
  LocationOn
} from "@mui/icons-material";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  Timestamp,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { format } from 'date-fns';
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useDarkMode } from '../context/DarkModeContext';
import { signOut } from 'firebase/auth';

const MAX_MESSAGE_LENGTH = 100; // Maximum characters to show before "Read More"

const TenantNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [notificationsPerPage] = useState(5);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailAlerts: true,
    pushNotifications: true,
  });
  const { darkMode, toggleDarkMode: toggleTheme } = useDarkMode();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notificationTypes = {
    payment: {
      icon: <InfoIcon />,
      color: '#2196F3',
      label: 'Payment'
    },
    maintenance: {
      icon: <WarningIcon />,
      color: '#FFA726',
      label: 'Maintenance'
    },
    alert: {
      icon: <ErrorIcon />,
      color: '#F44336',
      label: 'Alert'
    },
    info: {
      icon: <InfoIcon />,
      color: '#4CAF50',
      label: 'Info'
    }
  };

  // Fetch notifications from Firestore
  useEffect(() => {
    let isMounted = true;
    let unsubscribeNotifications = () => {};

    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Authentication required");

        const userId = user.uid;
        const notificationsRef = collection(db, "notifications");
        const q = query(
          notificationsRef,
          where("userId", "==", userId),
          orderBy("createdAt", sortOrder)
        );

        const querySnapshot = await getDocs(q);
        const notificationsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));

            if (isMounted) {
          setNotifications(notificationsData);
              setLoading(false);
            }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, [sortOrder]);

  // Mark a notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        isRead: true,
        updatedAt: Timestamp.now()
      });
      setNotifications((prev) =>
        prev.map((note) => (note.id === notificationId ? { ...note, isRead: true } : note))
      );
    } catch (error) {
      console.error("Error marking notification read:", error);
      setError("Failed to mark notification as read");
    }
  };

  // Delete a notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      setNotifications((prev) => prev.filter((note) => note.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError("Failed to delete notification");
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      const batch = notifications.map((note) =>
        updateDoc(doc(db, "notifications", note.id), { isRead: true })
      );
      await Promise.all(batch);
      setNotifications((prev) => prev.map((note) => ({ ...note, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      setError("Failed to mark all notifications as read");
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    try {
      const batch = notifications.map((note) =>
        deleteDoc(doc(db, "notifications", note.id))
      );
      await Promise.all(batch);
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      setError("Failed to delete all notifications");
    }
  };

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter((note) => {
      if (filter === "unread") return !note.isRead;
      if (filter === "read") return note.isRead;
      if (filter === "alerts") return note.type === "alert";
      if (filter === "info") return note.type === "info";
      return true;
    })
    .filter((note) =>
      note.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination
  const indexOfLastNotification = page * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  // Handle opening the modal with full notification details
  const handleReadMore = (notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('tenantToken');
      navigate('/tenant/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/tenant/dashboard" },
    { text: "Payments", icon: <PaymentsIcon />, path: "/tenant/payments" },
    { text: "Maintenance", icon: <MaintenanceIcon />, path: "/tenant/maintenance" },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/tenant/notifications" },
    { text: "Profile", icon: <ProfileIcon />, path: "/tenant/profile" }
  ];

  const drawer = (
    <Box sx={{ 
      width: 250,
      bgcolor: darkMode ? '#252525' : '#fff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
          Tenant Portal
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              color: darkMode ? '#fff' : 'text.primary',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={toggleTheme}
          sx={{
            color: darkMode ? '#fff' : 'text.primary',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            {darkMode ? <LightMode /> : <DarkMode />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
        </ListItem>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            color: darkMode ? '#fff' : 'text.primary',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: darkMode ? '#121212' : '#f5f5f5'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      color: darkMode ? '#fff' : 'text.primary'
    }}>
      {/* Mobile App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { xs: 'block', md: 'none' },
          bgcolor: darkMode ? '#252525' : '#fff',
          color: darkMode ? '#fff' : 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Notifications
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            bgcolor: darkMode ? '#252525' : '#fff'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        p: 3,
        pt: { xs: '80px', md: 3 }
      }}>
      {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          backgroundColor: darkMode ? '#252525' : '#fff',
          p: 3,
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon sx={{ 
              fontSize: 40,
              color: darkMode ? '#fff' : 'primary.main'
            }} />
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: darkMode ? '#fff' : 'text.primary'
                }}
              >
                Notifications
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  mt: 0.5
                }}
              >
                Manage and track your notifications
        </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
          }}>
          <TextField
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
              sx={{ 
                backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
                borderRadius: 1,
                minWidth: { xs: '100%', sm: '200px' }
              }}
            />
            <Select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              size="small"
              sx={{ 
                backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
                borderRadius: 1,
                minWidth: { xs: '100%', sm: '120px' }
              }}
            >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="alerts">Alerts</MenuItem>
            <MenuItem value="info">Info</MenuItem>
          </Select>
            <Select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)} 
              size="small"
              sx={{ 
                backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
                borderRadius: 1,
                minWidth: { xs: '100%', sm: '120px' }
              }}
            >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </Box>
      </Box>

        {/* Analytics Cards */}
        <Grid container spacing={1} sx={{ mb: 4, px: 2 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              p: 1.5,
              backgroundColor: darkMode ? '#252525' : '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minHeight: 120,
              width: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <NotificationsIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Total Notifications
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 600 }}>
                {notifications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                All notifications
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              p: 1.5,
              backgroundColor: darkMode ? '#252525' : '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minHeight: 120,
              width: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <WarningIcon sx={{ color: '#FFA726', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Unread
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 600 }}>
                {notifications.filter(n => !n.isRead).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                New notifications
              </Typography>
            </Card>
        </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              p: 1.5,
              backgroundColor: darkMode ? '#252525' : '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minHeight: 120,
              width: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <InfoIcon sx={{ color: '#29B6F6', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Read
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 600 }}>
                {notifications.filter(n => n.isRead).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                Viewed notifications
            </Typography>
            </Card>
        </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              p: 1.5,
              backgroundColor: darkMode ? '#252525' : '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minHeight: 120,
              width: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <ErrorIcon sx={{ color: '#F44336', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Alerts
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 600 }}>
                {notifications.filter(n => n.type === 'alert').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                Important alerts
            </Typography>
            </Card>
        </Grid>
      </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          gap: 2
        }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
              startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
              sx={{
                backgroundColor: darkMode ? '#1976d2' : '#1976d2',
                color: '#fff',
                '&:hover': {
                  backgroundColor: darkMode ? '#1565c0' : '#1565c0',
                },
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                transition: 'all 0.2s ease-in-out',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}
        >
          Mark All as Read
        </Button>
        <Button
              variant="outlined"
              startIcon={<DeleteSweepIcon />}
          onClick={handleDeleteAll}
              sx={{
                borderColor: darkMode ? '#f44336' : '#f44336',
                color: darkMode ? '#f44336' : '#f44336',
                '&:hover': {
                  borderColor: darkMode ? '#d32f2f' : '#d32f2f',
                  backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.08)' : 'rgba(244, 67, 54, 0.04)',
                },
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
        >
          Delete All
        </Button>
      </Box>
          <Typography variant="body2" sx={{ 
            color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            display: { xs: 'none', sm: 'block' }
          }}>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Notifications List */}
        <Grid container spacing={3}>
          {currentNotifications.map((notification) => (
            <Grid item xs={12} sm={6} md={4} key={notification.id}>
              <Card sx={{ 
                height: '280px', // Fixed height for all cards
                backgroundColor: darkMode ? '#252525' : '#fff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                },
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: darkMode ? '#fff' : 'text.primary'
                    }}>
                      {notificationTypes[notification.type]?.icon}
                      {notification.title}
                    </Typography>
                    <Chip
                      icon={notification.isRead ? <MarkReadIcon /> : <WarningIcon />}
                      label={notification.isRead ? 'Read' : 'Unread'}
                      size="small"
                      sx={{
                        backgroundColor: notification.isRead ? '#29B6F620' : '#FFA72620',
                        color: notification.isRead ? '#29B6F6' : '#FFA726',
                        '& .MuiChip-icon': {
                          color: notification.isRead ? '#29B6F6' : '#FFA726'
                        }
                      }}
                    />
                  </Box>

                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 2, 
                      color: darkMode ? '#fff' : 'text.primary',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      flex: 1
                    }}
                  >
                    {notification.message}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(notification.createdAt, 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mt: 'auto',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.isRead && (
                        <Button
                          size="small"
                          startIcon={<MarkReadIcon />}
                          onClick={() => handleMarkRead(notification.id)}
                          sx={{
                            color: '#29B6F6',
                            '&:hover': {
                              backgroundColor: '#29B6F620'
                            }
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(notification.id)}
                        sx={{
                          color: '#EF5350',
                          '&:hover': {
                            backgroundColor: '#EF535020'
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                    {notification.message.length > MAX_MESSAGE_LENGTH && (
                      <Button
                        size="small"
                        onClick={() => handleReadMore(notification)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.main20'
                          }
                        }}
                      >
                        Read More
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {notifications.length === 0 && !loading && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: darkMode ? '#252525' : '#fff',
            borderRadius: 2,
            mt: 4
          }}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll see your notifications here when they arrive
            </Typography>
          </Box>
        )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredNotifications.length / notificationsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Notification Preferences */}
      <Box mt={4}>
        <Typography variant="h6" mb={2} sx={{ color: "primary.main" }}>
          <SettingsIcon sx={{ mr: 1, color: "primary.main" }} /> Notification Preferences
        </Typography>
        <Paper sx={{ p: 2, backgroundColor: "#f0f4f8" }}>
          <FormControlLabel
            control={
              <Switch
                checked={notificationPreferences.emailAlerts}
                onChange={(e) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    emailAlerts: e.target.checked,
                  }))
                }
              />
            }
            label="Email Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationPreferences.pushNotifications}
                onChange={(e) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    pushNotifications: e.target.checked,
                  }))
                }
              />
            }
            label="Push Notifications"
          />
        </Paper>
      </Box>

      {/* Notification Details Modal */}
        <Modal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          closeAfterTransition 
          BackdropComponent={Backdrop}
        >
        <Fade in={modalOpen}>
          <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 500 },
                bgcolor: darkMode ? '#252525' : '#fff',
                boxShadow: 24,
                p: 4,
              borderRadius: 2,
                maxHeight: '80vh',
                overflow: 'auto'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>
                  {selectedNotification?.title}
                </Typography>
                <IconButton onClick={() => setModalOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2, color: darkMode ? '#fff' : 'text.primary' }}>
                {selectedNotification?.message}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {selectedNotification?.createdAt && format(selectedNotification.createdAt, 'MMM dd, yyyy HH:mm')}
            </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                {!selectedNotification?.isRead && (
                  <Button
                    variant="contained"
                    startIcon={<MarkReadIcon />}
                    onClick={() => {
                      handleMarkRead(selectedNotification.id);
                      setModalOpen(false);
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    handleDelete(selectedNotification.id);
                    setModalOpen(false);
                  }}
                >
                  Delete
                </Button>
              </Box>
          </Box>
        </Fade>
      </Modal>
      </Box>
    </Box>
  );
};

export default React.memo(TenantNotifications);