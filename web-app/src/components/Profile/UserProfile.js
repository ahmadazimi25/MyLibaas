import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Paper,
  Tab,
  Tabs,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import SubscriptionOptions from '../SubscriptionOptions';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const UserProfile = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  // Temporary data - replace with API calls
  const rentalHistory = [
    {
      id: 1,
      item: 'Embroidered Dress',
      date: '2025-04-15',
      duration: '3 days',
      status: 'Returned',
      cost: '$180'
    },
    {
      id: 2,
      item: 'Afghan Dress',
      date: '2025-04-10',
      duration: '5 days',
      status: 'Active',
      cost: '$250'
    }
  ];

  const listings = [
    {
      id: 1,
      title: 'Traditional Dress',
      status: 'Active',
      rentals: 5,
      earnings: '$450'
    },
    {
      id: 2,
      title: 'Wedding Dress',
      status: 'Draft',
      rentals: 0,
      earnings: '$0'
    }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubscriptionSelect = (plan) => {
    // Handle subscription selection
    console.log('Selected plan:', plan);
    setShowSubscriptions(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {showSubscriptions ? (
        <SubscriptionOptions onSelect={handleSubscriptionSelect} />
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ fontFamily: "'DM Serif Display', serif" }}>
                  {user?.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Member since April 2025
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label="Pay Per Use"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => setShowSubscriptions(true)}
                    sx={{ ml: 1 }}
                  >
                    Upgrade to Premium
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Rental History" />
              <Tab label="My Listings" />
              <Tab label="Settings" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <List>
                {rentalHistory.map((rental, index) => (
                  <React.Fragment key={rental.id}>
                    <ListItem>
                      <ListItemText
                        primary={rental.item}
                        secondary={`Rented on ${rental.date} for ${rental.duration}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={rental.status}
                          color={rental.status === 'Active' ? 'primary' : 'default'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="subtitle2" component="span">
                          {rental.cost}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < rentalHistory.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <List>
                {listings.map((listing, index) => (
                  <React.Fragment key={listing.id}>
                    <ListItem>
                      <ListItemText
                        primary={listing.title}
                        secondary={`${listing.rentals} rentals • ${listing.earnings} earned`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={listing.status}
                          color={listing.status === 'Active' ? 'primary' : 'default'}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < listings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Account Settings
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                    Edit Profile
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                    Change Password
                  </Button>
                  <Button variant="outlined" fullWidth>
                    Notification Preferences
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Settings
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                    Manage Payment Methods
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                    View Billing History
                  </Button>
                  <Button variant="outlined" fullWidth>
                    Update Billing Address
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default UserProfile;
