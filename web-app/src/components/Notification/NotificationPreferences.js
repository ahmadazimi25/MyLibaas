import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as PushIcon,
  Sms as SmsIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import EmailPreview from '../Email/EmailPreview';

const frequencyOptions = {
  email: [
    { value: 'instant', label: 'Instant' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Digest' },
  ],
  push: [
    { value: 'instant', label: 'Instant' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'off', label: 'Off' },
  ],
  sms: [
    { value: 'instant', label: 'Instant' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'off', label: 'Off' },
  ],
};

const notificationTypes = [
  {
    id: 'disputes',
    title: 'Disputes',
    description: 'Updates about dispute cases and resolutions',
    defaultChannels: {
      email: { enabled: true, frequency: 'instant' },
      push: { enabled: true, frequency: 'instant' },
      sms: { enabled: false, frequency: 'off' },
    },
  },
  {
    id: 'damages',
    title: 'Damage Reports',
    description: 'Notifications about damage reports and assessments',
    defaultChannels: {
      email: { enabled: true, frequency: 'instant' },
      push: { enabled: true, frequency: 'instant' },
      sms: { enabled: false, frequency: 'off' },
    },
  },
  {
    id: 'verification',
    title: 'ID Verification',
    description: 'Updates about your verification status',
    defaultChannels: {
      email: { enabled: true, frequency: 'instant' },
      push: { enabled: false, frequency: 'off' },
      sms: { enabled: false, frequency: 'off' },
    },
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Payment confirmations and refund updates',
    defaultChannels: {
      email: { enabled: true, frequency: 'instant' },
      push: { enabled: false, frequency: 'off' },
      sms: { enabled: true, frequency: 'instant' },
    },
  },
  {
    id: 'bookings',
    title: 'Bookings',
    description: 'Booking confirmations and reminders',
    defaultChannels: {
      email: { enabled: true, frequency: 'instant' },
      push: { enabled: true, frequency: 'instant' },
      sms: { enabled: true, frequency: 'instant' },
    },
  },
  {
    id: 'messages',
    title: 'Messages',
    description: 'New messages from other users',
    defaultChannels: {
      email: { enabled: true, frequency: 'daily' },
      push: { enabled: true, frequency: 'instant' },
      sms: { enabled: false, frequency: 'off' },
    },
  },
];

const NotificationTypeCard = ({
  type,
  preferences,
  onChannelToggle,
  onFrequencyChange,
  loading,
  onPreviewEmail,
}) => {
  const { id, title, description } = type;

  const renderChannelControl = (channel, icon, label) => (
    <Grid item xs={12} sm={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences[id]?.[channel]?.enabled ?? false}
              onChange={() => onChannelToggle(id, channel)}
              disabled={loading}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon}
              <Typography sx={{ ml: 1 }}>{label}</Typography>
            </Box>
          }
        />
        {preferences[id]?.[channel]?.enabled && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={preferences[id]?.[channel]?.frequency ?? 'instant'}
              onChange={(e) => onFrequencyChange(id, channel, e.target.value)}
              disabled={loading}
            >
              {frequencyOptions[channel].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </Grid>
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <div>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </div>
          {onPreviewEmail && (
            <Tooltip title="Preview Email Templates">
              <IconButton onClick={() => onPreviewEmail(id)} size="small">
                <PreviewIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <FormGroup>
          <Grid container spacing={2}>
            {renderChannelControl('email', <EmailIcon />, 'Email')}
            {renderChannelControl('push', <PushIcon />, 'Push')}
            {renderChannelControl('sms', <SmsIcon />, 'SMS')}
          </Grid>
        </FormGroup>
      </CardContent>
    </Card>
  );
};

const NotificationPreferences = () => {
  const { updateNotificationPreferences } = useNotification();
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Initialize with default preferences
      const defaultPrefs = {};
      notificationTypes.forEach((type) => {
        defaultPrefs[type.id] = type.defaultChannels;
      });
      
      setPreferences(defaultPrefs);
    } catch (err) {
      setError('Failed to load preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (typeId, channel) => {
    setPreferences((prev) => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [channel]: {
          ...prev[typeId][channel],
          enabled: !prev[typeId][channel].enabled,
        },
      },
    }));
  };

  const handleFrequencyChange = (typeId, channel, frequency) => {
    setPreferences((prev) => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [channel]: {
          ...prev[typeId][channel],
          frequency,
        },
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus(null);
    setError(null);

    try {
      await updateNotificationPreferences({
        userId: 'current',
        preferences,
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && Object.keys(preferences).length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Notification Preferences
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Choose how and when you want to receive notifications for different activities.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Preferences saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {notificationTypes.map((type) => (
          <Grid item xs={12} key={type.id}>
            <NotificationTypeCard
              type={type}
              preferences={preferences}
              onChannelToggle={handleChannelToggle}
              onFrequencyChange={handleFrequencyChange}
              loading={loading}
              onPreviewEmail={() => setPreviewOpen(true)}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
        </Button>
      </Box>

      <EmailPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </Paper>
  );
};

export default NotificationPreferences;
