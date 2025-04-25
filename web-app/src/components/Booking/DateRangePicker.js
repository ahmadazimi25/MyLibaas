import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DateRangePicker as MuiDateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { addDays, isWithinInterval, isSameDay } from 'date-fns';

const DateRangePicker = ({
  value,
  onChange,
  minDays = 3,
  maxDays = 14,
  disabledDates = [],
  error
}) => {
  const isDateDisabled = (date) => {
    // Check if date is in disabled dates
    const isDisabled = disabledDates.some(interval =>
      isWithinInterval(date, {
        start: new Date(interval.start),
        end: new Date(interval.end)
      }) || 
      isSameDay(date, new Date(interval.start)) ||
      isSameDay(date, new Date(interval.end))
    );

    return isDisabled;
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle1" gutterBottom>
        Select Rental Period
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <MuiDateRangePicker
          value={value}
          onChange={onChange}
          disablePast
          minDate={new Date()}
          maxDate={addDays(new Date(), 90)}
          shouldDisableDate={isDateDisabled}
          slotProps={{
            textField: {
              helperText: error || `Minimum ${minDays} days, maximum ${maxDays} days`,
              error: !!error
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default DateRangePicker;
