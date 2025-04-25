import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useListing } from '../../../contexts/ListingContext';

const Availability = () => {
  const { listingData, updateAvailability, errors } = useListing();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleAddDateRange = () => {
    if (startDate && endDate) {
      const newRange = {
        startDate,
        endDate,
        isBooked: false,
      };

      // Sort dates chronologically
      const newAvailability = [...listingData.availability, newRange].sort(
        (a, b) => a.startDate - b.startDate
      );

      updateAvailability(newAvailability);
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleRemoveDateRange = (index) => {
    const newAvailability = listingData.availability.filter(
      (_, i) => i !== index
    );
    updateAvailability(newAvailability);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Set Availability
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add the dates when your item will be available for rent.
      </Typography>

      {/* Date Range Picker */}
      <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              minDate={new Date()}
              slotProps={{
                textField: { fullWidth: true, size: 'small' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || new Date()}
              slotProps={{
                textField: { fullWidth: true, size: 'small' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddDateRange}
              disabled={!startDate || !endDate}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {errors.availability && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {errors.availability}
        </Typography>
      )}

      {/* Date Ranges List */}
      <Stack spacing={2}>
        {listingData.availability.map((range, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            variant="outlined"
          >
            <Box>
              <Typography variant="subtitle1">
                Available Period {index + 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {range.startDate.toLocaleDateString()} -{' '}
                {range.endDate.toLocaleDateString()}
              </Typography>
            </Box>
            <IconButton
              onClick={() => handleRemoveDateRange(index)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Stack>

      {listingData.availability.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          No availability periods added yet.
        </Typography>
      )}
    </Box>
  );
};

export default Availability;
