import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Switch,
  Collapse
} from '@mui/material';
import {
  FilterList,
  Close,
  ExpandMore,
  ExpandLess,
  ColorLens
} from '@mui/icons-material';

const OCCASIONS = ['Wedding', 'Eid', 'Party', 'Casual', 'Traditional'];
const STYLES = ['Afghan', 'Pakistani', 'Arabic', 'Boho', 'Modern'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Red', 'Green', 'Blue', 'Gold', 'Silver', 'Black', 'White', 'Maroon', 'Beige'];
const FABRICS = ['Silk', 'Cotton', 'Chiffon', 'Velvet', 'Lace', 'Georgette', 'Brocade'];

const FilterSection = ({ title, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        fullWidth
        onClick={() => setExpanded(!expanded)}
        startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        sx={{ justifyContent: 'flex-start', mb: 1 }}
      >
        {title}
      </Button>
      <Collapse in={expanded}>
        {children}
      </Collapse>
    </Box>
  );
};

const StyleFilters = ({ open, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    occasions: [],
    styles: [],
    sizes: [],
    colors: [],
    fabrics: [],
    priceRange: [0, 500],
    modestWear: false,
    sortBy: 'newest'
  });

  const handleChange = (section, value) => {
    setFilters(prev => ({
      ...prev,
      [section]: Array.isArray(prev[section])
        ? prev[section].includes(value)
          ? prev[section].filter(item => item !== value)
          : [...prev[section], value]
        : value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      occasions: [],
      styles: [],
      sizes: [],
      colors: [],
      fabrics: [],
      priceRange: [0, 500],
      modestWear: false,
      sortBy: 'newest'
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1, fontFamily: "'DM Serif Display', serif" }}>
            Filters & Sort
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <FilterSection title="Sort By">
          <FormGroup>
            {['newest', 'price_low', 'price_high', 'popular'].map(option => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.sortBy === option}
                    onChange={() => setFilters(prev => ({ ...prev, sortBy: option }))}
                  />
                }
                label={option.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              />
            ))}
          </FormGroup>
        </FilterSection>

        <FilterSection title="Occasion">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {OCCASIONS.map(occasion => (
              <Chip
                key={occasion}
                label={occasion}
                onClick={() => handleChange('occasions', occasion)}
                color={filters.occasions.includes(occasion) ? 'primary' : 'default'}
                variant={filters.occasions.includes(occasion) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </FilterSection>

        <FilterSection title="Regional Style">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {STYLES.map(style => (
              <Chip
                key={style}
                label={style}
                onClick={() => handleChange('styles', style)}
                color={filters.styles.includes(style) ? 'primary' : 'default'}
                variant={filters.styles.includes(style) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </FilterSection>

        <FilterSection title="Size">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SIZES.map(size => (
              <Chip
                key={size}
                label={size}
                onClick={() => handleChange('sizes', size)}
                color={filters.sizes.includes(size) ? 'primary' : 'default'}
                variant={filters.sizes.includes(size) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </FilterSection>

        <FilterSection title="Colors">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {COLORS.map(color => (
              <Chip
                key={color}
                label={color}
                onClick={() => handleChange('colors', color)}
                color={filters.colors.includes(color) ? 'primary' : 'default'}
                variant={filters.colors.includes(color) ? 'filled' : 'outlined'}
                icon={<ColorLens />}
              />
            ))}
          </Box>
        </FilterSection>

        <FilterSection title="Fabric">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {FABRICS.map(fabric => (
              <Chip
                key={fabric}
                label={fabric}
                onClick={() => handleChange('fabrics', fabric)}
                color={filters.fabrics.includes(fabric) ? 'primary' : 'default'}
                variant={filters.fabrics.includes(fabric) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </FilterSection>

        <FilterSection title="Price Range">
          <Box sx={{ px: 2 }}>
            <Slider
              value={filters.priceRange}
              onChange={(e, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue }))}
              valueLabelDisplay="auto"
              min={0}
              max={500}
              step={10}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">
                ${filters.priceRange[0]}
              </Typography>
              <Typography variant="body2">
                ${filters.priceRange[1]}
              </Typography>
            </Box>
          </Box>
        </FilterSection>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.modestWear}
                onChange={(e) => setFilters(prev => ({ ...prev, modestWear: e.target.checked }))}
              />
            }
            label="Modest Wear Only"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default StyleFilters;
