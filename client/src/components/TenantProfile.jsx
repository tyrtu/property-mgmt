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
  useMediaQuery
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
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';

const TenantProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(false);
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

  useEffect(() => {
    fetchProfileData();
  }, []);

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

          // Fetch property details if propertyId exists
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

  const handleSave = async () => {
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

  const handleCancel = () => {
    setEditing(false);
    setEditData({});
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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
      p: { xs: 2, sm: 3 },
      bgcolor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          fontWeight="bold"
          sx={{ color: darkMode ? '#fff' : 'text.primary' }}
        >
          Profile Settings
        </Typography>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={toggleDarkMode} sx={{ color: darkMode ? '#fff' : 'inherit' }}>
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          {!editing && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEditClick}
              sx={{
                bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                '&:hover': {
                  bgcolor: darkMode ? 'primary.main' : 'primary.dark'
                }
              }}
            >
              Edit Profile
            </Button>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: darkMode ? '#252525' : '#fff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Box sx={{ 
                textAlign: 'center', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar
                  src={profileData.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: 3,
                    borderColor: darkMode ? 'primary.dark' : 'primary.main'
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  id="photo-upload"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: '45%',
                      right: '35%',
                      bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: darkMode ? 'primary.main' : 'primary.dark'
                      }
                    }}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? <CircularProgress size={24} /> : <PhotoCamera />}
                  </IconButton>
                </label>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {profileData.name}
                  </Typography>
                  <Chip
                    icon={<Verified />}
                    label={profileData.verificationStatus}
                    color="success"
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    justifyContent: 'center'
                  }}>
                    <Badge sx={{ color: darkMode ? '#aaa' : 'text.secondary' }} />
                    <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }}>
                      Tenant ID: {auth.currentUser?.uid.substring(0, 8)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    justifyContent: 'center'
                  }}>
                    <CalendarToday sx={{ color: darkMode ? '#aaa' : 'text.secondary' }} />
                    <Typography sx={{ color: darkMode ? '#aaa' : 'text.secondary' }}>
                      Joined {format(profileData.joinDate, 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            bgcolor: darkMode ? '#252525' : '#fff',
            color: darkMode ? '#fff' : 'text.primary'
          }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={editing ? editData.name : profileData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={editing ? editData.phone : profileData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={editing ? editData.email : profileData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                {/* Property Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Property Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Property Name"
                        value={editing ? editData.property?.name : profileData.property?.name}
                        onChange={(e) => setEditData({
                          ...editData,
                          property: { ...editData.property, name: e.target.value }
                        })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Unit Number"
                        value={editing ? editData.property?.unit : profileData.property?.unit}
                        onChange={(e) => setEditData({
                          ...editData,
                          property: { ...editData.property, unit: e.target.value }
                        })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                {/* Emergency Contact */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Emergency Contact
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact Name"
                        value={editing ? editData.emergencyContact?.name : profileData.emergencyContact?.name}
                        onChange={(e) => setEditData({
                          ...editData,
                          emergencyContact: { ...editData.emergencyContact, name: e.target.value }
                        })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact Phone"
                        value={editing ? editData.emergencyContact?.phone : profileData.emergencyContact?.phone}
                        onChange={(e) => setEditData({
                          ...editData,
                          emergencyContact: { ...editData.emergencyContact, phone: e.target.value }
                        })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Relationship"
                        value={editing ? editData.emergencyContact?.relationship : profileData.emergencyContact?.relationship}
                        onChange={(e) => setEditData({
                          ...editData,
                          emergencyContact: { ...editData.emergencyContact, relationship: e.target.value }
                        })}
                        disabled={!editing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: darkMode ? '#555' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: darkMode ? '#666' : undefined,
                            },
                            '& input': {
                              color: darkMode ? '#fff' : undefined,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: darkMode ? '#aaa' : undefined,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {editing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{
                      borderColor: darkMode ? '#555' : undefined,
                      color: darkMode ? '#fff' : undefined,
                      '&:hover': {
                        borderColor: darkMode ? '#666' : undefined,
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : undefined
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{
                      bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                      '&:hover': {
                        bgcolor: darkMode ? 'primary.main' : 'primary.dark'
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
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

