import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { VerificationService } from '../../services/security/VerificationService';
import { FraudPreventionService } from '../../services/security/FraudPreventionService';

const SecurityMetrics = ({ detailed = false }) => {
  const [metrics, setMetrics] = useState({
    verificationRate: 0,
    fraudScore: 0,
    activeThreats: [],
    recentIncidents: [],
    systemHealth: {
      score: 0,
      issues: []
    }
  });

  useEffect(() => {
    loadSecurityMetrics();
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      const [
        verificationStats,
        fraudStats,
        threatStats,
        incidentStats,
        healthStats
      ] = await Promise.all([
        VerificationService.getVerificationStats(),
        FraudPreventionService.getFraudStats(),
        FraudPreventionService.getActiveThreats(),
        FraudPreventionService.getRecentIncidents(),
        getSystemHealthStats()
      ]);

      setMetrics({
        verificationRate: verificationStats.rate,
        fraudScore: fraudStats.score,
        activeThreats: threatStats,
        recentIncidents: incidentStats,
        systemHealth: healthStats
      });
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    }
  };

  const getSystemHealthStats = async () => {
    // Implement system health check logic
    return {
      score: 85,
      issues: [
        {
          id: 1,
          severity: 'medium',
          description: 'SSL certificate expiring in 30 days'
        }
      ]
    };
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };

  const renderOverview = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Security color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4">
                {metrics.systemHealth.score}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.systemHealth.score}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Threats
            </Typography>
            <List>
              {metrics.activeThreats.slice(0, 3).map((threat) => (
                <ListItem key={threat.id}>
                  <ListItemIcon>
                    <Warning color={getSeverityColor(threat.severity)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={threat.type}
                    secondary={threat.description}
                  />
                  <Chip
                    label={threat.severity}
                    color={getSeverityColor(threat.severity)}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDetailed = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health Details
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(metrics.systemHealth.components || {}).map(([component, status]) => (
                <Grid item xs={12} md={4} key={component}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {status.healthy ? (
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                    ) : (
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography>
                      {component}: {status.healthy ? 'Healthy' : 'Issues Detected'}
                    </Typography>
                  </Box>
                  {status.issues?.map((issue) => (
                    <Typography
                      key={issue.id}
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 4 }}
                    >
                      • {issue.description}
                    </Typography>
                  ))}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Verification Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Verification Rate"
                  secondary={`${metrics.verificationRate}%`}
                />
                <LinearProgress
                  variant="determinate"
                  value={metrics.verificationRate}
                  sx={{ width: 100 }}
                />
              </ListItem>
              {/* Add more verification stats */}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fraud Prevention
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Fraud Score"
                  secondary={`${metrics.fraudScore}% Safe`}
                />
                <LinearProgress
                  variant="determinate"
                  value={metrics.fraudScore}
                  sx={{ width: 100 }}
                />
              </ListItem>
              {/* Add more fraud prevention stats */}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Security Incidents
            </Typography>
            <List>
              {metrics.recentIncidents.map((incident) => (
                <ListItem key={incident.id}>
                  <ListItemIcon>
                    <Warning color={getSeverityColor(incident.severity)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={incident.type}
                    secondary={`${incident.description} - ${new Date(incident.timestamp).toLocaleString()}`}
                  />
                  <Chip
                    label={incident.status}
                    color={incident.status === 'resolved' ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return detailed ? renderDetailed() : renderOverview();
};

export default SecurityMetrics;
