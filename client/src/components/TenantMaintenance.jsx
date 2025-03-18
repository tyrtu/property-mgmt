// src/components/TenantMaintenance.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import SearchIcon from "@mui/icons-material/Search"; // Added SearchIcon

// Firebase Firestore imports
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Supabase client import
import { supabase } from "../utils/supabaseClient";

const TenantMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newIssue, setNewIssue] = useState("");
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [propertyDetails, setPropertyDetails] = useState({ property: "", unit: "" });
  const [selectedProperty, setSelectedProperty] = useState("All Properties");
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Added searchQuery state

  // Fetch available properties for selection
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const querySnapshot = await getDoc(collection(db, "properties"));
        const propertyList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setProperties(propertyList);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  // Fetch tenant's property and unit details
  useEffect(() => {
    const fetchTenantDetails = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPropertyDetails({
            property: userData.propertyId || "Unknown Property",
            unit: userData.unit || "Unknown Unit",
          });
        }
      } catch (error) {
        console.error("Error fetching tenant details:", error);
      }
    };

    fetchTenantDetails();
  }, []);

  // Fetch maintenance requests
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let maintenanceRef = collection(db, "maintenanceRequests");
    let q = query(maintenanceRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));

    if (selectedProperty !== "All Properties") {
      q = query(maintenanceRef, where("property", "==", selectedProperty), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reqs = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt
            ? new Date(data.createdAt.seconds * 1000)
            : new Date(0);
          return {
            id: doc.id,
            ...data,
            submittedAt: createdAt.toLocaleDateString(),
          };
        });
        setRequests(reqs);
      },
      (error) => {
        console.error("Error fetching maintenance requests:", error);
      }
    );
    return () => unsubscribe();
  }, [selectedProperty]);

  // Open modal
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Close modal and reset inputs
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewIssue("");
    setFile(null);
  };

  // Submit new maintenance request
  const handleSubmitRequest = async () => {
    if (newIssue.trim() === "") return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "maintenanceRequests"), {
        userId: user.uid,
        issue: newIssue,
        status: "Pending",
        createdAt: serverTimestamp(),
        property: propertyDetails.property,
        unit: propertyDetails.unit,
      });

      setSuccessMessage("Maintenance request submitted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Maintenance Requests</Typography>

        {/* Search and Property selection */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Search Input */}
          <TextField
            placeholder="Search property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 200 }}
          />

          {/* Property selection dropdown */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Property</InputLabel>
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              label="Select Property"
              sx={{ "& .MuiSelect-select": { overflow: "hidden", textOverflow: "ellipsis" } }} // Ensure text isn't cut off
            >
              <MenuItem value="All Properties">All Properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.name}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Request Maintenance
      </Button>

      {successMessage && (
        <Typography variant="subtitle1" color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Your Requests</Typography>
        {requests.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <ConstructionIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h5">No Maintenance Requests Found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't submitted any maintenance requests yet. When you do, they'll appear here.
            </Typography>
            <Button variant="contained" onClick={handleOpenDialog}>
              Submit a Request
            </Button>
          </Box>
        ) : (
          <List>
            {requests.map((req) => (
              <ListItem key={req.id} sx={{ mb: 2, borderBottom: "1px solid #ddd" }}>
                <ListItemText
                  primary={req.issue}
                  secondary={`Property: ${req.property} | Unit: ${req.unit} | Submitted: ${req.submittedAt} | Status: ${req.status}`}
                />
                <Chip
                  label={req.status}
                  color={
                    req.status === "Resolved"
                      ? "success"
                      : req.status === "In Progress"
                      ? "warning"
                      : "default"
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Maintenance Request Modal */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Request Maintenance</DialogTitle>
        <DialogContent>
          <TextField
            label="Describe the issue"
            fullWidth
            multiline
            rows={3}
            value={newIssue}
            onChange={(e) => setNewIssue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitRequest}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantMaintenance;