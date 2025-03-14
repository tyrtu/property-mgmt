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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // Import Firestore
import { doc, getDoc } from "firebase/firestore"; // Firestore functions

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
      // Login user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      // Fetch user role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const role = userData.role;

        // Store role and token in localStorage
        localStorage.setItem("userRole", role);
        localStorage.setItem("tenantToken", user.uid);

        // Redirect user based on role
        if (role === "admin") {
          navigate("/dashboard"); // Redirect Admins
        } else {
          navigate("/tenant/dashboard"); // Redirect Tenants
        }
      } else {
        setError("User role not found. Please contact support.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: "center" }}>
        {/* Title with Custom PNG Image */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
          <img
            src="/home.png" // Update the path to your PNG image
            alt="RentHive Logo"
            style={{ width: 40, height: 40, marginRight: 10 }} // Adjust size as needed
          />
          <Typography variant="h4" sx={{ fontWeight: 600, color: "primary.main" }}>
            RentHive
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Tenant Login</Typography>
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

          {/* Forgot Password Link - Redirects to TenantResetPassword Page */}
          <Typography
            variant="body2"
            sx={{ color: "primary.main", textAlign: "right", cursor: "pointer", mb: 2 }}
            onClick={() => navigate("/tenant/reset-password")}
          >
            Forgot Password?
          </Typography>

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 2 }}>
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Don't have an account?{" "}
            <Button variant="text" size="small" onClick={() => navigate("/tenant/register")}>
              Register here
            </Button>
          </Typography>
        </form>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantLogin;