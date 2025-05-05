import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Schedule as ScheduleIcon, Email as EmailIcon } from '@mui/icons-material';
import ReportService from '../../../services/ReportService';
import NotificationService from '../../../services/NotificationService';

const ReportScheduler = () => {
  const [schedule, setSchedule] = useState({
    type: '',
    frequency: 'daily',
    time: new Date(),
    recipients: [],
    customRange: {
      start: null,
      end: null
    }
  });
  const [newRecipient, setNewRecipient] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleScheduleReport = async () => {
    try {
      setError(null);
      
      // Create cron expression based on frequency
      const cronExpression = generateCronExpression(schedule.frequency, schedule.time);
      
      // Schedule the report
      const scheduleId = await NotificationService.scheduleReport(
        schedule.type,
        cronExpression,
        schedule.recipients
      );
      
      // Generate initial report
      const reportUrl = await ReportService.generateReport(schedule.type, {
        sendEmail: true
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      
      // Reset form
      setSchedule({
        type: '',
        frequency: 'daily',
        time: new Date(),
        recipients: [],
        customRange: {
          start: null,
          end: null
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const generateCronExpression = (frequency, time) => {
    const minutes = time.getMinutes();
    const hours = time.getHours();
    
    switch (frequency) {
      case 'daily':
        return `${minutes} ${hours} * * *`;
      case 'weekly':
        return `${minutes} ${hours} * * 1`; // Monday
      case 'monthly':
        return `${minutes} ${hours} 1 * *`; // 1st of month
      default:
        return `${minutes} ${hours} * * *`;
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient && !schedule.recipients.includes(newRecipient)) {
      setSchedule({
        ...schedule,
        recipients: [...schedule.recipients, newRecipient]
      });
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email) => {
    setSchedule({
      ...schedule,
      recipients: schedule.recipients.filter(r => r !== email)
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Schedule Reports
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Report scheduled successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={schedule.type}
                label="Report Type"
                onChange={(e) => setSchedule({ ...schedule, type: e.target.value })}
              >
                <MenuItem value="performance">Performance Report</MenuItem>
                <MenuItem value="financial">Financial Report</MenuItem>
                <MenuItem value="user">User Activity Report</MenuItem>
                <MenuItem value="listing">Listing Report</MenuItem>
                <MenuItem value="dispute">Dispute Report</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={schedule.frequency}
                label="Frequency"
                onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Schedule Time"
              value={schedule.time}
              onChange={(newTime) => setSchedule({ ...schedule, time: newTime })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          {schedule.frequency === 'custom' && (
            <>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Date"
                  value={schedule.customRange.start}
                  onChange={(date) => setSchedule({
                    ...schedule,
                    customRange: { ...schedule.customRange, start: date }
                  })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Date"
                  value={schedule.customRange.end}
                  onChange={(date) => setSchedule({
                    ...schedule,
                    customRange: { ...schedule.customRange, end: date }
                  })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TextField
                fullWidth
                label="Add Recipient Email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecipient();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddRecipient}
                startIcon={<EmailIcon />}
              >
                Add
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              {schedule.recipients.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() => handleRemoveRecipient(email)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ScheduleIcon />}
              onClick={handleScheduleReport}
              disabled={!schedule.type || schedule.recipients.length === 0}
              fullWidth
            >
              Schedule Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReportScheduler;
