import React from 'react';
import { Container, Typography, Box, Button, TextField, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const DataDeletion = () => {
  const { user } = useAuth();

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    // Send deletion request to your backend
    // For now, just show confirmation
    alert('Your data deletion request has been received. We will process it within 30 days.');
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Data Deletion Instructions
          </Typography>
          
          <Typography variant="body1" paragraph>
            MyLibaas takes your privacy seriously. You can request the deletion of your personal data in the following ways:
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="1. Through Your Account"
                secondary="Log in to your account, go to Settings > Privacy, and click 'Delete My Data'"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. Email Request"
                secondary="Send an email to ahmadak-47@hotmail.com with subject 'Data Deletion Request'"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. Submit Form Below"
                secondary="Fill out our data deletion request form"
              />
            </ListItem>
          </List>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Data Deletion Request Form
          </Typography>

          <Box component="form" onSubmit={handleSubmitRequest} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              defaultValue={user?.email || ''}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="User ID (if known)"
              defaultValue={user?.uid || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Reason (Optional)"
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Submit Deletion Request
            </Button>
          </Box>

          <Box mt={4}>
            <Typography variant="body2" color="text.secondary">
              Note: Once your data is deleted, this action cannot be undone. Your account and all associated data will be permanently removed from our systems within 30 days of your request.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              For Facebook-connected accounts: This process will remove all your data from MyLibaas, but will not affect your Facebook account or its settings.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              For immediate assistance with data deletion, please contact us at: ahmadak-47@hotmail.com
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DataDeletion;
