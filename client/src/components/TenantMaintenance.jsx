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
  Container,
  Card,
  CardContent,
  Divider,
  LinearProgress,
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
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Close as CloseIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  PriorityHigh as UrgentIcon,
  Pending as PendingIcon,
  Schedule as ScheduledIcon,
  Cancel as CancelledIcon,
  Image as ImageIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
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
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { Timestamp } from 'firebase/firestore';

const TenantMaintenance = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Normal',
    images: [],
    location: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [unitDetails, setUnitDetails] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [tenantData, setTenantData] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const categories = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Appliance',
    'Structural',
    'Pest Control',
    'Landscaping',
    'Other'
  ];

  const priorities = ['Low', 'Normal', 'High', 'Urgent'];

  const statusColors = {
    Pending: '#FFA726',
    'In Progress': '#29B6F6',
    Scheduled: '#66BB6A',
    Completed: '#4CAF50',
    Cancelled: '#EF5350'
  };

  // Fetch user and unit details when component mounts
  useEffect(() => {
    const fetchUserAndUnitDetails = async () => {
      if (!currentUser?.uid) return;

      try {
        // Fetch user details
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserDetails(userData);
          
          // If user has a unitId, fetch unit details
          if (userData.unitId) {
            const unitDoc = await getDoc(doc(db, 'units', userData.unitId));
            if (unitDoc.exists()) {
              const unitData = unitDoc.data();
              setUnitDetails(unitData);
              
              // Update newRequest with user and unit details
              setNewRequest(prev => ({
                ...prev,
                unitId: userData.unitId,
                unitNumber: unitData.number || '',
                propertyName: unitData.propertyName || '',
                tenantName: userData.name || '',
                tenantId: currentUser.uid,
                tenantEmail: currentUser.email || '',
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user/unit details:', error);
        setError('Error loading user information');
      }
    };

    fetchUserAndUnitDetails();
  }, [currentUser]);

  // Fetch tenant data
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setTenantData(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenantData();
  }, []);

  // Fetch maintenance requests
  useEffect(() => {
    let unsubscribe = () => {};
    const fetchMaintenanceRequests = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setError('Please login to view maintenance requests');
          return;
        }

        const q = query(
          collection(db, 'maintenanceRequests'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        setRequests(requestsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching maintenance requests:', err);
        setError('Failed to load maintenance requests');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceRequests();
    return () => unsubscribe();
  }, []);

  // Handle form submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Please login to submit a request');
        return;
      }

      const requestData = {
        userId: user.uid,
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        priority: newRequest.priority,
        location: newRequest.location,
        status: 'Pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        comments: [],
        timeline: [{
          status: 'Pending',
          timestamp: Timestamp.now(),
          note: 'Request submitted'
        }]
      };

      const docRef = await addDoc(collection(db, 'maintenanceRequests'), requestData);
      
      // Upload images if any
      if (newRequest.images.length > 0) {
        const imageUrls = await Promise.all(
          newRequest.images.map(async (image) => {
            const storageRef = ref(storage, `maintenance/${docRef.id}/${image.name}`);
            await uploadBytes(storageRef, image);
            return getDownloadURL(storageRef);
          })
        );

        await updateDoc(doc(db, 'maintenanceRequests', docRef.id), {
          imageUrls: imageUrls
        });
      }

      setOpenDialog(false);
      setNewRequest({
        title: '',
        description: '',
        category: '',
        priority: 'Normal',
        images: [],
        location: '',
      });
      fetchMaintenanceRequests();
    } catch (err) {
      console.error('Error submitting maintenance request:', err);
      setError('Failed to submit maintenance request');
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewRequest(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'in progress': return 'info';
      case 'resolved': return 'success';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon sx={{ color: statusColors.Completed }} />;
      case 'In Progress':
        return <BuildIcon sx={{ color: statusColors['In Progress'] }} />;
      case 'Scheduled':
        return <ScheduledIcon sx={{ color: statusColors.Scheduled }} />;
      case 'Cancelled':
        return <CancelledIcon sx={{ color: statusColors.Cancelled }} />;
      default:
        return <PendingIcon sx={{ color: statusColors.Pending }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: darkMode ? '#121212' : '#f5f5f5'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      p: 3,
      color: darkMode ? '#fff' : 'text.primary'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: darkMode ? '#fff' : 'text.primary'
        }}>
          <BuildIcon sx={{ mr: 2, fontSize: 40 }} />
          Maintenance Requests
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton 
              onClick={toggleDarkMode}
              sx={{ 
                color: darkMode ? '#fff' : '#000',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            New Request
          </Button>
        </Box>
      </Box>

      {/* Status Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(statusColors).map(([status, color]) => (
          <Grid item xs={12} sm={6} md={2.4} key={status}>
            <Paper sx={{ 
              p: 2,
              backgroundColor: darkMode ? '#252525' : '#fff',
              borderLeft: `4px solid ${color}`
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                {status}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {requests.filter(req => req.status === status).length}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Maintenance Requests Grid */}
      <Grid container spacing={3}>
        {requests.map((request) => (
          <Grid item xs={12} md={6} lg={4} key={request.id}>
            <Card sx={{ 
              height: '100%',
              backgroundColor: darkMode ? '#252525' : '#fff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: darkMode ? '#fff' : 'text.primary'
                  }}>
                    <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    {request.issue}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(request.status)}
                    label={request.status}
                    sx={{
                      backgroundColor: `${statusColors[request.status]}20`,
                      color: statusColors[request.status],
                      '& .MuiChip-icon': {
                        color: statusColors[request.status]
                      }
                    }}
                  />
                </Box>

                <Typography variant="body1" sx={{ mb: 2, color: darkMode ? '#fff' : 'text.primary' }}>
                  {request.issue}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {request.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Submitted: {format(request.createdAt, 'MMM dd, yyyy')}
                  </Typography>
                </Box>

                {request.priority === 'Urgent' && (
                  <Chip
                    icon={<UrgentIcon />}
                    label="Urgent"
                    color="error"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {request.imageUrls?.length > 0 && (
                    <Tooltip title={`${request.imageUrls.length} images attached`}>
                      <Badge badgeContent={request.imageUrls.length} color="primary">
                        <IconButton size="small">
                          <ImageIcon />
                        </IconButton>
                      </Badge>
                    </Tooltip>
                  )}
                  {request.comments?.length > 0 && (
                    <Tooltip title={`${request.comments.length} comments`}>
                      <Badge badgeContent={request.comments.length} color="primary">
                        <IconButton size="small">
                          <CommentIcon />
                        </IconButton>
                      </Badge>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* New Request Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Maintenance Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newRequest.title}
                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newRequest.category}
                  label="Category"
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newRequest.priority}
                  label="Priority"
                  onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newRequest.location}
                onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{ mr: 2 }}
              >
                Attach Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {newRequest.images.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {newRequest.images.length} images selected
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitRequest}
            disabled={!newRequest.title || !newRequest.category}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantMaintenance;