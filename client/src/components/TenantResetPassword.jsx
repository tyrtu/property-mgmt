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
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const TenantResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="sm" disableGutters={isMobile}>
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            borderRadius: { xs: 2, sm: 3 },
            overflow: "hidden",
            backgroundColor: "#ffffff",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header with gradient background */}
          <Box
            sx={{
              position: "relative",
              height: { xs: 120, sm: 140, md: 150 },
              background: "linear-gradient(90deg, #1a237e 0%, #283593 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              padding: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/assets/home.png"
                alt="RentHive Logo"
                style={{ 
                  width: isMobile ? 32 : 40, 
                  height: isMobile ? 32 : 40, 
                  marginRight: 10 
                }}
              />
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 600, 
                  color: "#fff",
                  textShadow: "0px 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                RentHive
              </Typography>
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: "rgba(255,255,255,0.9)",
                mt: 1,
                textAlign: "center",
                fontWeight: 300,
                display: { xs: "none", sm: "block" }
              }}
            >
              Property Management Solution
            </Typography>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                overflow: "hidden",
                lineHeight: 0,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                style={{ 
                  display: "block", 
                  width: "100%", 
                  height: isMobile ? 30 : 40,
                  fill: "#ffffff"
                }}
              >
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0Z"></path>
              </svg>
            </Box>
          </Box>

          {/* Reset Password form */}
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              pt: { xs: 4 }
            }}
          >
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                textAlign: "center",
                color: "text.primary" 
              }}
            >
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
                sx={{ mb: 3 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading} 
                sx={{ 
                  mb: 3, 
                  py: 1.2,
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  boxShadow: 2
                }}
                disableElevation
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
              </Button>
              
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", display: "inline" }}>
                  Remember your password?{" "}
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => navigate("/tenant/login")}
                  sx={{ 
                    ml: 0.5,
                    textTransform: "none",
                    fontWeight: 500
                  }}
                >
                  Back to login
                </Button>
              </Box>
            </form>
          </Box>
          
          {/* Footer with copyright */}
          <Box 
            sx={{ 
              textAlign: "center", 
              py: 2,
              mt: { xs: 1, sm: 0 },
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(0,0,0,0.02)"
            }}
          >
            <Typography variant="caption" color="text.secondary">
              © 2025 RentHive. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Success Message */}
      <Snackbar 
        open={!!message} 
        autoHideDuration={6000} 
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled" 
          onClose={() => setMessage("")}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          variant="filled" 
          onClose={() => setError("")}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantResetPassword;