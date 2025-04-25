import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { usePayment } from '../../contexts/PaymentContext';
import PaymentMethodForm from './PaymentMethodForm';

const PriceBreakdown = ({ pricing }) => (
  <Stack spacing={2}>
    <Stack direction="row" justifyContent="space-between">
      <Typography>Rental Fee</Typography>
      <Typography>
        ${pricing.dailyRate} × {pricing.totalDays} days
      </Typography>
    </Stack>
    <Stack direction="row" justifyContent="space-between">
      <Typography>Cleaning Fee</Typography>
      <Typography>${pricing.cleaningFee}</Typography>
    </Stack>
    {pricing.shippingFee > 0 && (
      <Stack direction="row" justifyContent="space-between">
        <Typography>Shipping Fee</Typography>
        <Typography>${pricing.shippingFee}</Typography>
      </Stack>
    )}
    <Stack direction="row" justifyContent="space-between">
      <Typography>Security Deposit</Typography>
      <Typography>${pricing.securityDeposit}</Typography>
    </Stack>
    <Divider />
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="h6">Total</Typography>
      <Typography variant="h6">${pricing.total}</Typography>
    </Stack>
  </Stack>
);

const Checkout = ({
  bookingId,
  pricing,
  onSuccess,
  onError,
  buttonText = 'Complete Payment',
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const {
    loading: contextLoading,
    error: contextError,
    createPaymentIntent,
    getPaymentMethods,
  } = usePayment();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [useNewCard, setUseNewCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const result = await getPaymentMethods();
    if (result.success) {
      setPaymentMethods(result.paymentMethods);
      if (result.paymentMethods.length > 0) {
        const defaultMethod = result.paymentMethods.find(
          (m) => m.isDefault
        );
        setSelectedPaymentMethod(
          defaultMethod ? defaultMethod.id : result.paymentMethods[0].id
        );
      } else {
        setUseNewCard(true);
      }
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Create payment intent
      const { success, clientSecret, error: intentError } =
        await createPaymentIntent({
          amount: pricing.total * 100, // Convert to cents
          currency: 'usd',
          bookingId,
        });

      if (!success) {
        throw new Error(intentError || 'Failed to create payment intent');
      }

      // Confirm payment
      let result;
      if (useNewCard) {
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement('card'),
          },
        });
      } else {
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedPaymentMethod,
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      onSuccess(result.paymentIntent);
    } catch (err) {
      setError(err.message);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading && paymentMethods.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (contextError) {
    return <Alert severity="error">{contextError}</Alert>;
  }

  return (
    <Stack spacing={3}>
      {/* Price Breakdown */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Price Details
        </Typography>
        <PriceBreakdown pricing={pricing} />
      </Paper>

      {/* Payment Method Selection */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Payment Method
        </Typography>

        {paymentMethods.length > 0 && (
          <RadioGroup
            value={useNewCard ? 'new' : selectedPaymentMethod}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'new') {
                setUseNewCard(true);
              } else {
                setUseNewCard(false);
                setSelectedPaymentMethod(value);
              }
            }}
          >
            {paymentMethods.map((method) => (
              <FormControlLabel
                key={method.id}
                value={method.id}
                control={<Radio />}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography>
                      {method.card.brand.charAt(0).toUpperCase() +
                        method.card.brand.slice(1)}{' '}
                      ending in {method.card.last4}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires {method.card.expMonth}/{method.card.expYear}
                    </Typography>
                  </Box>
                }
              />
            ))}
            <FormControlLabel
              value="new"
              control={<Radio />}
              label="Use a new card"
            />
          </RadioGroup>
        )}

        {(useNewCard || paymentMethods.length === 0) && (
          <Box sx={{ mt: 2 }}>
            <PaymentMethodForm
              onSuccess={() => {}}
              buttonText={buttonText}
            />
          </Box>
        )}

        {!useNewCard && paymentMethods.length > 0 && (
          <>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading || !selectedPaymentMethod}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : buttonText}
            </Button>
          </>
        )}
      </Paper>
    </Stack>
  );
};

export default Checkout;
