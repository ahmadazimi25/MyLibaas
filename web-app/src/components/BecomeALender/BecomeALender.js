import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MonetizationOn,
  Security,
  People,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BecomeALender = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const benefits = [
    {
      title: 'Earn Extra Income',
      description: 'Turn your closet into cash. Earn money from clothes you don\'t wear every day.',
      icon: <MonetizationOn color="primary" />,
    },
    {
      title: 'Secure Transactions',
      description: 'Protected payments and secure handling of your items with insurance coverage.',
      icon: <Security color="primary" />,
    },
    {
      title: 'Flexible Schedule',
      description: 'You control when your items are available for rent.',
      icon: <Schedule color="primary" />,
    },
    {
      title: 'Growing Community',
      description: 'Join a community of fashion enthusiasts and sustainable consumers.',
      icon: <People color="primary" />,
    },
  ];

  const howItWorks = [
    'List your clothes and set your rental price',
    'Accept booking requests from verified renters',
    'Hand over items and receive secure payment',
    'Get your items back and earn money',
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/create-listing');
    } else {
      navigate('/signup');
    }
  };

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 3,
              fontFamily: "'DM Serif Display', serif",
              color: 'primary.main',
            }}
          >
            Share Your Style, Earn Money
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Join MyLibaas and turn your wardrobe into a source of income
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{ px: 4, py: 1.5 }}
          >
            {user ? 'Create Your First Listing' : 'Get Started'}
          </Button>
        </Box>

        {/* Benefits Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {benefits.map((benefit) => (
            <Grid item xs={12} sm={6} md={3} key={benefit.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
                elevation={0}
                variant="outlined"
              >
                <Box sx={{ p: 2 }}>{benefit.icon}</Box>
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h2">
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* How It Works Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              mb: 4,
              textAlign: 'center',
              fontFamily: "'DM Serif Display', serif",
            }}
          >
            How It Works
          </Typography>
          <List>
            {howItWorks.map((step, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {`Step ${index + 1}: ${step}`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'primary.light',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
            Ready to Start Earning?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Join MyLibaas today and start sharing your style with others while earning money.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{ px: 4, py: 1.5 }}
          >
            {user ? 'Create Your First Listing' : 'Sign Up Now'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default BecomeALender;
