import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'success',
};

const statusLabels = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBooking, loading, error, fetchBooking, updateBookingStatus, sendMessage } = useBooking();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchBooking(id);
  }, [id, fetchBooking]);

  if (!user) {
    navigate('/login', { state: { from: `/bookings/${id}` } });
    return null;
  }

  if (loading || !currentBooking) {
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const isLender = user.id === currentBooking.lenderId;
  const canUpdateStatus = isLender && currentBooking.status === 'pending';

  const handleStatusUpdate = async (newStatus) => {
    await updateBookingStatus(id, newStatus);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSendingMessage(true);
    try {
      const result = await sendMessage(id, message);
      if (result.success) {
        setMessage('');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Booking Details */}
        <Grid item xs={12} md={8}>
          {/* Status Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Booking #{id}</Typography>
              <Chip
                label={statusLabels[currentBooking.status]}
                color={statusColors[currentBooking.status]}
              />
            </Stack>

            {canUpdateStatus && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleStatusUpdate('confirmed')}
                  sx={{ mr: 1 }}
                >
                  Confirm Booking
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleStatusUpdate('cancelled')}
                >
                  Decline
                </Button>
              </Box>
            )}
          </Paper>

          {/* Item Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Item Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Box
                  component="img"
                  src={currentBooking.item.images[0].url}
                  alt={currentBooking.item.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1,
                  }}
                />
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h6">{currentBooking.item.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {currentBooking.dates.start.toLocaleDateString()} -{' '}
                  {currentBooking.dates.end.toLocaleDateString()} (
                  {currentBooking.pricing.totalDays} days)
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/items/${currentBooking.itemId}`)}
                  sx={{ mt: 1 }}
                >
                  View Item
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Delivery Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Details
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {currentBooking.shipping.method === 'shipping' ? (
                <>
                  <ShippingIcon color="action" />
                  <Box>
                    <Typography>Shipping</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentBooking.shipping.address.street},{' '}
                      {currentBooking.shipping.address.city},{' '}
                      {currentBooking.shipping.address.province}{' '}
                      {currentBooking.shipping.address.postalCode}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <StoreIcon color="action" />
                  <Box>
                    <Typography>Local Pickup</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Details will be provided after confirmation
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Paper>

          {/* Messages */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto' }}>
              {currentBooking.messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 2,
                    flexDirection:
                      msg.senderId === user.id ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    src={`https://i.pravatar.cc/150?u=${msg.senderId}`}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor:
                        msg.senderId === user.id
                          ? 'primary.main'
                          : 'background.default',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={msg.senderId === user.id ? 'white' : 'text.primary'}
                    >
                      {msg.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        msg.senderId === user.id
                          ? 'rgba(255,255,255,0.7)'
                          : 'text.secondary'
                      }
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendingMessage}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!message.trim() || sendingMessage}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Price Summary */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              position: { md: 'sticky' },
              top: { md: 24 },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Price Details
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>
                  ${currentBooking.pricing.dailyRate} × {currentBooking.pricing.totalDays} days
                </Typography>
                <Typography>${currentBooking.pricing.subtotal}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>Cleaning fee</Typography>
                <Typography>${currentBooking.pricing.cleaningFee}</Typography>
              </Box>
              {currentBooking.shipping.method === 'shipping' && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography>Shipping fee</Typography>
                  <Typography>${currentBooking.pricing.shippingFee}</Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>Security deposit</Typography>
                <Typography>${currentBooking.pricing.securityDeposit}</Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${currentBooking.pricing.total}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingDetails;
