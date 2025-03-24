Responsive TenantRegister Component

import React, { useState, useEffect } from "react";
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
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { setDoc, doc, collection, getDocs, updateDoc } from "firebase/firestore";
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

  // Property and Unit Selection
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        const propertyList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setProperties(propertyList);
      } catch (err) {
        console.error("Error fetching properties:", err);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedProperty) return;

      try {
        const querySnapshot = await getDocs(
          collection(db, "properties", selectedProperty, "units")
        );
        const unitList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          number: doc.data().number,
          occupied: doc.data().occupied,
        }));

        // Filter out occupied units
        const availableUnits = unitList.filter((unit) => !unit.occupied);
        setUnits(availableUnits);
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchUnits();
  }, [selectedProperty]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name || !email || !phone || !password || !confirmPassword || !selectedProperty || !selectedUnit) {
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

      // Save tenant data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        role: "tenant",
        propertyId: selectedProperty,
        unitId: selectedUnit,
        createdAt: new Date().toISOString(),
      });

      // Mark the unit as occupied
      await updateDoc(doc(db, "properties", selectedProperty, "units", selectedUnit), {
        occupied: true,
        tenantId: user.uid,
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

          {/* Registration form */}
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              pt: { xs: 4 },
              maxHeight: { sm: "70vh" },
              overflowY: { sm: "auto" }
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
              Tenant Registration
            </Typography>
            <form onSubmit={handleRegister}>
              <TextField 
                label="Full Name" 
                fullWidth 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                sx={{ mb: 2.5 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
              <TextField 
                label="Email" 
                type="email" 
                fullWidth 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                sx={{ mb: 2.5 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
              <TextField 
                label="Phone Number" 
                type="tel" 
                fullWidth 
                required 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                sx={{ mb: 2.5 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />

              {/* Property Dropdown */}
              <TextField 
                select 
                label="Select Property" 
                fullWidth 
                required 
                value={selectedProperty} 
                onChange={(e) => setSelectedProperty(e.target.value)} 
                sx={{ mb: 2.5 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              >
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Unit Dropdown */}
              <TextField 
                select 
                label="Select Unit" 
                fullWidth 
                required 
                value={selectedUnit} 
                onChange={(e) => setSelectedUnit(e.target.value)} 
                sx={{ mb: 2.5 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              >
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    Unit {unit.number}
                  </MenuItem>
                ))}
              </TextField>

              <TextField 
                label="Password" 
                type={showPassword ? "text" : "password"} 
                fullWidth 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                sx={{ mb: 2.5 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility} edge="end" size={isMobile ? "small" : "medium"}>
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
                {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", display: "inline" }}>
                  Already have an account?{" "}
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
                  Login here
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

      {/* Success Snackbar */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled" 
          onClose={() => setSuccess("")}
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantRegister;