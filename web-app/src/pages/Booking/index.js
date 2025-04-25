import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useProduct } from '../../contexts/ProductContext';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';

const Booking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProduct, loading: productLoading } = useProduct();
  const { createBooking, loading: bookingLoading } = useBooking();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const [bookingData, setBookingData] = useState({
    shippingMethod: 'shipping',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
    },
  });

  useEffect(() => {
    if (!location.state?.dates?.startDate || !location.state?.dates?.endDate) {
      navigate(`/items/${id}`);
    }
  }, [id, location.state, navigate]);

  if (!user) {
    navigate('/login', { state: { from: `/booking/${id}` } });
    return null;
  }

  if (productLoading || !currentProduct) {
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

  const dates = location.state?.dates;
  const totalDays =
    Math.ceil(
      (dates.endDate - dates.startDate) / (1000 * 60 * 60 * 24)
    ) + 1;

  const subtotal = currentProduct.pricing.dailyRate * totalDays;
  const cleaningFee = currentProduct.pricing.cleaningFee;
  const shippingFee =
    bookingData.shippingMethod === 'shipping'
      ? currentProduct.shipping.shippingFee
      : 0;
  const securityDeposit = currentProduct.pricing.securityDeposit;
  const total = subtotal + cleaningFee + shippingFee + securityDeposit;

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBookingData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setBookingData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const result = await createBooking({
        itemId: id,
        renterId: user.id,
        lenderId: currentProduct.lenderId,
        dates: {
          start: dates.startDate,
          end: dates.endDate,
        },
        pricing: {
          dailyRate: currentProduct.pricing.dailyRate,
          totalDays,
          subtotal,
          cleaningFee,
          shippingFee,
          securityDeposit,
          total,
        },
        shipping: {
          method: bookingData.shippingMethod,
          address: bookingData.address,
        },
      });

      if (result.success) {
        navigate(`/bookings/${result.booking.id}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Item Summary */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Review Your Booking
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Box
                  component="img"
                  src={currentProduct.images.find((img) => img.isPrimary)?.url}
                  alt={currentProduct.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1,
                  }}
                />
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h6">{currentProduct.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Size: {currentProduct.size.category} -{' '}
                  {currentProduct.size.standard}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dates.startDate.toLocaleDateString()} -{' '}
                  {dates.endDate.toLocaleDateString()} ({totalDays} days)
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Delivery Method */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Method
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={bookingData.shippingMethod}
                onChange={(e) =>
                  handleInputChange('shippingMethod', e.target.value)
                }
              >
                {currentProduct.shipping.shipping && (
                  <FormControlLabel
                    value="shipping"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography>Shipping</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${currentProduct.shipping.shippingFee} shipping fee
                        </Typography>
                      </Box>
                    }
                  />
                )}
                {currentProduct.shipping.localPickup && (
                  <FormControlLabel
                    value="pickup"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography>Local Pickup</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Free
                        </Typography>
                      </Box>
                    }
                  />
                )}
              </RadioGroup>
            </FormControl>
          </Paper>

          {/* Shipping Address */}
          {bookingData.shippingMethod === 'shipping' && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={bookingData.address.street}
                    onChange={(e) =>
                      handleInputChange('address.street', e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={bookingData.address.city}
                    onChange={(e) =>
                      handleInputChange('address.city', e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Province"
                    value={bookingData.address.province}
                    onChange={(e) =>
                      handleInputChange('address.province', e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={bookingData.address.postalCode}
                    onChange={(e) =>
                      handleInputChange('address.postalCode', e.target.value)
                    }
                    required
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Price Summary */}
        <Grid item xs={12} md={5}>
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
                  ${currentProduct.pricing.dailyRate} × {totalDays} days
                </Typography>
                <Typography>${subtotal}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>Cleaning fee</Typography>
                <Typography>${cleaningFee}</Typography>
              </Box>
              {bookingData.shippingMethod === 'shipping' && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography>Shipping fee</Typography>
                  <Typography>${shippingFee}</Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>Security deposit</Typography>
                <Typography>${securityDeposit}</Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${total}</Typography>
              </Box>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit}
              disabled={bookingLoading}
              sx={{ mt: 3 }}
            >
              {bookingLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Confirm and Pay'
              )}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              You won't be charged yet
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Booking;
