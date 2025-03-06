// src/components/TenantProfile.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import TenantNavigation from './TenantNavigation';

const TenantProfile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    emergencyContact: '987-654-3210',
    leaseDocument: 'Lease_Agreement.pdf'
  });

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = () => {
    // TODO: Save profile changes (e.g., call your API)
    console.log('Profile saved', profile);
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
      <TenantNavigation />
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Profile
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
        <Avatar sx={{ width: 80, height: 80 }}>{profile.name[0]}</Avatar>
        <TextField
          label="Name"
          fullWidth
          value={profile.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <TextField
          label="Email"
          fullWidth
          value={profile.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        <TextField
          label="Phone"
          fullWidth
          value={profile.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        <TextField
          label="Emergency Contact"
          fullWidth
          value={profile.emergencyContact}
          onChange={(e) => handleChange('emergencyContact', e.target.value)}
        />
        {profile.leaseDocument && (
          <Typography variant="body2">
            Lease Document: {profile.leaseDocument}
          </Typography>
        )}
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default TenantProfile;
