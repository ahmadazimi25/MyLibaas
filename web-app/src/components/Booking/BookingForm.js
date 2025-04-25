import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { differenceInDays } from 'date-fns';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import DateRangePicker from './DateRangePicker';
import CancellationPolicy from './CancellationPolicy';

const BookingForm = ({
  item,
  onSubmit,
  existingBookings = [],
  minRentalDays = 3,
  maxRentalDays = 14,
  cancellationPolicy
}) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const days = differenceInDays(dateRange[1], dateRange[0]);
      
      // Validate rental period
      if (days < minRentalDays) {
        setError(`Minimum rental period is ${minRentalDays} days`);
        setTotalPrice(0);
        return;
      }
      
      if (days > maxRentalDays) {
        setError(`Maximum rental period is ${maxRentalDays} days`);
        setTotalPrice(0);
        return;
      }

      // Calculate total price
      const subtotal = item.pricePerDay * days;
      const serviceFee = subtotal * 0.10; // 10% service fee
      const total = subtotal + serviceFee;
      
      setTotalPrice(total);
      setError('');
    } else {
      setTotalPrice(0);
    }
  }, [dateRange, item.pricePerDay, minRentalDays, maxRentalDays]);

  const handleSubmit = () => {
    if (!dateRange[0] || !dateRange[1]) {
      setError('Please select both start and end dates');
      return;
    }

    onSubmit({
      startDate: dateRange[0],
      endDate: dateRange[1],
      totalPrice
    });
  };

  return (
    <Stack spacing={3}>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        minDays={minRentalDays}
        maxDays={maxRentalDays}
        disabledDates={existingBookings}
        error={error}
      />

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Price Details
        </Typography>

        {dateRange[0] && dateRange[1] && !error && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">
                {differenceInDays(dateRange[1], dateRange[0])} days × ${item.pricePerDay}/day
              </Typography>
              <Typography variant="body1">
                ${(item.pricePerDay * differenceInDays(dateRange[1], dateRange[0])).toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">Service fee (10%)</Typography>
              <Typography variant="body1">
                ${(totalPrice - (item.pricePerDay * differenceInDays(dateRange[1], dateRange[0]))).toFixed(2)}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        )}

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
          disabled={!dateRange[0] || !dateRange[1] || !!error}
          sx={{ mt: 3 }}
        >
          Book Now
        </Button>
      </Paper>

      {/* Cancellation Policy Section */}
      {cancellationPolicy && (
        <Accordion
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1">
              View Cancellation Policy
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <CancellationPolicy policy={cancellationPolicy} />
          </AccordionDetails>
        </Accordion>
      )}
    </Stack>
  );
};

export default BookingForm;
