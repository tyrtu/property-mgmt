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
      {/* Wave background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            fill: (theme) => theme.palette.primary.main,
          }}
        >
          <path d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,170.7C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </Box>

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
          }}
        >
          {/* Header with Icon */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
            <img
              src="/assets/home.png" // Update the path to your PNG image
              alt="RentHive Logo"
              style={{ width: 40, height: 40, marginRight: 10 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600, color: "primary.main" }}>
              RentHive
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
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
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 2 }}>
              {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
            </Button>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
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