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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        px: { xs: 1, sm: 0 }, // ✅ Tiny margin on small screens
      }}
    >
      <Paper
        sx={{
          width: { xs: "100%", sm: "90%", md: 400 },
          maxWidth: 400, // Prevents stretching
          borderRadius: { xs: 3, sm: 6 }, // ✅ Visible border-radius on small screens
          overflow: "hidden",
          boxShadow: { xs: 1, sm: 3 }, // ✅ Light shadow on small screens
        }}
      >
        {/* Header with gradient background, wave design, and PNG logo */}
        <Box
          sx={{
            position: "relative",
            height: 150,
            background: "linear-gradient(90deg, #6200EE 0%, #FF9800 100%)",
            borderTopLeftRadius: { xs: 3, sm: 6 }, // ✅ Match card border-radius
            borderTopRightRadius: { xs: 3, sm: 6 },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/assets/home.png" // Update the path to your PNG image
              alt="RentHive Logo"
              style={{ width: 40, height: 40, marginRight: 10 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#fff" }}>
              RentHive
            </Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              overflow: "hidden",
              lineHeight: 0,
              color: "primary.main", // Wave colour now matches the navbar theme
            }}
          >
            <svg
              viewBox="0 0 500 150"
              preserveAspectRatio="none"
              style={{ display: "block", width: "100%", height: 50 }}
            >
              <path
                d="M-0.27,76.42 C149.99,150.00 271.56,1.66 500.00,69.97 L500.00,150.00 L0.00,150.00 Z"
                fill="currentColor"
              />
            </svg>
          </Box>
        </Box>

        {/* Reset Password form */}
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}>
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
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                <Button variant="text" size="small" onClick={() => navigate("/tenant/login")}>
                  Back to Login
                </Button>
              </Typography>
            </Box>
          </form>
        </Box>
      </Paper>

      {/* Success Message */}
      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
        <Alert severity="success">{message}</Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantResetPassword;
