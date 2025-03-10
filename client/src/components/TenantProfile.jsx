// src/components/TenantProfile.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import TenantNavigation from './TenantNavigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Adjust the path as needed

const TenantProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch the tenant's profile from Firestore on mount.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            // If no document exists, initialize with empty fields.
            setProfile({
              name: '',
              email: '',
              phone: '',
              emergencyContact: '',
              leaseDocument: ''
            });
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
        console.log('Profile saved', profile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!profile) {
    return <Typography>No profile data available.</Typography>;
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <TenantNavigation />
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
        />
        <TextField
          label="Email"
          fullWidth
          value={profile.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        <TextField
          label="Phone"
          fullWidth
          value={profile.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        <TextField
          label="Emergency Contact"
          fullWidth
          value={profile.emergencyContact || ''}
          onChange={(e) => handleChange('emergencyContact', e.target.value)}
        />
        {profile.leaseDocument && (
          <Typography variant="body2">
            Lease Document: {profile.leaseDocument}
          </Typography>
        )}
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default TenantProfile;

