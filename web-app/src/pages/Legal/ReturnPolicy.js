import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const ReturnPolicy = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Return Policy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Return Process
          </Typography>
          <Typography paragraph>
            • Use provided return label
            • Package securely
            • Ship within return window
            • Include all original items
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Return Timeline
          </Typography>
          <Typography paragraph>
            • Returns must be initiated by rental end date
            • Late returns incur daily fees
            • Extension requests must be made 24 hours before due
            • Tracking must be provided
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Item Condition
          </Typography>
          <Typography paragraph>
            Items must be returned:
            • Clean and unwashed
            • Free of strong odors
            • Without new damage
            • With all original packaging
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Late Returns
          </Typography>
          <Typography paragraph>
            • $20/day late fee
            • Maximum 5 days late
            • After 5 days, item considered lost
            • Full price charges apply
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Damage Assessment
          </Typography>
          <Typography paragraph>
            • Photos taken before return
            • Damage reported within 24 hours
            • Fair wear accepted
            • Major damage charged
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Lost Items
          </Typography>
          <Typography paragraph>
            • Report lost items immediately
            • Full price charged after 5 days
            • Insurance claims processed
            • Tracking investigation
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Refund Process
          </Typography>
          <Typography paragraph>
            • Security deposit returned after inspection
            • Processing time: 3-5 business days
            • Damage charges deducted
            • Dispute window: 48 hours
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Contact Information
          </Typography>
          <Typography paragraph>
            For return questions:
            returns@mylibaas.ca
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReturnPolicy;
