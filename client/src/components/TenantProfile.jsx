import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  IconButton,
  Divider,
  Stack,
  Chip,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Phone,
  Email,
  Home,
  CalendarToday,
  Security,
  Badge,
  PhotoCamera,
  Verified,
  LocationOn,
  Person,
  Apartment,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';
import { useDarkMode } from '../context/DarkModeContext';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';

const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return 'Not specified';
  }
  try {
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const TenantProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    leaseStart: '',
    leaseEnd: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    property: {
      name: '',
      address: '',
      unit: ''
    },
    verificationStatus: 'verified',
    joinDate: new Date(),
    lastUpdated: new Date()
  });
  const [editData, setEditData] = useState({});
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const validateForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = 'Name is required';
    if (!data.phone) errors.phone = 'Phone number is required';
    if (!data.email) errors.email = 'Email is required';
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Invalid email format';
    }
    return errors;
  };

  const validatePassword = (data) => {
    const errors = {};
    if (!data.currentPassword) errors.currentPassword = 'Current password is required';
    if (!data.newPassword) errors.newPassword = 'New password is required';
    if (data.newPassword && data.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(editData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          ...editData,
          lastUpdated: new Date()
        });
        setProfileData({
          ...editData,
          lastUpdated: new Date()
        });
        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });
      }
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword')
    };

    const errors = validatePassword(data);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        // Reauthenticate user before changing password
        const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, data.newPassword);
        
        setSnackbar({
          open: true,
          message: 'Password updated successfully',
          severity: 'success'
        });
        e.target.reset();
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setSnackbar({
        open: true,
        message: 'Error updating password',
        severity: 'error'
      });
    }
  };

  const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfileData({
            ...userData,
            joinDate: userData.joinDate?.toDate() || new Date(),
            lastUpdated: userData.lastUpdated?.toDate() || new Date()
          });

          if (userData.propertyId) {
            const propertyRef = doc(db, 'properties', userData.propertyId);
            const propertySnap = await getDoc(propertyRef);
            if (propertySnap.exists()) {
              setPropertyDetails(propertySnap.data());
              setProfileData(prev => ({
                ...prev,
                property: {
                  name: propertySnap.data().name,
                  address: propertySnap.data().address,
                  unit: userData.unitNumber || ''
                }
              }));
            }
          }
        }
      }
      setLoading(false);
      } catch (error) {
      console.error('Error fetching profile data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading profile data',
        severity: 'error'
      });
        setLoading(false);
      }
    };

  const handleEditClick = () => {
    setEditData({ ...profileData });
    setEditing(true);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingPhoto(true);
      try {
      const user = auth.currentUser;
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          avatar: photoURL
        });
        
        setProfileData(prev => ({
          ...prev,
          avatar: photoURL
        }));
        
        setSnackbar({
          open: true,
          message: 'Profile photo updated successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error uploading photo:', error);
        setSnackbar({
          open: true,
          message: 'Error uploading photo',
          severity: 'error'
        });
      }
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: darkMode ? '#121212' : '#f5f5f5'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      p: { xs: 2, sm: 3 },
      color: darkMode ? '#fff' : 'text.primary'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 4,
        mt: { xs: 2, sm: 3 },
        backgroundColor: darkMode ? '#252525' : '#fff',
        p: 3,
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Person sx={{ 
            fontSize: 40,
            color: darkMode ? '#fff' : 'primary.main'
          }} />
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: darkMode ? '#fff' : 'text.primary'
              }}
            >
              Profile Settings
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                mt: 0.5
              }}
            >
              Manage your account information and preferences
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3,
            backgroundColor: darkMode ? '#252525' : '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: 2,
            mb: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 3
            }}>
              <Avatar
                src={profileData.avatar}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  border: '4px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {profileData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.email}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <Apartment sx={{ color: 'primary' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Unit Number"
                  secondary={profileData.property?.unit || 'Not specified'}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon sx={{ color: 'primary' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone Number"
                  secondary={profileData.phone || 'Not specified'}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarTodayIcon sx={{ color: 'primary' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Move-in Date"
                  secondary={formatDate(profileData.leaseStart)}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Settings Forms */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3,
            backgroundColor: darkMode ? '#252525' : '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: 2,
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Update Profile
      </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editing ? editData.name : profileData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
                    label="Phone Number"
                    value={editing ? editData.phone : profileData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
        <TextField
                    fullWidth
          label="Email"
                    value={editing ? editData.email : profileData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Name"
                    value={editing ? editData.property?.name : profileData.property?.name}
                    onChange={(e) => setEditData({
                      ...editData,
                      property: { ...editData.property, name: e.target.value }
                    })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Unit Number"
                    value={editing ? editData.property?.unit : profileData.property?.unit}
                    onChange={(e) => setEditData({
                      ...editData,
                      property: { ...editData.property, unit: e.target.value }
                    })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Address"
                    value={editing ? editData.property?.address : profileData.property?.address}
                    onChange={(e) => setEditData({
                      ...editData,
                      property: { ...editData.property, address: e.target.value }
                    })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
          fullWidth
                    label="Emergency Contact Name"
                    value={editing ? editData.emergencyContact?.name : profileData.emergencyContact?.name}
                    onChange={(e) => setEditData({
                      ...editData,
                      emergencyContact: { ...editData.emergencyContact, name: e.target.value }
                    })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
        <TextField
          fullWidth
                    label="Emergency Contact Phone"
                    value={editing ? editData.emergencyContact?.phone : profileData.emergencyContact?.phone}
                    onChange={(e) => setEditData({
                      ...editData,
                      emergencyContact: { ...editData.emergencyContact, phone: e.target.value }
                    })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
        <TextField
          fullWidth
                    label="Emergency Contact Relationship"
                    value={editing ? editData.emergencyContact?.relationship : profileData.emergencyContact?.relationship}
                    onChange={(e) => setEditData({
                      ...editData,
                      emergencyContact: { ...editData.emergencyContact, relationship: e.target.value }
                    })}
                    disabled={!editing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      py: 1.5,
                      backgroundColor: darkMode ? '#1976d2' : '#1976d2',
                      '&:hover': {
                        backgroundColor: darkMode ? '#1565c0' : '#1565c0',
                      },
                      textTransform: 'none',
                      fontWeight: 500,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Password Change Section */}
          <Paper sx={{ 
            p: 3,
            backgroundColor: darkMode ? '#252525' : '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Change Password
          </Typography>
            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    name="currentPassword"
                    label="Current Password"
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    name="newPassword"
                    label="New Password"
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    name="confirmPassword"
                    label="Confirm New Password"
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="outlined"
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderColor: darkMode ? '#f44336' : '#f44336',
                      color: darkMode ? '#f44336' : '#f44336',
                      '&:hover': {
                        borderColor: darkMode ? '#d32f2f' : '#d32f2f',
                        backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.08)' : 'rgba(244, 67, 54, 0.04)',
                      },
                      textTransform: 'none',
                      fontWeight: 500,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Change Password
            </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantProfile;

