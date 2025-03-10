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
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
// Firebase Firestore imports
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const TenantMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newIssue, setNewIssue] = useState("");
  const [file, setFile] = useState(null);

  // Fetch maintenance requests for the current tenant
  useEffect(() => {
    const fetchRequests = () => {
      const user = auth.currentUser;
      if (!user) return;
      const maintenanceRef = collection(db, "maintenanceRequests");
      // Query to get only requests from the current user, ordered by creation time descending
      const q = query(
        maintenanceRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reqs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(reqs);
      }, (error) => {
        console.error("Error fetching maintenance requests: ", error);
      });
      return unsubscribe;
    };

    const unsubscribe = fetchRequests();
    return () => unsubscribe && unsubscribe();
  }, []);

  // Open modal for new request
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Close modal and reset inputs
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewIssue("");
    setFile(null);
  };

  // Handle file upload (for testing only)
  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  // Submit new maintenance request to Firestore
  const handleSubmitRequest = async () => {
    if (newIssue.trim() === "") return;
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, "maintenanceRequests"), {
        userId: user.uid,
        issue: newIssue,
        status: "Pending", // Initial status
        createdAt: serverTimestamp(),
        image: file ? URL.createObjectURL(file) : null,
      });
      // The onSnapshot listener will update the requests automatically
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Maintenance Requests
      </Typography>

      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Request Maintenance
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Your Requests</Typography>
        {requests.length === 0 ? (
          <Typography>No requests found.</Typography>
        ) : (
          <List>
            {requests.map((req) => (
              <ListItem key={req.id} sx={{ mb: 2, borderBottom: "1px solid #ddd" }}>
                <ListItemText
                  primary={req.issue}
                  secondary={`Submitted: ${
                    req.createdAt
                      ? new Date(req.createdAt.seconds * 1000).toLocaleDateString()
                      : "Pending"
                  } | Status: ${req.status}`}
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
                {req.image && (
                  <img
                    src={req.image}
                    alt="Uploaded issue"
                    style={{ width: 50, height: 50, marginLeft: 10, borderRadius: 5 }}
                  />
                )}
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
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
            startIcon={<AttachFileIcon />}
          >
            Upload Image
            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
          </Button>
          {file && <Typography sx={{ mt: 1 }}>Attached: {file.name}</Typography>}
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
