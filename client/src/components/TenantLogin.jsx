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
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";

const TenantLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(""); // ✅ To show resend success message
  const navigate = useNavigate();

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendSuccess("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Block login if email is NOT verified
      if (!user.emailVerified) {
        await signOut(auth); // ✅ Force logout if not verified
        setError("Your email is not verified. Please check your inbox.");
        return;
      }

      navigate("/tenant/dashboard"); // ✅ Redirect to dashboard after successful login
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Email
  const handleResendVerification = async () => {
    setError("");
    setResendSuccess("");

    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        setResendSuccess("Verification email sent! Check your inbox.");
      } else {
        setError("Invalid request. Try logging in again.");
      }
    } catch (err) {
      setError("Error sending verification email. Try again later.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Tenant Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
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
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* Success Snackbar for Resend Email */}
      <Snackbar open={!!resendSuccess} autoHideDuration={6000} onClose={() => setResendSuccess("")}>
        <Alert severity="success">{resendSuccess}</Alert>
      </Snackbar>

      {/* Resend Verification Email Button */}
      {error === "Your email is not verified. Please check your inbox." && (
        <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={handleResendVerification}>
          Resend Verification Email
        </Button>
      )}
    </Box>
  );
};

export default TenantLogin;
