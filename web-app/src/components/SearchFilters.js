import React from 'react';
import { Paper, TextField, Box, Select, MenuItem, FormControl, InputLabel, Slider, Typography } from '@mui/material';

const SearchFilters = ({ filters, onFilterChange }) => {
  const occasions = ['Party', 'Casual', 'Formal', 'Wedding', 'Business'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' },
    { value: 'nameAsc', label: 'Name: A to Z' }
  ];

  const handlePriceChange = (event, newValue) => {
    onFilterChange('maxPrice', newValue);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            label="Sort By"
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel>Size</InputLabel>
          <Select
            value={filters.size}
            label="Size"
            onChange={(e) => onFilterChange('size', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {sizes.map((size) => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel>Occasion</InputLabel>
          <Select
            value={filters.occasion}
            label="Occasion"
            onChange={(e) => onFilterChange('occasion', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {occasions.map((occasion) => (
              <MenuItem key={occasion} value={occasion}>{occasion}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ minWidth: '200px' }}>
          <Typography gutterBottom>Max Price per Day</Typography>
          <Slider
            value={filters.maxPrice}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={200}
            step={5}
            marks={[
              { value: 0, label: '$0' },
              { value: 100, label: '$100' },
              { value: 200, label: '$200' },
            ]}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default SearchFilters;
