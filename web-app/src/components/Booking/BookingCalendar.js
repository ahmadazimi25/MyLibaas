import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateRangePicker } from '@mui/lab';
import { addDays, isWithinInterval } from 'date-fns';
import RentalBookingService from '../../services/rentalBookingService';

const BookingCalendar = ({ 
  listingId, 
  onDateSelect,
  minimumRentalDays = 3,
  maximumRentalDays = 30,
  advanceBookingDays = 90 
}) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [listingId]);

  const fetchBookings = async () => {
    try {
      const bookings = await RentalBookingService.getListingBookings(listingId);
      
      // Convert bookings to unavailable date ranges
      const unavailable = bookings
        .filter(booking => ['pending', 'confirmed', 'in_progress'].includes(booking.status))
        .map(booking => ({
          start: booking.dateRange.startDate.toDate(),
          end: booking.dateRange.endDate.toDate()
        }));
      
      setUnavailableDates(unavailable);
    } catch (err) {
      setError('Failed to load availability');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDateUnavailable = (date) => {
    // Check if date falls within any unavailable range
    return unavailableDates.some(range =>
      isWithinInterval(date, { start: range.start, end: range.end })
    );
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    if (newDateRange[0] && newDateRange[1]) {
      onDateSelect(newDateRange);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select Rental Dates
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DateRangePicker
        startText="Check-out Date"
        endText="Return Date"
        value={dateRange}
        onChange={handleDateRangeChange}
        minDate={new Date()}
        maxDate={addDays(new Date(), advanceBookingDays)}
        shouldDisableDate={isDateUnavailable}
        renderInput={(startProps, endProps) => (
          <>
            <TextField {...startProps} />
            <Box sx={{ mx: 2 }}> to </Box>
            <TextField {...endProps} />
          </>
        )}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          • Minimum rental period: {minimumRentalDays} days
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Maximum rental period: {maximumRentalDays} days
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • You can book up to {advanceBookingDays} days in advance
        </Typography>
      </Box>
    </Paper>
  );
};

export default BookingCalendar;
