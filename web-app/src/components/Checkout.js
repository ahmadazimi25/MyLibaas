import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Box,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { LocalShipping, Payment, Done } from '@mui/icons-material';

const steps = ['Shipping Information', 'Payment Details', 'Confirmation'];

const Checkout = ({ cartItems, onCheckoutComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const handleShippingInfoChange = (field) => (event) => {
    setShippingInfo({
      ...shippingInfo,
      [field]: event.target.value
    });
  };

  const handlePaymentInfoChange = (field) => (event) => {
    setPaymentInfo({
      ...paymentInfo,
      [field]: event.target.value
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    if (activeStep === steps.length - 1) {
      onCheckoutComplete();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={shippingInfo.firstName}
                onChange={handleShippingInfoChange('firstName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={shippingInfo.lastName}
                onChange={handleShippingInfoChange('lastName')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={shippingInfo.email}
                onChange={handleShippingInfoChange('email')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange('address')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                value={shippingInfo.city}
                onChange={handleShippingInfoChange('city')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="State"
                value={shippingInfo.state}
                onChange={handleShippingInfoChange('state')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ZIP Code"
                value={shippingInfo.zipCode}
                onChange={handleShippingInfoChange('zipCode')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone"
                value={shippingInfo.phone}
                onChange={handleShippingInfoChange('phone')}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Card Number"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentInfoChange('cardNumber')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentInfo.expiryDate}
                onChange={handlePaymentInfoChange('expiryDate')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="CVV"
                value={paymentInfo.cvv}
                onChange={handlePaymentInfoChange('cvv')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Name on Card"
                value={paymentInfo.nameOnCard}
                onChange={handlePaymentInfoChange('nameOnCard')}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cartItems.map((item) => (
              <Card key={item._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography variant="subtitle1">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {item.size}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="subtitle1" align="right">
                        ${item.price}/day
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" align="right">
              Total: ${calculateTotal()}/day
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Checkout;
