import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import RentalBookingService from '../../services/rentalBookingService';

const steps = ['Select Dates', 'Review Details', 'Payment'];

const BookingCheckout = ({ 
  listing,
  selectedDates,
  onBookingComplete,
  onCancel 
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [price, setPrice] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (listing && selectedDates[0] && selectedDates[1]) {
      calculatePrice();
    }
  }, [listing, selectedDates]);

  const calculatePrice = () => {
    const priceDetails = RentalBookingService.calculatePrice(
      listing,
      selectedDates[0],
      selectedDates[1]
    );
    setPrice(priceDetails);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const booking = await RentalBookingService.createBooking(
        listing.id,
        user.uid,
        selectedDates[0],
        selectedDates[1]
      );

      // TODO: Integrate with payment processor
      // For now, we'll just simulate a successful payment
      await RentalBookingService.updatePaymentStatus(booking.id, 'completed');
      await RentalBookingService.updateBookingStatus(booking.id, 'confirmed');

      onBookingComplete(booking);
    } catch (err) {
      setError(err.message);
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPriceBreakdown = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Price Breakdown
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography>Rental Fee</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography align="right">${price?.rentalFee.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography>Service Fee</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography align="right">${price?.serviceFee.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography>Security Deposit</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography align="right">${price?.securityDeposit.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h6">Total</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" align="right">
            ${price?.total.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReviewDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Booking Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography>
            <strong>Item:</strong> {listing.details.title}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            <strong>Dates:</strong>{' '}
            {selectedDates[0].toLocaleDateString()} - {selectedDates[1].toLocaleDateString()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes for the lender (optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Grid>
      </Grid>
      {renderPriceBreakdown()}
    </Box>
  );

  const renderPayment = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      {/* TODO: Integrate payment form */}
      <Alert severity="info">
        Payment integration will be added here
      </Alert>
    </Box>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        {activeStep === 1 && renderReviewDetails()}
        {activeStep === 2 && renderPayment()}
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Box>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default BookingCheckout;
