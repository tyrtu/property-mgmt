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
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper
        sx={{
          p: 4,
          width: { xs: "100%", sm: "90%", md: 400 },
          borderRadius: { xs: 0, sm: 2 },
          textAlign: "center",
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
  );
};

export default TenantResetPassword;

