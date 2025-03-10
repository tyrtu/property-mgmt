import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Adjust the path as needed

const TenantProfile = () => {
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            setOriginalProfile(data);
          } else {
            const emptyProfile = {
              name: '',
              email: '',
              phone: '',
              emergencyContact: '',
              leaseDocument: ''
            };
            setProfile(emptyProfile);
            setOriginalProfile(emptyProfile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (user && profile) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, profile);
        setOriginalProfile(profile);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const hasProfileChanged = () => {
    if (!profile || !originalProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(originalProfile);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!profile) {
    return <Typography>No profile data available.</Typography>;
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Profile
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
        <Avatar sx={{ width: 80, height: 80 }}>
          {profile.name ? profile.name[0] : '?'}
        </Avatar>
        <TextField
          label="Name"
          fullWidth
          value={profile.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={!isEditing}
        />
        <TextField
          label="Email"
          fullWidth
          value={profile.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={!isEditing}
        />
        <TextField
          label="Phone"
          fullWidth
          value={profile.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          disabled={!isEditing}
        />
        <TextField
          label="Emergency Contact"
          fullWidth
          value={profile.emergencyContact || ''}
          onChange={(e) => handleChange('emergencyContact', e.target.value)}
          disabled={!isEditing}
        />
        {profile.leaseDocument && (
          <Typography variant="body2">
            Lease Document: {profile.leaseDocument}
          </Typography>
        )}
        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving || !hasProfileChanged()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
          </Box>
        ) : (
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
        {successMessage && (
          <Typography variant="body2" color="success.main">
            {successMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TenantProfile;

