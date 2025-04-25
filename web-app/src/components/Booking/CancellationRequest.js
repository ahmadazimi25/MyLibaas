import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { differenceInHours } from 'date-fns';

const CancellationRequest = ({ 
  booking, 
  policy, 
  onCancel,
  onClose,
  open 
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (booking && policy) {
      calculateRefund();
    }
  }, [booking, policy]);

  const calculateRefund = () => {
    const hoursUntilStart = differenceInHours(
      new Date(booking.startDate),
      new Date()
    );

    // Find applicable refund rule
    const applicableRule = policy.rules
      .sort((a, b) => b.hoursThreshold - a.hoursThreshold)
      .find(rule => hoursUntilStart >= rule.hoursThreshold);

    if (applicableRule) {
      const refundPercentage = applicableRule.refundPercentage;
      const refundableAmount = (booking.totalPrice * refundPercentage) / 100;
      setRefundAmount(refundableAmount);
      
      if (refundPercentage === 0) {
        setError('Based on the cancellation policy, this booking is non-refundable at this time.');
      } else {
        setError('');
      }
    } else {
      setRefundAmount(0);
      setError('This booking is not eligible for refund based on the cancellation policy.');
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      await onCancel({
        bookingId: booking._id,
        reason: reason.trim(),
        refundAmount
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process cancellation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Cancel Booking
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Booking Details */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              backgroundColor: 'grey.50',
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Booking Details
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Item
                </Typography>
                <Typography variant="body2">
                  {booking.item.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Rental Period
                </Typography>
                <Typography variant="body2">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Paid
                </Typography>
                <Typography variant="body2">
                  ${booking.totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Refund Information */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Refund Amount
            </Typography>
            <Typography variant="h5" color={refundAmount > 0 ? 'success.main' : 'error.main'}>
              ${refundAmount.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Based on the cancellation policy and timing
            </Typography>
          </Box>

          {/* Cancellation Reason */}
          <TextField
            fullWidth
            label="Reason for Cancellation"
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!reason.trim() && !!error}
            helperText={!reason.trim() && !!error ? 'Please provide a reason' : ''}
          />

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>
          Keep Booking
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading || !reason.trim()}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Cancel Booking'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancellationRequest;
