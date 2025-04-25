import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  TextField,
  InputAdornment,
  Stack,
  Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { brands, getBrandsByCategory } from '../data/brands';
import { culturalClothing, getCultureById } from '../data/culturalClothing';

const defaultFilters = {
  priceRange: [0, 1000],
  brands: [],
  cultures: [],
  clothingTypes: [],
  size: '',
  conditions: [],
  occasion: '',
  category: '',
};

const categories = [
  'Formal Wear',
  'Traditional',
  'Designer',
  'Modest Fashion',
  'Casual',
  'Party Wear'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const occasions = [
  'Wedding',
  'Party',
  'Formal',
  'Casual',
  'Religious',
  'Festival',
  'Business',
  'Vacation'
];

const FilterDrawer = ({
  open,
  onClose,
  filters = defaultFilters,
  onApplyFilters
}) => {
  const [localFilters, setLocalFilters] = useState({ ...defaultFilters, ...filters });
  const [expandedCategory, setExpandedCategory] = useState('luxury');
  const [expandedCulturalRegion, setExpandedCulturalRegion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [culturalSearchTerm, setCulturalSearchTerm] = useState('');

  const handleFilterChange = (category, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleBrandToggle = (brandId) => {
    const currentBrands = localFilters.brands || [];
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(id => id !== brandId)
      : [...currentBrands, brandId];
    
    handleFilterChange('brands', newBrands);
  };

  const handleCultureToggle = (cultureId) => {
    const currentCultures = localFilters.cultures || [];
    const newCultures = currentCultures.includes(cultureId)
      ? currentCultures.filter(id => id !== cultureId)
      : [...currentCultures, cultureId];
    
    handleFilterChange('cultures', newCultures);
  };

  const handleClothingTypeToggle = (type) => {
    const currentTypes = localFilters.clothingTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    handleFilterChange('clothingTypes', newTypes);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    setSearchTerm('');
    setCulturalSearchTerm('');
    onApplyFilters(defaultFilters);
    onClose();
  };

  const filteredBrands = (category) => {
    return getBrandsByCategory(category).filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredCultures = (region) => {
    return region.cultures.filter(culture =>
      culture.name.toLowerCase().includes(culturalSearchTerm.toLowerCase())
    );
  };

  const handlePriceChange = (event, newValue) => {
    handleFilterChange('priceRange', newValue);
  };

  const handleCategoryChange = (event) => {
    if (event.target.checked) {
      handleFilterChange('category', event.target.name);
    } else {
      handleFilterChange('category', '');
    }
  };

  const handleSizeChange = (event) => {
    handleFilterChange('size', event.target.value);
  };

  const handleOccasionChange = (event) => {
    handleFilterChange('occasion', event.target.name);
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
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>

        <Stack spacing={2}>
          {/* Price Range */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Price Range (per day)
            </Typography>
            <Slider
              value={localFilters.priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={10}
              marks={[
                { value: 0, label: '$0' },
                { value: 500, label: '$500' },
                { value: 1000, label: '$1000' },
              ]}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ${localFilters.priceRange[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${localFilters.priceRange[1]}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Occasion */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Occasion
            </Typography>
            <Stack spacing={1}>
              {occasions.map((occasion) => (
                <FormControlLabel
                  key={occasion}
                  control={
                    <Checkbox
                      checked={localFilters.occasion === occasion}
                      onChange={handleOccasionChange}
                      name={occasion}
                      size="small"
                    />
                  }
                  label={occasion}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Brands */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Brands
            </Typography>
            
            <TextField
              fullWidth
              size="small"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">🔍</InputAdornment>
                ),
              }}
            />

            {/* Selected Brands */}
            {localFilters.brands?.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {localFilters.brands.map(brandId => {
                  const brand = getBrandsByCategory(expandedCategory)
                    .find(b => b.id === brandId);
                  return brand && (
                    <Chip
                      key={brandId}
                      label={brand.name}
                      onDelete={() => handleBrandToggle(brandId)}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}

            {Object.entries(brands).map(([category, _]) => (
              <Accordion
                key={category}
                expanded={expandedCategory === category}
                onChange={() => setExpandedCategory(category)}
                elevation={0}
                sx={{
                  '&:before': { display: 'none' },
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 1
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ textTransform: 'capitalize' }}>
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {filteredBrands(category).map(brand => (
                      <FormControlLabel
                        key={brand.id}
                        control={
                          <Checkbox
                            checked={localFilters.brands?.includes(brand.id) || false}
                            onChange={() => handleBrandToggle(brand.id)}
                            size="small"
                          />
                        }
                        label={brand.name}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Divider />

          {/* Cultural Clothing */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Cultural Clothing
            </Typography>
            
            <TextField
              fullWidth
              size="small"
              placeholder="Search cultures..."
              value={culturalSearchTerm}
              onChange={(e) => setCulturalSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">🔍</InputAdornment>
                ),
              }}
            />

            {/* Selected Cultures */}
            {localFilters.cultures?.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {localFilters.cultures.map(cultureId => {
                  const culture = getCultureById(cultureId);
                  return culture && (
                    <Chip
                      key={cultureId}
                      label={culture.name}
                      onDelete={() => handleCultureToggle(cultureId)}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}

            {/* Cultural Regions */}
            {Object.entries(culturalClothing).map(([regionId, region]) => (
              <Accordion
                key={regionId}
                expanded={expandedCulturalRegion === regionId}
                onChange={() => setExpandedCulturalRegion(
                  expandedCulturalRegion === regionId ? null : regionId
                )}
                elevation={0}
                sx={{
                  '&:before': { display: 'none' },
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 1
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {region.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {filteredCultures(region).map(culture => (
                      <Box key={culture.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={localFilters.cultures?.includes(culture.id) || false}
                              onChange={() => handleCultureToggle(culture.id)}
                              size="small"
                            />
                          }
                          label={culture.name}
                        />
                        
                        {localFilters.cultures?.includes(culture.id) && (
                          <Box sx={{ ml: 3, mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Clothing Types:
                            </Typography>
                            <Stack spacing={1}>
                              {culture.traditional.map(type => (
                                <FormControlLabel
                                  key={type}
                                  control={
                                    <Checkbox
                                      checked={localFilters.clothingTypes?.includes(type) || false}
                                      onChange={() => handleClothingTypeToggle(type)}
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Typography variant="body2">
                                      {type}
                                    </Typography>
                                  }
                                />
                              ))}
                              {culture.modern.map(type => (
                                <FormControlLabel
                                  key={type}
                                  control={
                                    <Checkbox
                                      checked={localFilters.clothingTypes?.includes(type) || false}
                                      onChange={() => handleClothingTypeToggle(type)}
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Typography variant="body2" color="primary">
                                      {type}
                                    </Typography>
                                  }
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Divider />

          {/* Categories */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Categories
            </Typography>
            <FormGroup>
              {categories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={localFilters.category === category}
                      onChange={handleCategoryChange}
                      name={category}
                      size="small"
                    />
                  }
                  label={category}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider />

          {/* Size */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Size
            </Typography>
            <RadioGroup
              value={localFilters.size || ''}
              onChange={handleSizeChange}
            >
              {sizes.map(size => (
                <FormControlLabel
                  key={size}
                  value={size}
                  control={<Radio size="small" />}
                  label={size}
                />
              ))}
            </RadioGroup>
          </Box>

          <Divider />

          {/* Condition */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Condition
            </Typography>
            <FormGroup>
              {[
                { value: 'new', label: 'New with tags' },
                { value: 'like-new', label: 'Like new' },
                { value: 'good', label: 'Good' },
                { value: 'fair', label: 'Fair' }
              ].map(condition => (
                <FormControlLabel
                  key={condition.value}
                  control={
                    <Checkbox
                      checked={localFilters.conditions?.includes(condition.value) || false}
                      onChange={() => {
                        const current = localFilters.conditions || [];
                        const updated = current.includes(condition.value)
                          ? current.filter(c => c !== condition.value)
                          : [...current, condition.value];
                        handleFilterChange('conditions', updated);
                      }}
                      size="small"
                    />
                  }
                  label={condition.label}
                />
              ))}
            </FormGroup>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            fullWidth
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            fullWidth
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;
