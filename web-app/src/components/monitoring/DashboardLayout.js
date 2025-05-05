import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import SecurityMetrics from './SecurityMetrics';
import PerformanceMetrics from './PerformanceMetrics';
import AccessibilityMetrics from './AccessibilityMetrics';
import EmergencyStatus from './EmergencyStatus';
import SystemHealth from './SystemHealth';

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load data based on active tab
      // Data loading logic here
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading dashboard: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Monitoring Dashboard
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Security" />
        <Tab label="Performance" />
        <Tab label="Accessibility" />
        <Tab label="Emergency" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {activeTab === 0 && (
            <>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <SystemHealth />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <EmergencyStatus />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <SecurityMetrics />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <PerformanceMetrics />
                </Paper>
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <SecurityMetrics detailed />
              </Paper>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <PerformanceMetrics detailed />
              </Paper>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <AccessibilityMetrics detailed />
              </Paper>
            </Grid>
          )}

          {activeTab === 4 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <EmergencyStatus detailed />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default DashboardLayout;
