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
  CardContent
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
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

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
  const [darkMode, setDarkMode] = useState(false);
  const { currentUser } = useAuth();
  const theme = useTheme();

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

  // Open modal with notification details
  const handleModalOpen = (notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
      p: 3,
      color: darkMode ? '#fff' : 'text.primary'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: darkMode ? '#fff' : 'text.primary'
        }}>
          <NotificationsIcon sx={{ mr: 2, fontSize: 40 }} />
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton 
              onClick={toggleDarkMode}
              sx={{ 
                color: darkMode ? '#fff' : '#000',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <TextField
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} size="small">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="alerts">Alerts</MenuItem>
            <MenuItem value="info">Info</MenuItem>
          </Select>
          <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} size="small">
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Notification Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(notificationTypes).map(([type, { label, color }]) => (
          <Grid item xs={12} sm={6} md={3} key={type}>
            <Paper sx={{ 
              p: 2,
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: `4px solid ${color}`
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                {label} Notifications
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {notifications.filter(n => n.type === type).length}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Bulk Actions */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          onClick={handleMarkAllRead}
          startIcon={<DoneIcon />}
          sx={{ backgroundColor: "#4CAF50", color: "white" }}
        >
          Mark All as Read
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteAll}
          startIcon={<DeleteIcon />}
          sx={{ backgroundColor: "#F44336", color: "white" }}
        >
          Delete All
        </Button>
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
          <Grid item xs={12} md={6} key={notification.id}>
            <Card sx={{ 
              backgroundColor: darkMode ? '#252525' : '#fff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
              opacity: notification.isRead ? 0.8 : 1,
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notificationTypes[notification.type]?.icon}
                    <Typography variant="h6" component="div">
                      {notification.title}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={notification.isRead ? 'Read' : 'Unread'}
                    color={notification.isRead ? 'default' : 'primary'}
                  />
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {notification.message}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimeIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {format(notification.createdAt, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {!notification.isRead && (
                    <Tooltip title="Mark as read">
                      <IconButton 
                        size="small" 
                        onClick={() => handleMarkRead(notification.id)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <MarkReadIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(notification.id)}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeAfterTransition BackdropComponent={Backdrop}>
        <Fade in={modalOpen}>
          <Box
            sx={{
              p: 4,
              backgroundColor: "#f0f4f8",
              mx: "auto",
              my: "20%",
              width: 400,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6">{selectedNotification?.message}</Typography>
            <Typography variant="body2">
              {selectedNotification?.createdAt?.toLocaleString()}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default React.memo(TenantNotifications);