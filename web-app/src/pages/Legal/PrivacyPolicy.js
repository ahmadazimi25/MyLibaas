import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Information We Collect
          </Typography>
          <Typography paragraph>
            We collect information that you provide directly to us, including:
            • Personal information (name, email, phone number)
            • Address and location data
            • Payment information
            • Identity verification documents
            • Communication preferences
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. How We Use Your Information
          </Typography>
          <Typography paragraph>
            • Process your rentals and transactions
            • Verify your identity
            • Provide customer support
            • Send important updates
            • Improve our services
            • Prevent fraud
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Information Sharing
          </Typography>
          <Typography paragraph>
            We share your information with:
            • Other users as needed for rentals
            • Payment processors
            • Shipping providers
            • Legal authorities when required
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Data Security
          </Typography>
          <Typography paragraph>
            We implement appropriate security measures to protect your personal information.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Your Rights
          </Typography>
          <Typography paragraph>
            You have the right to:
            • Access your data
            • Correct inaccurate data
            • Request deletion
            • Opt-out of marketing
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Contact Us
          </Typography>
          <Typography paragraph>
            For privacy-related questions, contact us at:
            privacy@mylibaas.ca
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
