import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const CancellationPolicy = ({ policy }) => {
  const getRefundText = (percentage) => {
    if (percentage === 100) return 'Full refund';
    if (percentage === 0) return 'No refund';
    return `${percentage}% refund`;
  };

  const getTimeframeText = (hoursThreshold) => {
    if (hoursThreshold >= 72) {
      return `${hoursThreshold / 24} days before rental start`;
    }
    return `${hoursThreshold} hours before rental start`;
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cancellation Policy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {policy.name === 'flexible' && 'Easy cancellation with full refund options'}
          {policy.name === 'moderate' && 'Standard cancellation with partial refund options'}
          {policy.name === 'strict' && 'Limited cancellation with restricted refund options'}
        </Typography>
      </Box>

      <List sx={{ mb: 3 }}>
        {policy.rules.map((rule, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {rule.refundPercentage > 0 ? (
                  <CheckIcon color="success" />
                ) : (
                  <CancelIcon color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={getRefundText(rule.refundPercentage)}
                secondary={getTimeframeText(rule.hoursThreshold)}
              />
            </ListItem>
            {index < policy.rules.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>

      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Important Notes:
        </Typography>
        <List sx={{ 
          listStyleType: 'disc',
          pl: 2,
          '& .MuiListItem-root': {
            display: 'list-item',
            p: 0,
            mb: 0.5
          }
        }}>
          <ListItem>
            <Typography variant="body2">
              Cancellation time is calculated based on the rental start date
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              Service fees are non-refundable
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body2">
              All times are in your local timezone
            </Typography>
          </ListItem>
        </List>
      </Alert>
    </Paper>
  );
};

export default CancellationPolicy;
