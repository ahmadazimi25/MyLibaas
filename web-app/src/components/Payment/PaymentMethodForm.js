import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

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

const PaymentMethodForm = ({ onSuccess, buttonText = 'Add Payment Method' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        setError(error.message);
        return;
      }

      await onSuccess(paymentMethod);
      elements.getElement(CardElement).clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Card Information
        </Typography>
        <Box
          sx={{
            p: 2,
            border: 1,
            borderColor: 'grey.300',
            borderRadius: 1,
            '&:hover': {
              borderColor: 'grey.400',
            },
          }}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={!stripe || loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : buttonText}
      </Button>
    </form>
  );
};

export default PaymentMethodForm;
