import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import stripePromise from '../../config/stripe';
import PaymentService from '../../services/paymentService';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const PaymentFormContent = ({ 
  bookingId,
  amount,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const getPaymentIntent = async () => {
      try {
        const { clientSecret } = await PaymentService.createPaymentIntent(bookingId);
        setClientSecret(clientSecret);
      } catch (err) {
        setError(err.message);
        onPaymentError(err);
      }
    };

    getPaymentIntent();
  }, [bookingId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        throw error;
      }

      // Update booking with payment confirmation
      await PaymentService.confirmPayment(bookingId, paymentIntent.id);
      onPaymentSuccess(paymentIntent);
    } catch (err) {
      setError(err.message);
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Amount to be charged: ${(amount / 100).toFixed(2)}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Box sx={{ 
        p: 2, 
        border: '1px solid #e0e0e0', 
        borderRadius: 1,
        mb: 3
      }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading || !stripe}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          `Pay ${(amount / 100).toFixed(2)} CAD`
        )}
      </Button>
    </form>
  );
};

const PaymentForm = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentFormContent {...props} />
  </Elements>
);

export default PaymentForm;
