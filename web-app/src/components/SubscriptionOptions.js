import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Check } from '@mui/icons-material';

const plans = [
  {
    title: 'Pay Per Use',
    price: '0',
    features: [
      'No monthly commitment',
      'Standard delivery rates',
      'Regular customer support',
      'Basic insurance coverage',
      'Pay only for what you rent'
    ],
    buttonText: 'Continue with Pay Per Use',
    recommended: false
  },
  {
    title: 'Premium Monthly',
    price: '29.99',
    features: [
      'Unlimited rentals per month',
      'Free premium delivery',
      'Priority customer support',
      'Enhanced insurance coverage',
      'Early access to new items',
      'Member-only discounts'
    ],
    buttonText: 'Start Premium Subscription',
    recommended: true
  },
  {
    title: 'Annual VIP',
    price: '249.99',
    features: [
      'All Premium features',
      'Two months free',
      'VIP concierge service',
      'Full insurance coverage',
      'Exclusive VIP events',
      'Personal stylist consultation'
    ],
    buttonText: 'Become a VIP Member',
    recommended: false
  }
];

const SubscriptionOptions = ({ onSelect }) => {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontFamily: "'DM Serif Display', serif" }}>
        Choose Your Plan
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 6 }}>
        Select the perfect plan for your clothing rental needs
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transform: plan.recommended ? 'scale(1.05)' : 'none',
                border: plan.recommended ? '2px solid' : '1px solid',
                borderColor: plan.recommended ? 'primary.main' : 'secondary.main',
                '&:hover': {
                  transform: plan.recommended ? 'scale(1.07)' : 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                }
              }}
            >
              {plan.recommended && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: -32,
                    transform: 'rotate(45deg)',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 4,
                    py: 0.5,
                  }}
                >
                  Recommended
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ fontFamily: "'DM Serif Display', serif" }}>
                  {plan.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                  <Typography component="span" variant="h4" color="primary.main">
                    ${plan.price}
                  </Typography>
                  {plan.price !== '0' && (
                    <Typography component="span" variant="subtitle1" color="text.secondary">
                      /month
                    </Typography>
                  )}
                </Box>
                <List sx={{ mb: 2 }}>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Check color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    fullWidth
                    variant={plan.recommended ? 'contained' : 'outlined'}
                    onClick={() => onSelect(plan)}
                    sx={{ mt: 2 }}
                  >
                    {plan.buttonText}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SubscriptionOptions;
