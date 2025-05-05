import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Stack,
  IconButton,
  Chip
} from '@mui/material';
import {
  Storage as StorageIcon,
  Database as DatabaseIcon,
  Speed as SpeedIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import UsageMonitorService from '../../../services/UsageMonitorService';
import AlertService from '../../../services/AlertService';
import UsageChart from './UsageChart';
import AlertsList from './AlertsList';

const AdminDashboard = () => {
  const [usage, setUsage] = useState({
    storage: 0,
    databaseReads: 0,
    databaseWrites: 0,
    bandwidth: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get today's usage
      const today = new Date().toISOString().split('T')[0];
      const dailyUsage = await UsageMonitorService.getDailyUsage(today);
      
      // Get active alerts
      const activeAlerts = await AlertService.getActiveAlerts();
      
      setUsage(dailyUsage);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await AlertService.acknowledgeAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getUsagePercentage = (current, limit) => {
    return (current / limit) * 100;
  };

  const UsageCard = ({ title, current, limit, icon: Icon }) => {
    const percentage = getUsagePercentage(current, limit);
    const severity = percentage > 90 ? 'error' : percentage > 70 ? 'warning' : 'success';

    return (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Icon color={severity} />
            <Typography variant="h6">{title}</Typography>
          </Stack>
          
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            color={severity}
            sx={{ mb: 1, height: 8, borderRadius: 4 }}
          />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {current.toLocaleString()} / {limit.toLocaleString()}
            </Typography>
            <Chip 
              label={`${percentage.toFixed(1)}%`}
              color={severity}
              size="small"
            />
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Critical Alerts */}
      {alerts.filter(alert => alert.severity === 'CRITICAL').map(alert => (
        <Alert 
          severity="error" 
          key={alert.id}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => handleAcknowledgeAlert(alert.id)}
            >
              <CheckIcon />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      ))}

      {/* Usage Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <UsageCard
            title="Storage Usage"
            current={usage.storage || 0}
            limit={UsageMonitorService.DAILY_LIMITS.STORAGE_UPLOAD}
            icon={StorageIcon}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <UsageCard
            title="Database Reads"
            current={usage.databaseReads || 0}
            limit={UsageMonitorService.DAILY_LIMITS.DATABASE_READS}
            icon={DatabaseIcon}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <UsageCard
            title="Database Writes"
            current={usage.databaseWrites || 0}
            limit={UsageMonitorService.DAILY_LIMITS.DATABASE_WRITES}
            icon={DatabaseIcon}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <UsageCard
            title="Bandwidth"
            current={usage.bandwidth || 0}
            limit={UsageMonitorService.DAILY_LIMITS.BANDWIDTH}
            icon={SpeedIcon}
          />
        </Grid>
      </Grid>

      {/* Usage Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Usage Trends
            </Typography>
            <UsageChart usage={usage} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            <AlertsList 
              alerts={alerts} 
              onAcknowledge={handleAcknowledgeAlert} 
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
