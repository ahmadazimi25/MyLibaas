import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const RentalAgreement = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rental Agreement
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Rental Terms
          </Typography>
          <Typography paragraph>
            • Rental period begins upon item receipt
            • Returns must be initiated by end date
            • Late returns incur daily fees
            • Damage protection included
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Renter Responsibilities
          </Typography>
          <Typography paragraph>
            As a renter, you agree to:
            • Use items as intended
            • Not alter or modify items
            • Return in original condition
            • Report damages immediately
            • Follow care instructions
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Lender Responsibilities
          </Typography>
          <Typography paragraph>
            As a lender, you agree to:
            • Provide accurate item descriptions
            • Ship items on time
            • Clean items before shipping
            • Disclose any defects
            • Maintain item quality
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Damage Protection
          </Typography>
          <Typography paragraph>
            • Minor wear covered
            • Major damage assessed case-by-case
            • Lost items charged at full value
            • Photo documentation required
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Cancellation Policy
          </Typography>
          <Typography paragraph>
            • Free cancellation 48 hours before
            • 50% refund within 48 hours
            • No refund after shipping
            • Exceptions for item issues
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Shipping
          </Typography>
          <Typography paragraph>
            • Items must be shipped within 24 hours
            • Tracking required
            • Insurance recommended
            • Return shipping included
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Dispute Resolution
          </Typography>
          <Typography paragraph>
            • Report issues within 24 hours
            • Photo evidence required
            • Platform mediation available
            • Fair resolution process
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Contact Information
          </Typography>
          <Typography paragraph>
            For rental agreement questions:
            rentals@mylibaas.ca
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RentalAgreement;
