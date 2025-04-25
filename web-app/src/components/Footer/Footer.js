import React from 'react';
import { Box, Container, Grid, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              MyLibaas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your Trusted Fashion Rental Marketplace
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Box>
              <Link component={RouterLink} to="/privacy-policy" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Terms of Service
              </Link>
              <Link component={RouterLink} to="/rental-agreement" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Rental Agreement
              </Link>
              <Link component={RouterLink} to="/return-policy" color="text.secondary" display="block">
                Return Policy
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@mylibaas.ca
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: (XXX) XXX-XXXX
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} MyLibaas. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
