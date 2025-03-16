import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; // ✅ Import Firebase Auth

const TenantResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle password reset request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Content */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          sx={{
            width: { xs: "100%", sm: "90%", md: 400 },
            borderRadius: { xs: 0, sm: 2 },
            overflow: "hidden",
            boxShadow: { xs: "none", sm: (theme) => theme.shadows[3] },
            p: 4,
            textAlign: "center",
            backgroundColor: "background.paper",
            position: "relative",
          }}
        >
          {/* Wave inside the card */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100px",
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            <svg
              viewBox="0 0 500 150"
              preserveAspectRatio="none"
              style={{
                width: "100%",
                height: "100%",
                fill: (theme) => theme.palette.primary.main,
              }}
            >
              <path d="M0,70 C150,150 350,0 500,70 L500,0 L0,0 Z"></path>
            </svg>
          </Box>

          {/* Header with Icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              position: "relative",
              zIndex: 1,
            }}
          >
            <img
              src="/assets/home.png" // Update the path to your PNG image
              alt="RentHive Logo"
              style={{ width: 40, height: 40, marginRight: 10 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600, color: "primary.main" }}>
              RentHive
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, position: "relative", zIndex: 1 }}>
            Reset Password
          </Typography>
          <form onSubmit={handleResetPassword}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2, position: "relative", zIndex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mb: 2, position: "relative", zIndex: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
            </Button>

            <Typography variant="body2" sx={{ color: "text.secondary", position: "relative", zIndex: 1 }}>
              <Button variant="text" size="small" onClick={() => navigate("/tenant/login")}>
                Back to Login
              </Button>
            </Typography>
          </form>

          {/* Success Message */}
          <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
            <Alert severity="success">{message}</Alert>
          </Snackbar>

          {/* Error Snackbar */}
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        </Paper>
      </Box>
    </Box>
  );
};

export default TenantResetPassword;