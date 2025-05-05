import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Timeline,
  People
} from '@mui/icons-material';
import EmergencyResponseService from '../../services/infrastructure/EmergencyResponseService';

const EmergencyStatus = ({ detailed = false }) => {
  const [status, setStatus] = useState({
    activeIncidents: [],
    responseTeams: [],
    systemStatus: 'normal', // normal, warning, critical
    recentResolutions: []
  });

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadEmergencyStatus();
    const interval = setInterval(loadEmergencyStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadEmergencyStatus = async () => {
    try {
      const [
        incidents,
        teams,
        resolutions
      ] = await Promise.all([
        EmergencyResponseService.getActiveIncidents(),
        EmergencyResponseService.getResponseTeams(),
        EmergencyResponseService.getRecentResolutions()
      ]);

      setStatus({
        activeIncidents: incidents,
        responseTeams: teams,
        systemStatus: determineSystemStatus(incidents),
        recentResolutions: resolutions
      });
    } catch (error) {
      console.error('Failed to load emergency status:', error);
    }
  };

  const determineSystemStatus = (incidents) => {
    if (!incidents.length) return 'normal';
    if (incidents.some(i => i.severity === 'critical')) return 'critical';
    if (incidents.some(i => i.severity === 'high')) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status) => {
    const colors = {
      normal: 'success',
      warning: 'warning',
      critical: 'error'
    };
    return colors[status] || 'default';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <Warning color="error" />;
      case 'medium':
        return <Warning color="warning" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setDialogOpen(true);
  };

  const renderOverview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Emergency Status
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getSeverityIcon(status.systemStatus)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  System Status: {status.systemStatus.toUpperCase()}
                </Typography>
              </Box>

              {status.activeIncidents.length > 0 ? (
                <List>
                  {status.activeIncidents.slice(0, 3).map((incident) => (
                    <ListItem
                      key={incident.id}
                      button
                      onClick={() => handleIncidentClick(incident)}
                    >
                      <ListItemIcon>
                        {getSeverityIcon(incident.severity)}
                      </ListItemIcon>
                      <ListItemText
                        primary={incident.type}
                        secondary={incident.description}
                      />
                      <Chip
                        label={incident.severity}
                        color={getStatusColor(incident.severity)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="success.main">
                  No active incidents
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderDetailed = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Incidents
            </Typography>
            <List>
              {status.activeIncidents.map((incident) => (
                <ListItem
                  key={incident.id}
                  button
                  onClick={() => handleIncidentClick(incident)}
                >
                  <ListItemIcon>
                    {getSeverityIcon(incident.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={incident.type}
                    secondary={
                      <>
                        {incident.description}
                        <br />
                        Reported: {new Date(incident.createdAt).toLocaleString()}
                      </>
                    }
                  />
                  <Box>
                    <Chip
                      label={incident.severity}
                      color={getStatusColor(incident.severity)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={incident.status}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Response Teams
            </Typography>
            <List>
              {status.responseTeams.map((team) => (
                <ListItem key={team.name}>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText
                    primary={team.name}
                    secondary={`${team.oncall.length} members on call`}
                  />
                  <Chip
                    label={team.status}
                    color={team.status === 'available' ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Resolutions
            </Typography>
            <List>
              {status.recentResolutions.map((resolution) => (
                <ListItem key={resolution.id}>
                  <ListItemIcon>
                    <Timeline />
                  </ListItemIcon>
                  <ListItemText
                    primary={resolution.type}
                    secondary={
                      <>
                        {resolution.summary}
                        <br />
                        Resolved: {new Date(resolution.resolvedAt).toLocaleString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderIncidentDialog = () => (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      {selectedIncident && (
        <>
          <DialogTitle>
            Incident Details: {selectedIncident.id}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {selectedIncident.type}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {selectedIncident.description}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={selectedIncident.status}
                  color={getStatusColor(selectedIncident.severity)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Severity</Typography>
                <Chip
                  label={selectedIncident.severity}
                  color={getStatusColor(selectedIncident.severity)}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Timeline
                </Typography>
                <List>
                  {selectedIncident.timeline?.map((event, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={event.action}
                        secondary={new Date(event.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return (
    <>
      {detailed ? renderDetailed() : renderOverview()}
      {renderIncidentDialog()}
    </>
  );
};

export default EmergencyStatus;
