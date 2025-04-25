import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By accessing or using MyLibaas, you agree to these terms. If you disagree with any part, you may not use our service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Platform Overview
          </Typography>
          <Typography paragraph>
            MyLibaas is a peer-to-peer clothing rental platform. We facilitate connections between lenders and renters but are not responsible for the items rented.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. User Responsibilities
          </Typography>
          <Typography paragraph>
            As a user, you must:
            • Provide accurate information
            • Maintain account security
            • Follow rental agreements
            • Handle items with care
            • Report issues promptly
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Rental Process
          </Typography>
          <Typography paragraph>
            • Bookings are subject to lender approval
            • 20% platform fee applies to all rentals
            • Shipping is arranged between parties
            • Security deposits may be required
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Payments and Fees
          </Typography>
          <Typography paragraph>
            • Platform fee: 20% of rental amount
            • Payment processing through Stripe
            • Refunds subject to cancellation policy
            • Damage claims must be reported within 24 hours
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Prohibited Items
          </Typography>
          <Typography paragraph>
            • Counterfeit items
            • Damaged clothing
            • Unhygienic items
            • Restricted materials
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Dispute Resolution
          </Typography>
          <Typography paragraph>
            Disputes will be handled through our platform's resolution process. Legal action should be a last resort.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Contact Information
          </Typography>
          <Typography paragraph>
            For questions about these terms, contact:
            legal@mylibaas.ca
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;
