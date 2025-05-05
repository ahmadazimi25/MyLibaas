import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showLocation: true,
      showActivity: true,
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
    },
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }));
  };

  const handlePrivacyChange = (event) => {
    const { name, checked, value } = event.target;
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [name]: event.target.type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handlePreferenceChange = (event) => {
    const { name, value } = event.target;
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value,
      },
    }));
  };

  const handlePasswordChange = async () => {
    try {
      // TODO: Implement password change logic
      setNotification({
        open: true,
        message: 'Password updated successfully',
        severity: 'success',
      });
      setPasswordDialog(false);
    } catch (error) {
      setNotification({
        open: true,
        message: error.message,
        severity: 'error',
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement settings save logic
      setNotification({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to save settings',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
      </Box>

      {/* Notifications Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Notification Preferences</Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemText primary="Email Notifications" />
            <ListItemSecondaryAction>
              <Switch
                name="email"
                checked={settings.notifications.email}
                onChange={handleNotificationChange}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary="Push Notifications" />
            <ListItemSecondaryAction>
              <Switch
                name="push"
                checked={settings.notifications.push}
                onChange={handleNotificationChange}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary="SMS Notifications" />
            <ListItemSecondaryAction>
              <Switch
                name="sms"
                checked={settings.notifications.sms}
                onChange={handleNotificationChange}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary="Marketing Communications" />
            <ListItemSecondaryAction>
              <Switch
                name="marketing"
                checked={settings.notifications.marketing}
                onChange={handleNotificationChange}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Privacy Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Privacy & Security</Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemText primary="Profile Visibility" />
            <ListItemSecondaryAction>
              <Select
                name="profileVisibility"
                value={settings.privacy.profileVisibility}
                onChange={handlePrivacyChange}
                size="small"
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="friends">Friends Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary="Show Location" />
            <ListItemSecondaryAction>
              <Switch
                name="showLocation"
                checked={settings.privacy.showLocation}
                onChange={handlePrivacyChange}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary="Show Activity Status" />
            <ListItemSecondaryAction>
              <Switch
                name="showActivity"
                checked={settings.privacy.showActivity}
                onChange={handlePrivacyChange}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setPasswordDialog(true)}
          >
            Change Password
          </Button>
        </Box>
      </Paper>

      {/* Preferences Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LanguageIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Preferences</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                name="language"
                value={settings.preferences.language}
                onChange={handlePreferenceChange}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                name="currency"
                value={settings.preferences.currency}
                onChange={handlePreferenceChange}
                label="Currency"
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="CAD">CAD ($)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                name="timezone"
                value={settings.preferences.timezone}
                onChange={handlePreferenceChange}
                label="Timezone"
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="GMT">GMT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 3, mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          size="large"
        >
          Save All Settings
        </Button>
      </Box>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
            />
            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained" color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
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

export default Settings;
