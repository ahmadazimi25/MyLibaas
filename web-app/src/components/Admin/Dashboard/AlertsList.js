import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const AlertsList = ({ alerts, onAcknowledge }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <ErrorIcon color="error" />;
      case 'WARNING':
        return <WarningIcon color="warning" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'WARNING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (details) => {
    if (!details || !details.percentage) return '';
    return `${details.percentage.toFixed(1)}%`;
  };

  if (alerts.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No active alerts
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {alerts.map((alert, index) => (
        <React.Fragment key={alert.id}>
          {index > 0 && <Divider />}
          <ListItem>
            <Box sx={{ mr: 1 }}>
              {getSeverityIcon(alert.severity)}
            </Box>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">
                    {alert.message}
                  </Typography>
                  <Chip
                    label={formatPercentage(alert.details)}
                    color={getSeverityColor(alert.severity)}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(alert.timestamp)}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                size="small"
                onClick={() => onAcknowledge(alert.id)}
                title="Acknowledge"
              >
                <CheckIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

export default AlertsList;
