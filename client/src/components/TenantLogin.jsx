import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signInWithEmailAndPassword } from "firebase/auth"; // ✅ Import Firebase Auth
import { auth } from "../firebase"; // ✅ Import Firebase config

const TenantLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle login with Firebase
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Firebase login
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/tenant/dashboard"); // ✅ Redirect to Tenant Dashboard
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setError("");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Tenant Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 2 }}>
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            <Button variant="text" size="small" onClick={() => navigate("/tenant/reset-password")}>
              Forgot Password?
            </Button>
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Don't have an account?{" "}
            <Button variant="text" size="small" onClick={() => navigate("/tenant/register")}>
              Register here
            </Button>
          </Typography>
        </form>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantLogin;
