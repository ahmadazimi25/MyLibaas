import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h3" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: May 5, 2025
        </Typography>
        <Typography variant="body1" paragraph>
          MyLibaas ("we" or "us" or "our") respects the privacy of our users ("user" or "you"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application.
        </Typography>
        <Typography variant="h5" gutterBottom>
          Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information that you provide directly to us when you:
          - Register for an account
          - Make a purchase
          - Contact us
          - Subscribe to our newsletter
        </Typography>
        <Typography variant="h5" gutterBottom>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information we collect to:
          - Process your orders
          - Send you order confirmations
          - Communicate with you about products and services
          - Improve our website and services
        </Typography>
        <Typography variant="h5" gutterBottom>
          Data Deletion
        </Typography>
        <Typography variant="body1" paragraph>
          You can request deletion of your personal data by contacting us at ahmadak-47@hotmail.com. We will process your request within 30 days.
        </Typography>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have questions about this Privacy Policy, please contact us at:
          ahmadak-47@hotmail.com
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
