import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  Divider,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useSearch } from '../../contexts/SearchContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const FilterSection = ({ title, children }) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="subtitle1" fontWeight="medium">
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

const FilterSidebar = ({ open, onClose, onApply }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { filters, updateFilters, clearFilters, getFilterOptions } = useSearch();
  const options = getFilterOptions();

  const handlePriceChange = (event, newValue) => {
    updateFilters({
      priceRange: {
        min: newValue[0],
        max: newValue[1],
      },
    });
  };

  const drawerContent = (
    <Box sx={{ width: 300, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <Button color="primary" onClick={clearFilters}>
          Clear All
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <FilterSection title="Location">
        <FormControl fullWidth>
          <TextField
            select
            label="Province"
            value={filters.location.province}
            onChange={(e) =>
              updateFilters({
                location: { ...filters.location, province: e.target.value },
              })
            }
            SelectProps={{ native: true }}
          >
            <option value="">All of Canada</option>
            {options.provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </TextField>
        </FormControl>
      </FilterSection>

      <FilterSection title="Category">
        <FormControl component="fieldset">
          <RadioGroup
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
          >
            {options.categories.map((category) => (
              <FormControlLabel
                key={category}
                value={category}
                control={<Radio />}
                label={category}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </FilterSection>

      <FilterSection title="Price Range">
        <Box sx={{ px: 2 }}>
          <Slider
            value={[filters.priceRange.min, filters.priceRange.max]}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            step={10}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <TextField
              label="Min"
              type="number"
              value={filters.priceRange.min}
              onChange={(e) =>
                updateFilters({
                  priceRange: { ...filters.priceRange, min: Number(e.target.value) },
                })
              }
              size="small"
            />
            <TextField
              label="Max"
              type="number"
              value={filters.priceRange.max}
              onChange={(e) =>
                updateFilters({
                  priceRange: { ...filters.priceRange, max: Number(e.target.value) },
                })
              }
              size="small"
            />
          </Box>
        </Box>
      </FilterSection>

      <FilterSection title="Dates">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DatePicker
            label="Start Date"
            value={filters.dates.start}
            onChange={(newValue) =>
              updateFilters({
                dates: { ...filters.dates, start: newValue },
              })
            }
          />
          <DatePicker
            label="End Date"
            value={filters.dates.end}
            onChange={(newValue) =>
              updateFilters({
                dates: { ...filters.dates, end: newValue },
              })
            }
          />
        </Box>
      </FilterSection>

      <FilterSection title="Occasion">
        <FormGroup>
          {options.occasions.map((occasion) => (
            <FormControlLabel
              key={occasion}
              control={
                <Checkbox
                  checked={filters.occasion === occasion}
                  onChange={(e) =>
                    updateFilters({ occasion: e.target.checked ? occasion : '' })
                  }
                />
              }
              label={occasion}
            />
          ))}
        </FormGroup>
      </FilterSection>

      <FilterSection title="Season">
        <FormControl component="fieldset">
          <RadioGroup
            value={filters.season}
            onChange={(e) => updateFilters({ season: e.target.value })}
          >
            {options.seasons.map((season) => (
              <FormControlLabel
                key={season}
                value={season}
                control={<Radio />}
                label={season}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </FilterSection>

      <FilterSection title="Condition">
        <FormControl component="fieldset">
          <RadioGroup
            value={filters.condition}
            onChange={(e) => updateFilters({ condition: e.target.value })}
          >
            {options.conditions.map((condition) => (
              <FormControlLabel
                key={condition}
                value={condition}
                control={<Radio />}
                label={condition}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </FilterSection>

      <Box sx={{ mt: 2 }}>
        <Button fullWidth variant="contained" onClick={onApply}>
          Apply Filters
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer anchor="left" open={open} onClose={onClose}>
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 300,
          position: 'relative',
          height: '100%',
        },
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default FilterSidebar;
