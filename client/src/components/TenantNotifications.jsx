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
  Badge,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Pagination,
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
} from "firebase/firestore";
import { auth, db } from "../firebase";

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

        unsubscribeNotifications = onSnapshot(
          q,
          (snapshot) => {
            const notes = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
            }));

            if (isMounted) {
              setNotifications(notes);
              setLoading(false);
            }
          },
          (error) => {
            if (isMounted) setError("Failed to load notifications");
          }
        );
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
      unsubscribeNotifications();
    };
  }, [sortOrder]);

  // Mark a notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { isRead: true });
      setNotifications((prev) =>
        prev.map((note) => (note.id === notificationId ? { ...note, isRead: true } : note))
      );
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  // Delete a notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      setNotifications((prev) => prev.filter((note) => note.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
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

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">
          <BellIcon sx={{ fontSize: 35, mr: 1 }} /> Notifications
        </Typography>
        <Box display="flex" gap={2}>
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

      {/* Analytics Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Total Notifications</Typography>
            <Typography variant="h4">{notifications.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Unread Notifications</Typography>
            <Typography variant="h4">
              {notifications.filter((note) => !note.isRead).length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Alerts</Typography>
            <Typography variant="h4">
              {notifications.filter((note) => note.type === "alert").length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Bulk Actions */}
      <Box display="flex" gap={2} mb={3}>
        <Button variant="contained" onClick={handleMarkAllRead}>
          Mark All as Read
        </Button>
        <Button variant="outlined" color="error" onClick={handleDeleteAll}>
          Delete All
        </Button>
      </Box>

      {/* Notifications List */}
      {loading && (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {filteredNotifications.length === 0 && !loading && (
        <Box textAlign="center" py={5}>
          <BellIcon color="primary" sx={{ fontSize: 60 }} />
          <Typography>No notifications found.</Typography>
        </Box>
      )}

      <List>
        {currentNotifications.map((note) => (
          <React.Fragment key={note.id}>
            <ListItem
              sx={{ background: note.isRead ? "#f5f5f5" : "#fff", cursor: "pointer" }}
              onClick={() => handleModalOpen(note)}
            >
              <ListItemIcon>
                {note.type === "alert" ? <WarningIcon color="error" /> : <InfoIcon color="info" />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: note.isRead ? "normal" : "bold" }}>
                    {note.message}
                  </Typography>
                }
                secondary={new Date(note.createdAt).toLocaleString()}
              />
              <Tooltip title="Mark as Read">
                <IconButton onClick={(e) => { e.stopPropagation(); handleMarkRead(note.id); }} disabled={note.isRead}>
                  <DoneIcon color={note.isRead ? "disabled" : "primary"} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Tooltip>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

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
        <Typography variant="h6" mb={2}>
          <SettingsIcon sx={{ mr: 1 }} /> Notification Preferences
        </Typography>
        <Paper sx={{ p: 2 }}>
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
          <Box sx={{ p: 4, backgroundColor: "white", mx: "auto", my: "20%", width: 400, borderRadius: 2 }}>
            <Typography variant="h6">{selectedNotification?.message}</Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedNotification?.createdAt?.toLocaleString()}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default React.memo(TenantNotifications);