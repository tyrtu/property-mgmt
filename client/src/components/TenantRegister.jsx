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
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"; 
import { setDoc, doc } from "firebase/firestore"; // ✅ Firestore functions
import { auth, db } from "../firebase"; // ✅ Import Firebase Auth & Firestore

const TenantRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Register user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        role: "tenant", // 🔥 Default role is "tenant"
        createdAt: new Date().toISOString(),
      });

      // ✅ Send Email Verification
      await sendEmailVerification(user);

      setSuccess("Registration successful! Please verify your email before logging in.");
      setTimeout(() => navigate("/tenant/login"), 4000); // Redirect after 4s
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Tenant Registration</Typography>
        <form onSubmit={handleRegister}>
          <TextField label="Full Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Phone Number" type="tel" fullWidth required value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mb: 2 }} />
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
          <TextField label="Confirm Password" type={showPassword ? "text" : "password"} fullWidth required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 2 }}>
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Already have an account?{" "}
            <Button variant="text" size="small" onClick={() => navigate("/tenant/login")}>
              Login here
            </Button>
          </Typography>
        </form>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess("")}>
         <Alert severity="success">{success}</Alert> {/* ✅ Fix: Close Alert properly */}
      </Snackbar>
