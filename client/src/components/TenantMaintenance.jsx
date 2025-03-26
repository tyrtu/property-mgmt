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
  IconButton,
  Badge,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  Fade,
  Backdrop,
  Pagination,
  Modal,
} from "@mui/material";
import {
  Construction as ConstructionIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const TenantMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newIssue, setNewIssue] = useState("");
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [propertyDetails, setPropertyDetails] = useState({ 
    property: "", 
    unit: "",
    propertyName: ""
  });
  const [selectedProperty, setSelectedProperty] = useState("All Properties");
  const [properties, setProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [requestsPerPage] = useState(5);

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
          
          // Fetch property details
          const propertyDoc = await getDoc(doc(db, "properties", userData.propertyId));
          const propertyName = propertyDoc.exists() ? propertyDoc.data().name : "Unknown Property";
          
          setPropertyDetails({
            property: userData.propertyId || "Unknown Property",
            unit: userData.unit || "Unknown Unit",
            propertyName: propertyName
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
    let q = query(maintenanceRef, where("userId", "==", user.uid), orderBy("createdAt", sortOrder));

    if (selectedProperty !== "All Properties") {
      q = query(maintenanceRef, where("property", "==", selectedProperty), where("userId", "==", user.uid), orderBy("createdAt", sortOrder));
    }

    if (filterStatus !== "All") {
      q = query(maintenanceRef, where("status", "==", filterStatus), where("userId", "==", user.uid), orderBy("createdAt", sortOrder));
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
  }, [selectedProperty, filterStatus, sortOrder]);

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
        propertyId: propertyDetails.property,
        propertyName: propertyDetails.propertyName,
        unit: propertyDetails.unit,
        tenantName: user.displayName || "Unknown Tenant",
        tenantEmail: user.email
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

  // Open request details modal
  const handleOpenRequestModal = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  // Pagination
  const indexOfLastRequest = page * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ color: "primary.main" }}>
          <ConstructionIcon sx={{ fontSize: 35, mr: 1, color: "primary.main" }} /> Maintenance Requests
        </Typography>

        {/* Property selection dropdown */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Property</InputLabel>
          <Select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
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

      {/* Analytics Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              backgroundColor: "#f0f4f8", // Light and dull background
            }}
          >
            <ConstructionIcon sx={{ fontSize: 40, mb: 1, color: "primary.main" }} />
            <Typography variant="h6">Total Requests</Typography>
            <Typography variant="h4">{requests.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              backgroundColor: "#f0f4f8", // Light and dull background
            }}
          >
            <WarningIcon sx={{ fontSize: 40, mb: 1, color: "warning.main" }} />
            <Typography variant="h6">Pending Requests</Typography>
            <Typography variant="h4">
              {requests.filter((req) => req.status === "Pending").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              backgroundColor: "#f0f4f8", // Light and dull background
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, mb: 1, color: "success.main" }} />
            <Typography variant="h6">Resolved Requests</Typography>
            <Typography variant="h4">
              {requests.filter((req) => req.status === "Resolved").length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter and Sort Options */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort by Date</InputLabel>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Submit Request Button */}
      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        <AddIcon sx={{ mr: 1 }} /> Request Maintenance
      </Button>

      {successMessage && (
        <Typography variant="subtitle1" color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      {/* Requests List */}
      <Paper sx={{ p: 3, backgroundColor: "#f0f4f8" }}>
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
            {currentRequests.map((req) => (
              <ListItem
                key={req.id}
                sx={{
                  mb: 2,
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleOpenRequestModal(req)}
              >
                <ListItemText
                  primary={req.issue}
                  secondary={`Property: ${req.propertyName} | Unit: ${req.unit} | Submitted: ${req.submittedAt}`}
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

        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(requests.length / requestsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Maintenance Request Modal */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Request Maintenance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Property Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Property: {propertyDetails.propertyName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unit: {propertyDetails.unit}
            </Typography>
          </Box>
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

      {/* Request Details Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeAfterTransition BackdropComponent={Backdrop}>
        <Fade in={modalOpen}>
          <Box
            sx={{
              p: 4,
              backgroundColor: "#f0f4f8",
              mx: "auto",
              my: "20%",
              width: 400,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>{selectedRequest?.issue}</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Property Information</Typography>
              <Typography variant="body2">Property: {selectedRequest?.propertyName}</Typography>
              <Typography variant="body2">Unit: {selectedRequest?.unit}</Typography>
            </Box>
            <Typography variant="body2">
              Submitted: {selectedRequest?.submittedAt}
            </Typography>
            <Typography variant="body2">
              Status: {selectedRequest?.status}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default TenantMaintenance;