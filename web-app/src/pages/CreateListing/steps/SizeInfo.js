import React from 'react';
import {
  Box,
  TextField,
  Grid,
  Autocomplete,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useListing } from '../../../contexts/ListingContext';

const sizeCategories = ["Women's", "Men's", "Children's", "Unisex"];

const standardSizes = {
  "Women's": ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '0', '2', '4', '6', '8', '10', '12', '14', '16'],
  "Men's": ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', '42'],
  "Children's": ['2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14', '16'],
  "Unisex": ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
};

const SizeInfo = () => {
  const { listingData, updateListingData, errors } = useListing();

  const handleSizeCategoryChange = (_, newValue) => {
    updateListingData({
      size: {
        ...listingData.size,
        category: newValue,
        standard: '',
      },
    });
  };

  const handleStandardSizeChange = (_, newValue) => {
    updateListingData({
      size: {
        ...listingData.size,
        standard: newValue,
      },
    });
  };

  const handleMeasurementChange = (field, value) => {
    updateListingData({
      size: {
        ...listingData.size,
        measurements: {
          ...listingData.size.measurements,
          [field]: value,
        },
      },
    });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            value={listingData.size.category}
            onChange={handleSizeCategoryChange}
            options={sizeCategories}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Size Category"
                error={!!errors.sizeCategory}
                helperText={errors.sizeCategory}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            value={listingData.size.standard}
            onChange={handleStandardSizeChange}
            options={listingData.size.category ? standardSizes[listingData.size.category] : []}
            disabled={!listingData.size.category}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Standard Size"
                error={!!errors.sizeStandard}
                helperText={errors.sizeStandard}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Measurements
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please provide accurate measurements to help renters find the perfect fit.
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Bust"
            type="number"
            value={listingData.size.measurements.bust}
            onChange={(e) => handleMeasurementChange('bust', e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Waist"
            type="number"
            value={listingData.size.measurements.waist}
            onChange={(e) => handleMeasurementChange('waist', e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Hips"
            type="number"
            value={listingData.size.measurements.hips}
            onChange={(e) => handleMeasurementChange('hips', e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Length"
            type="number"
            value={listingData.size.measurements.length}
            onChange={(e) => handleMeasurementChange('length', e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Inseam"
            type="number"
            value={listingData.size.measurements.inseam}
            onChange={(e) => handleMeasurementChange('inseam', e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SizeInfo;
