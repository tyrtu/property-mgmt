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
} from "@mui/material";
import { AccountBalanceWallet, Home, Build } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// Firebase imports for fetching tenant name and notifications
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";

// Import your React Big Calendar component/
import CalendarComponent from "./CalendarComponent";

const TenantDashboard = () => {
  const navigate = useNavigate();

  // State for fetched tenant name from Firestore
  const [fetchedName, setFetchedName] = useState("John Doe");
  // State for notifications fetched from Firebase (only today's)
  const [notifications, setNotifications] = useState([]);

  // Fetch the tenant's name from Firestore on mount
  useEffect(() => {
    const fetchTenantName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFetchedName(data.name || "John Doe");
          }
        } catch (error) {
          console.error("Error fetching tenant name:", error);
        }
      }
    };
    fetchTenantName();
  }, []);

  // Fetch notifications from Firebase, filtering for notifications sent today only
  useEffect(() => {
    let isMounted = true;
    let unsubscribeNotifications = () => {};
    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const notificationsRef = collection(db, "notifications");
          const q = query(
            notificationsRef,
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          unsubscribeNotifications = onSnapshot(q, (snapshot) => {
            const today = new Date();
            const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
            const todayNotifications = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt
                  ? doc.data().createdAt.toDate()
                  : null,
              }))
              .filter((note) => {
                if (!note.createdAt) return false;
                return note.createdAt.toISOString().split("T")[0] === todayStr;
              });
            if (isMounted) {
              setNotifications(todayNotifications);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
    return () => {
      isMounted = false;
      unsubscribeNotifications();
    };
  }, []);

  // Dummy tenant data; replace with real data from backend.
  // For now, all fields remain as mock data except for the name.
  const tenant = {
    name: fetchedName, // Use fetched name from Firestore
    avatar: "https://i.pravatar.cc/150?img=3",
    leaseStart: "2024-01-01",
    leaseEnd: "2024-12-31",
    rentAmount: 1200,
    nextPaymentDue: "2024-04-01",
    maintenanceRequests: [
      { id: 1, issue: "Leaking sink", status: "In Progress" },
      { id: 2, issue: "Broken AC", status: "Resolved" },
    ],
    totalOutstanding: 1200,
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Note: TenantNavigation is already rendered in TenantPortal */}

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3 }}>
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
                  value={tenant.totalOutstanding > 0 ? 50 : 100}
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
                <Typography variant="h6">
                  {tenant.maintenanceRequests.length}
                </Typography>
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
        </Grid>

        {/* Additional Dashboard Cards */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {/* Today's Notifications Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Notifications
                </Typography>
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map((note) => (
                    <Box key={note.id} sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {note.message.length > 50
                          ? note.message.substring(0, 50) + "..."
                          : note.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {note.createdAt
                          ? new Date(note.createdAt).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No notifications for today.
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/tenant/notifications")}
                >
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </Grid>
          {/* Calendar Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Calendar
                </Typography>
                <CalendarComponent />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          textAlign: "center",
          backgroundColor: "#222",
          color: "#fff",
          fontSize: "14px",
        }}
      >
        <Typography variant="body2">
          Developed by <strong>Raphael</strong> | Contact:{" "}
          <a
            href="tel:+254748211821"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            +254748211821
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export default TenantDashboard;
