import React from 'react';
import {
  Box,
  TextField,
  Grid,
  Autocomplete,
  Chip,
  FormHelperText,
} from '@mui/material';
import { useListing } from '../../../contexts/ListingContext';

const categories = [
  'Traditional Wear',
  'Formal Wear',
  'Casual Wear',
  'Wedding Attire',
  'Party Wear',
  'Business Attire',
  'Accessories',
];

const occasions = [
  'Wedding',
  'Cultural Event',
  'Party',
  'Business Meeting',
  'Date Night',
  'Vacation',
  'Festival',
  'Religious Ceremony',
];

const styles = [
  'Traditional',
  'Modern',
  'Fusion',
  'Formal',
  'Casual',
  'Elegant',
  'Bohemian',
  'Vintage',
];

const seasons = ['All Season', 'Spring', 'Summer', 'Fall', 'Winter'];

const BasicInfo = () => {
  const { listingData, updateListingData, errors } = useListing();

  return (
    <Box component="form" noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Title"
            value={listingData.title}
            onChange={(e) =>
              updateListingData({ title: e.target.value })
            }
            error={!!errors.title}
            helperText={errors.title}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={listingData.description}
            onChange={(e) =>
              updateListingData({ description: e.target.value })
            }
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            value={listingData.category}
            onChange={(_, newValue) =>
              updateListingData({ category: newValue })
            }
            options={categories}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Category"
                error={!!errors.category}
                helperText={errors.category}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Brand"
            value={listingData.brand}
            onChange={(e) =>
              updateListingData({ brand: e.target.value })
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            multiple
            value={listingData.occasion}
            onChange={(_, newValue) =>
              updateListingData({ occasion: newValue })
            }
            options={occasions}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Occasions" />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            multiple
            value={listingData.style}
            onChange={(_, newValue) =>
              updateListingData({ style: newValue })
            }
            options={styles}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Styles" />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            value={listingData.season}
            onChange={(_, newValue) =>
              updateListingData({ season: newValue })
            }
            options={seasons}
            renderInput={(params) => (
              <TextField {...params} label="Season" />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicInfo;
