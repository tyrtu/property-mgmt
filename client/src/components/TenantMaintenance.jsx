import React, { useState } from "react";
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
  IconButton,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TenantNavigation from "./TenantNavigation";

const TenantMaintenance = () => {
  const [requests, setRequests] = useState([
    { id: 1, issue: "Leaking sink", status: "In Progress", submittedAt: "2024-03-10", estimatedCompletion: "2024-03-15", image: null },
    { id: 2, issue: "Broken AC", status: "Resolved", submittedAt: "2024-02-20", estimatedCompletion: "2024-02-25", image: null },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [newIssue, setNewIssue] = useState("");
  const [file, setFile] = useState(null);

  // Open modal for new request
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Close modal
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewIssue("");
    setFile(null);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  // Submit new maintenance request
  const handleSubmitRequest = () => {
    if (newIssue.trim() === "") return;

    const newRequest = {
      id: requests.length + 1,
      issue: newIssue,
      status: "Pending",
      submittedAt: new Date().toISOString().split("T")[0], // Current date
      estimatedCompletion: "TBD",
      image: file ? URL.createObjectURL(file) : null,
    };

    setRequests([newRequest, ...requests]); // Add to request list
    handleCloseDialog();
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", p: 3 }}>
      <TenantNavigation />
      <Typography variant="h4" sx={{ mb: 3 }}>
        Maintenance Requests
      </Typography>

      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Request Maintenance
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Your Requests</Typography>
        <List>
          {requests.map((req) => (
            <ListItem key={req.id} sx={{ mb: 2, borderBottom: "1px solid #ddd" }}>
              <ListItemText
                primary={req.issue}
                secondary={`Submitted: ${req.submittedAt} | Estimated Completion: ${req.estimatedCompletion}`}
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
