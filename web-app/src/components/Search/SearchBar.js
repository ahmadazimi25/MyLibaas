import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Autocomplete,
  TextField,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useSearch } from '../../contexts/SearchContext';
import { PROVINCES } from '../../types';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, filters, updateFilters } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchQuery(localQuery);
    navigate(`/browse?q=${encodeURIComponent(localQuery)}`);
  };

  const handleProvinceChange = (_, newValue) => {
    updateFilters({
      location: {
        ...filters.location,
        province: newValue || '',
      },
    });
    setShowLocationPicker(false);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSearch}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 800,
        borderRadius: 30,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>

      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search for clothing..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
        <IconButton
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          color={filters.location.province ? 'primary' : 'default'}
        >
          <LocationIcon />
        </IconButton>

        {showLocationPicker && (
          <Autocomplete
            sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: 300,
              bgcolor: 'background.paper',
              boxShadow: 3,
              borderRadius: 2,
              zIndex: 1000,
            }}
            options={PROVINCES}
            value={filters.location.province}
            onChange={handleProvinceChange}
            renderInput={(params) => (
              <TextField {...params} label="Select Province" variant="outlined" />
            )}
          />
        )}

        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            borderRadius: 30,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Search
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchBar;
