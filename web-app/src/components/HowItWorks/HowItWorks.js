import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, Icon } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaidIcon from '@mui/icons-material/Paid';
import RecyclingIcon from '@mui/icons-material/Recycling';

const HowItWorks = () => {
  const steps = [
    {
      icon: <ShoppingBagIcon sx={{ fontSize: 40 }} />,
      title: 'Browse & Book',
      description: 'Find the perfect dress for your special event. Virtual try-on available to preview your look.'
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Receive & Wear',
      description: 'Get your dress delivered right to your door. Wear it for your event and feel amazing!'
    },
    {
      icon: <RecyclingIcon sx={{ fontSize: 40 }} />,
      title: 'Return & Review',
      description: 'Simply ship it back using our prepaid label. Share your experience with the community.'
    },
    {
      icon: <PaidIcon sx={{ fontSize: 40 }} />,
      title: 'List & Earn',
      description: 'Have dresses to share? List them and earn money from your wardrobe.'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          How It Works
        </Typography>

        {/* Main Description */}
        <Typography 
          variant="h5" 
          align="center" 
          sx={{ mb: 6, maxWidth: 800, mx: 'auto', color: 'text.secondary' }}
        >
          A peer-to-peer dress rental marketplace where fashion meets sustainability
        </Typography>

        {/* Process Steps */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  backgroundColor: 'transparent',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {step.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Benefits Section */}
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            💡 The Concept Behind It
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom color="primary">
                Save Money
              </Typography>
              <Typography variant="body1">
                Get access to beautiful outfits without the high cost of buying. Perfect for special events!
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom color="primary">
                Sustainable Fashion
              </Typography>
              <Typography variant="body1">
                Join the sustainable fashion movement. Reuse and rewear instead of letting clothing sit unused.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom color="primary">
                Earn From Your Closet
              </Typography>
              <Typography variant="body1">
                Transform your rarely worn pieces into passive income. Share your style with others!
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Features Highlight */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Platform Features
          </Typography>
          <Typography variant="body1" color="text.secondary">
            • Secure payments and booking system<br />
            • Virtual try-on technology<br />
            • Integrated shipping coordination<br />
            • Quality assurance and verification<br />
            • Insurance for peace of mind
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
