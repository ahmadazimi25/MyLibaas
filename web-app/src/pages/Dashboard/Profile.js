import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: '',
    location: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      language: 'en',
    }
  });
  const [imageUpload, setImageUpload] = useState(null);

  useEffect(() => {
    // Load user data from Firebase or your backend
    const loadUserData = async () => {
      // TODO: Implement loading user data
    };
    loadUserData();
  }, [user]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageUpload(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!imageUpload) return;

    try {
      setLoading(true);
      const imageRef = ref(storage, `profile-images/${user.uid}`);
      await uploadBytes(imageRef, imageUpload);
      const downloadURL = await getDownloadURL(imageRef);
      
      await updateUserProfile({
        photoURL: downloadURL
      });

      setNotification({
        open: true,
        message: 'Profile picture updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile picture',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: Implement save functionality
      await updateUserProfile({
        displayName: profileData.displayName
      });
      
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1">
            Profile
          </Typography>
          {!editMode ? (
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={() => setEditMode(true)}
              disabled={loading}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                startIcon={<CancelIcon />}
                variant="outlined"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={user?.photoURL}
                sx={{ width: 150, height: 150, mb: 2 }}
                alt={profileData.displayName}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="profile-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  disabled={loading}
                >
                  Change Photo
                </Button>
              </label>
              {imageUpload && (
                <Button
                  variant="contained"
                  onClick={handleUploadImage}
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  Upload Photo
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleChange}
                  disabled={!editMode || loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  disabled={true}
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleChange}
                  disabled={!editMode || loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  disabled={!editMode || loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  disabled={!editMode || loading}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
