import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Avatar,
  Stack,
  Typography,
  Paper,
  IconButton
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

const ProfileForm = ({ user, onSubmit, onPhotoChange }) => {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file && onPhotoChange) {
      onPhotoChange(file);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          {/* Profile Photo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.photoURL}
                alt={formData.displayName}
                sx={{ width: 120, height: 120 }}
              />
              <IconButton
                color="primary"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'background.paper' }
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handlePhotoSelect}
                />
                <PhotoCameraIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Click the camera icon to change profile photo
            </Typography>
          </Box>

          {/* Profile Information */}
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others about yourself..."
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ alignSelf: 'flex-start' }}
          >
            Save Changes
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default ProfileForm;
