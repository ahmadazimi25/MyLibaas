import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Chip,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'success',
};

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Box
            component="img"
            src={booking.item.images[0].url}
            alt={booking.item.title}
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {booking.item.title}
            </Typography>

            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {/* Dates */}
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon color="action" fontSize="small" />
                <Typography variant="body2">
                  {booking.dates.start.toLocaleDateString()} -{' '}
                  {booking.dates.end.toLocaleDateString()}
                </Typography>
              </Stack>

              {/* Delivery Method */}
              <Stack direction="row" spacing={1} alignItems="center">
                {booking.shipping?.method === 'shipping' ? (
                  <>
                    <ShippingIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      Shipping to: {booking.shipping.address.street},{' '}
                      {booking.shipping.address.city}
                    </Typography>
                  </>
                ) : (
                  <>
                    <StoreIcon color="action" fontSize="small" />
                    <Typography variant="body2">Local Pickup</Typography>
                  </>
                )}
              </Stack>

              {/* Price */}
              <Typography variant="h6" color="primary">
                ${booking.totalPrice}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Chip
                label={
                  booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)
                }
                color={statusColors[booking.status]}
                size="small"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/bookings/${booking.id}`)}
              >
                View Details
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userBookings, loading, error, fetchUserBookings } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchUserBookings(user.id);
    }
  }, [user, fetchUserBookings]);

  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  const filteredBookings = userBookings.filter((booking) => {
    const matchesSearch = booking.item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Bookings
      </Typography>

      {/* Search and Filters */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <TextField
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Tabs
          value={statusFilter}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Confirmed" value="confirmed" />
          <Tab label="Completed" value="completed" />
          <Tab label="Cancelled" value="cancelled" />
        </Tabs>
      </Stack>

      {/* Bookings Grid */}
      <Grid container spacing={3}>
        {filteredBookings.map((booking) => (
          <Grid item xs={12} key={booking.id}>
            <BookingCard booking={booking} />
          </Grid>
        ))}
        {filteredBookings.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : "You haven't made any bookings yet"}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/browse')}
                  sx={{ mt: 2 }}
                >
                  Browse Items
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MyBookings;
