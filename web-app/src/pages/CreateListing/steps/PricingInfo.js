import React from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
} from '@mui/material';
import { useListing } from '../../../contexts/ListingContext';

const provinces = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
];

const PricingInfo = () => {
  const { listingData, updateListingData, errors } = useListing();

  const handlePricingChange = (field, value) => {
    updateListingData({
      pricing: {
        ...listingData.pricing,
        [field]: value,
      },
    });
  };

  const handleShippingChange = (field, value) => {
    updateListingData({
      shipping: {
        ...listingData.shipping,
        [field]: value,
      },
    });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Rental Rates
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Daily Rate"
            type="number"
            value={listingData.pricing.dailyRate}
            onChange={(e) => handlePricingChange('dailyRate', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={!!errors.dailyRate}
            helperText={errors.dailyRate}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Weekly Rate"
            type="number"
            value={listingData.pricing.weeklyRate}
            onChange={(e) => handlePricingChange('weeklyRate', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Event Rate (3-4 days)"
            type="number"
            value={listingData.pricing.eventRate}
            onChange={(e) => handlePricingChange('eventRate', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Security Deposit"
            type="number"
            value={listingData.pricing.securityDeposit}
            onChange={(e) => handlePricingChange('securityDeposit', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={!!errors.securityDeposit}
            helperText={errors.securityDeposit}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cleaning Fee"
            type="number"
            value={listingData.pricing.cleaningFee}
            onChange={(e) => handlePricingChange('cleaningFee', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Delivery Options
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={listingData.shipping.localPickup}
                onChange={(e) =>
                  handleShippingChange('localPickup', e.target.checked)
                }
              />
            }
            label="Allow Local Pickup"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={listingData.shipping.shipping}
                onChange={(e) =>
                  handleShippingChange('shipping', e.target.checked)
                }
              />
            }
            label="Allow Shipping"
          />
        </Grid>

        {listingData.shipping.shipping && (
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Shipping Fee"
              type="number"
              value={listingData.shipping.shippingFee}
              onChange={(e) =>
                handleShippingChange('shippingFee', e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Autocomplete
            multiple
            value={listingData.shipping.availableProvinces}
            onChange={(_, newValue) =>
              handleShippingChange('availableProvinces', newValue)
            }
            options={provinces}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Available Provinces"
                placeholder="Select provinces"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PricingInfo;
