import React, { useEffect, useState } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  Person as PersonIcon,
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

const BookingCard = ({ booking, onStatusChange }) => {
  const navigate = useNavigate();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleConfirm = () => {
    setConfirmDialogOpen(false);
    onStatusChange(booking.id, 'confirmed');
  };

  const handleCancel = () => {
    setCancelDialogOpen(false);
    onStatusChange(booking.id, 'cancelled');
  };

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

            {/* Renter Info */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                src={`https://i.pravatar.cc/150?u=${booking.renterId}`}
                sx={{ width: 24, height: 24 }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
              <Typography variant="body2">
                {booking.renter.name} • {booking.renter.rating} ★
              </Typography>
            </Stack>

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
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={
                    booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)
                  }
                  color={statusColors[booking.status]}
                  size="small"
                />
                {booking.status === 'pending' && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => setConfirmDialogOpen(true)}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </Stack>
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

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to confirm this booking? The renter will be
            notified and charged for the rental.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} color="success" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Decline Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to decline this booking? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Back</Button>
          <Button onClick={handleCancel} color="error">
            Decline
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const ReceivedBookings = () => {
  const { user } = useAuth();
  const {
    receivedBookings,
    loading,
    error,
    fetchReceivedBookings,
    updateBookingStatus,
  } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchReceivedBookings(user.id);
    }
  }, [user, fetchReceivedBookings]);

  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  const handleStatusChange = async (bookingId, status) => {
    await updateBookingStatus(bookingId, status);
  };

  const filteredBookings = receivedBookings.filter((booking) => {
    const matchesSearch =
      booking.item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.renter.name.toLowerCase().includes(searchQuery.toLowerCase());
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
        Received Bookings
      </Typography>

      {/* Search and Filters */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <TextField
          placeholder="Search by item or renter..."
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
            <BookingCard
              booking={booking}
              onStatusChange={handleStatusChange}
            />
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
                  : "You haven't received any bookings yet"}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ReceivedBookings;
