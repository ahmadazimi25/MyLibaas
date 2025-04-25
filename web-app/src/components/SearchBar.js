import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';

const SearchBar = ({ onSearch, onFilterClick, filterCount = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{
          display: 'flex',
          gap: 2,
          width: '100%',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <TextField
          fullWidth
          placeholder="Search for clothing..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" fontSize="large" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setSearchTerm('')}
                  edge="end"
                  size="medium"
                >
                  ×
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              height: 56,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
                '& fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
                '& fieldset': {
                  borderWidth: 2,
                  borderColor: 'primary.main',
                },
              },
            },
          }}
        />

        <Button
          variant="contained"
          onClick={onFilterClick}
          startIcon={<TuneIcon />}
          size="large"
          sx={{
            minWidth: { xs: '100%', sm: 'auto' },
            whiteSpace: 'nowrap',
            height: 56,
            px: 4,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          Filters {filterCount > 0 && `(${filterCount})`}
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchBar;
