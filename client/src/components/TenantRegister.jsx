import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";

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

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        role: "tenant",
        createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(user);

      setSuccess("Registration successful! Please verify your email before logging in.");
      setTimeout(() => navigate("/tenant/login"), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper
        sx={{
          width: { xs: "100%", sm: "90%", md: 400 },
          borderRadius: { xs: 2, sm: 4 }, // Ensuring small screens have a visible radius
          overflow: "hidden",
          boxShadow: { xs: "none", sm: 3 },
          margin: { xs: "2px", sm: "auto" }, // Small margin on very small screens
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 150,
            background: "linear-gradient(90deg, #6200EE 0%, #FF9800 100%)",
          }}
        >
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/assets/home.png" alt="RentHive Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
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
              color: "primary.main",
            }}
          >
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 50 }}>
              <path d="M-0.27,76.42 C149.99,150.00 271.56,1.66 500.00,69.97 L500.00,150.00 L0.00,150.00 Z" fill="currentColor" />
            </svg>
          </Box>
        </Box>

        <Box sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Tenant Registration
          </Typography>
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
            <TextField
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
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
        </Box>
      </Paper>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantRegister;
