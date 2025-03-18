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
        height: "100vh",
        background: "linear-gradient(135deg, #6200EE 0%, #FF9800 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated background circles */}
      <Box
        sx={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.1) 20%, transparent 20%)",
          backgroundSize: "40px 40px",
          animation: "moveBackground 10s linear infinite",
          "@keyframes moveBackground": {
            "0%": { transform: "translate(0, 0)" },
            "100%": { transform: "translate(-20px, -20px)" },
          },
        }}
      />

      <Paper
        sx={{
          width: { xs: "100%", sm: "90%", md: 450 },
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          maxHeight: "90vh", // Ensures the form is not cut off on large screens
          overflowY: "auto", // Adds scroll if content exceeds height
        }}
      >
        {/* Header with gradient background, wave design, and PNG logo */}
        <Box
          sx={{
            position: "relative",
            height: 150,
            background: "linear-gradient(90deg, #6200EE 0%, #FF9800 100%)",
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

        {/* Registration form */}
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}>
            Tenant Registration
          </Typography>
          <form onSubmit={handleRegister}>
            <TextField label="Full Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Phone Number" type="tel" fullWidth required value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mb: 2 }} />

            {/* Property Dropdown */}
            <TextField select label="Select Property" fullWidth required value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)} sx={{ mb: 2 }}>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Unit Dropdown */}
            <TextField select label="Select Unit" fullWidth required value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} sx={{ mb: 2 }}>
              {units.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  Unit {unit.number}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Password" type={showPassword ? "text" : "password"} fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }}
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

            <Button fullWidth variant="text" onClick={() => navigate("/tenant/login")} sx={{ textTransform: "none" }}>
              Back to Login
            </Button>
          </form>
        </Box>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess("")}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantRegister;