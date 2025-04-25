import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import {
  MonetizationOn as MoneyIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: `${color}.light`,
      color: `${color}.dark`,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="div">
      {value}
    </Typography>
  </Paper>
);

const Overview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    statistics,
    userListings,
    userBookings,
    receivedBookings,
    loading,
    error,
    fetchDashboardStatistics,
    fetchUserListings,
    fetchUserBookings,
    fetchReceivedBookings,
  } = useDashboard();

  useEffect(() => {
    if (user) {
      fetchDashboardStatistics(user.id);
      fetchUserListings(user.id);
      fetchUserBookings(user.id);
      fetchReceivedBookings(user.id);
    }
  }, [
    user,
    fetchDashboardStatistics,
    fetchUserListings,
    fetchUserBookings,
    fetchReceivedBookings,
  ]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="h6">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4">Welcome back, {user?.name}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create-listing')}
        >
          Create New Listing
        </Button>
      </Stack>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`$${statistics.totalEarnings}`}
            icon={<MoneyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Listings"
            value={statistics.activeListings}
            icon={<InventoryIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Bookings"
            value={statistics.completedBookings}
            icon={<CheckIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={statistics.averageRating.toFixed(1)}
            icon={<StarIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Listings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Recent Listings</Typography>
              <Button
                size="small"
                onClick={() => navigate('/dashboard/listings')}
              >
                View All
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {userListings.slice(0, 3).map((listing) => (
              <Box
                key={listing.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src={listing.images[0].url}
                  alt={listing.title}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    objectFit: 'cover',
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${listing.price} per day • {listing.totalBookings} bookings
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Recent Bookings</Typography>
              <Button
                size="small"
                onClick={() => navigate('/dashboard/bookings')}
              >
                View All
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {receivedBookings.slice(0, 3).map((booking) => (
              <Box
                key={booking.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src={booking.item.images[0].url}
                  alt={booking.item.title}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    objectFit: 'cover',
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {booking.item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {booking.dates.start.toLocaleDateString()} -{' '}
                    {booking.dates.end.toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        booking.status === 'confirmed'
                          ? 'success.main'
                          : booking.status === 'pending'
                          ? 'warning.main'
                          : 'error.main',
                    }}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
