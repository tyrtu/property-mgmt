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
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { format } from 'date-fns';

const TenantMaintenance = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    issue: '',
    description: '',
    priority: 'Medium',
    image: null,
    unitId: '',
    unitNumber: '',
    propertyName: '',
    tenantName: '',
    tenantId: '',
    tenantEmail: '',
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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
        const user = auth.currentUser;
        if (user && tenantData) {
          let q = query(
            collection(db, "maintenanceRequests"),
            where("userId", "==", user.uid),
            where("propertyId", "==", tenantData.propertyId),
            where("unitId", "==", tenantData.unitId),
            orderBy("createdAt", "desc")
          );
          
          unsubscribe = onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate()
            }));
            setMaintenanceRequests(requests);
          });
        }
      } catch (error) {
        console.error("Error fetching maintenance requests:", error);
        setError("Failed to fetch maintenance requests");
      }
    };

    fetchMaintenanceRequests();
    return () => unsubscribe();
  }, [tenantData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not found');
      }

      // Get user data to get property and unit information
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data();

      const maintenanceRequest = {
        userId: user.uid,
        tenantName: userData.name,
        propertyId: userData.propertyId,
        propertyName: userData.propertyName,
        unitId: userData.unitId,
        unit: userData.unit,
        issue: newRequest.issue,
        description: newRequest.description,
        status: 'pending',
        priority: newRequest.priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'maintenanceRequests'), maintenanceRequest);
      setSuccess('Maintenance request submitted successfully');
      setOpenDialog(false);
      setNewRequest({
        issue: '',
        description: '',
        priority: 'Medium',
        image: null,
        unitId: unitDetails?.id || '',
        unitNumber: unitDetails?.number || '',
        propertyName: unitDetails?.propertyName || '',
        tenantName: userDetails?.name || '',
        tenantId: currentUser.uid,
        tenantEmail: currentUser.email || '',
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      setError('Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRequest(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
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
    switch (status.toLowerCase()) {
      case 'pending': return <WarningIcon color="warning" />;
      case 'in progress': return <BuildIcon color="info" />;
      case 'resolved': return <CheckCircleIcon color="success" />;
      case 'overdue': return <WarningIcon color="error" />;
      default: return <CheckCircleIcon color="disabled" />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: darkMode ? '#121212' : '#f5f5f5',
      py: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth="lg">
        <Card sx={{ 
          p: { xs: 2, sm: 4 },
          bgcolor: darkMode ? '#1e1e1e' : '#fff',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: darkMode ? '#fff' : '#000',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              Submit Maintenance Request
            </Typography>
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
          </Box>

          {/* Property and Unit Information */}
          <Card sx={{ 
            p: 2, 
            mb: 3,
            bgcolor: darkMode ? '#333' : '#f5f5f5',
            borderRadius: 2
          }}>
            <Typography 
              variant="h6" 
            sx={{
                mb: 2,
                color: darkMode ? '#fff' : '#000'
            }}
          >
              Property Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? '#aaa' : '#666',
                    mb: 0.5
                  }}
                >
                  Property
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: darkMode ? '#fff' : '#000',
                    fontWeight: 500
                  }}
                >
                  {unitDetails?.propertyName || 'Not assigned'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? '#aaa' : '#666',
                    mb: 0.5
                  }}
                >
                  Unit Number
                </Typography>
                <Typography 
                  variant="body1" 
            sx={{
                    color: darkMode ? '#fff' : '#000',
                    fontWeight: 500
            }}
          >
                  {unitDetails?.number || 'Not assigned'}
            </Typography>
              </Grid>
            </Grid>
          </Card>

          {/* Maintenance Request Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Issue Title"
                  value={newRequest.issue}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, issue: e.target.value }))}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#333' : '#fff',
                      '& fieldset': {
                        borderColor: darkMode ? '#555' : '#ccc',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#666' : '#999',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                      color: darkMode ? '#fff' : '#000',
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#aaa' : '#666',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#333' : '#fff',
                      '& fieldset': {
                        borderColor: darkMode ? '#555' : '#ccc',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#666' : '#999',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                      color: darkMode ? '#fff' : '#000',
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#aaa' : '#666',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: darkMode ? '#aaa' : '#666' }}>
                    Priority
                  </InputLabel>
          <Select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value }))}
                    label="Priority"
                    sx={{
                      bgcolor: darkMode ? '#333' : '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? '#555' : '#ccc',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? '#666' : '#999',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                      color: darkMode ? '#fff' : '#000',
                    }}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  sx={{
                    height: '56px',
                    borderColor: darkMode ? '#555' : '#ccc',
                    color: darkMode ? '#fff' : '#000',
                    '&:hover': {
                      borderColor: darkMode ? '#666' : '#999',
                    },
                  }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>

              {imagePreview && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    maxWidth: 300,
                    mx: 'auto'
                  }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                    <IconButton
                      onClick={() => {
                        setImagePreview(null);
                        setNewRequest(prev => ({ ...prev, image: null }));
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.7)',
                        },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* Error and Success Messages */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                bgcolor: darkMode ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.04)',
                color: darkMode ? '#ff8a8a' : '#d32f2f',
                '& .MuiAlert-icon': {
                  color: darkMode ? '#ff8a8a' : '#d32f2f',
                },
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mt: 2,
                bgcolor: darkMode ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.04)',
                color: darkMode ? '#81c784' : '#2e7d32',
                '& .MuiAlert-icon': {
                  color: darkMode ? '#81c784' : '#2e7d32',
                },
              }}
            >
              {success}
            </Alert>
          )}

          {/* Previous Requests */}
          <Box sx={{ mt: 6 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3,
                color: darkMode ? '#fff' : '#000',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Previous Requests
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              px: { xs: 0, sm: 1 }
            }}>
              {maintenanceRequests.map((request) => (
                <Card 
                  key={request.id}
                sx={{
                    p: 2,
                    bgcolor: darkMode ? '#333' : '#fff',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: darkMode ? '#3a3a3a' : '#f5f5f5',
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                  mb: 2,
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: darkMode ? '#fff' : '#000',
                        flex: 1,
                        minWidth: '200px'
                      }}
                    >
                      {request.issue}
                    </Typography>
                <Chip
                      label={request.status}
                  color={getStatusColor(request.status)}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 500,
                      }}
          />
        </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: darkMode ? '#aaa' : '#666',
                          mb: 0.5
                        }}
                      >
                        Submitted
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: darkMode ? '#fff' : '#000',
                          fontWeight: 500
                        }}
                      >
                        {format(request.createdAt, 'MMM dd, yyyy h:mm a')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: darkMode ? '#aaa' : '#666',
                          mb: 0.5
                        }}
                      >
                        Priority
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: darkMode ? '#fff' : '#000',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      >
                        {request.priority}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography 
                        variant="body2" 
            sx={{
                          color: darkMode ? '#aaa' : '#666',
                          mb: 0.5
                        }}
                      >
                        Description
            </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: darkMode ? '#fff' : '#000',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {request.description}
            </Typography>
                    </Grid>
                    {request.image && (
                      <Grid item xs={12}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? '#aaa' : '#666',
                            mb: 0.5
                          }}
                        >
                          Image
            </Typography>
                        <img
                          src={request.image}
                          alt="Maintenance issue"
                          style={{
                            width: '100%',
                            maxWidth: 300,
                            borderRadius: 8,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Card>
              ))}
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default TenantMaintenance;