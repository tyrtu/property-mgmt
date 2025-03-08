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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase"; // ✅ Import Firestore
import { doc, getDoc } from "firebase/firestore"; // ✅ Firestore functions

const TenantLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // ✅ New state for reset success message
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
      // ✅ Login user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Check if email is verified
      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      // ✅ Fetch user role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const role = userData.role;

        // ✅ Store role in localStorage
        localStorage.setItem("userRole", role);
        localStorage.setItem("tenantToken", user.uid);

        // ✅ Redirect user based on role
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

  // ✅ Handle Forgot Password Reset
  const handleResetPassword = async () => {
    if (!email) {
      setError("Enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Tenant Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField 
            label="Email" 
            type="email" 
            fullWidth 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            sx={{ mb: 2 }} 
          />
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

          {/* ✅ Forgot Password Button */}
          <Button 
            variant="text" 
            size="small" 
            sx={{ mb: 2, textTransform: "none" }} 
            onClick={handleResetPassword}
          >
            Forgot Password?
          </Button>

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

      {/* ✅ Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* ✅ Success Message Snackbar */}
      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
        <Alert severity="success">{message}</Alert>
      </Snackbar>
    </Box> 
  );
};

export default TenantLogin;
