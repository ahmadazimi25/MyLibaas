import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box,
  Container,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CreateListing from './CreateListing';

const ClothingList = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [rentDurationOpen, setRentDurationOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rentDuration, setRentDuration] = useState(1);

  // Temporary data - replace with API call
  const items = [
    {
      id: 1,
      title: 'Embroidered Dress',
      price: 60,
      owner: 'Sarah',
      image: '/images/embroidered-dress.jpg',
      description: 'Beautiful traditional embroidered dress in emerald green',
      minRentalDays: 1,
      maxRentalDays: 14
    },
    {
      id: 2,
      title: 'Afghan Dress',
      price: 50,
      owner: 'Amira',
      image: '/images/afghan-dress.jpg',
      description: 'Elegant Afghan dress with intricate embroidery',
      minRentalDays: 2,
      maxRentalDays: 10
    },
    {
      id: 3,
      title: 'Floral Dress',
      price: 24,
      owner: 'Maya',
      image: '/images/floral-dress.jpg',
      description: 'Romantic floral print dress perfect for spring',
      minRentalDays: 1,
      maxRentalDays: 7
    },
    {
      id: 4,
      title: 'Trench Coat',
      price: 30,
      owner: 'Daniel',
      image: '/images/trench-coat.jpg',
      description: 'Classic beige trench coat for any occasion',
      minRentalDays: 3,
      maxRentalDays: 30
    }
  ];

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleItemClick = (item) => {
    if (mode === 'rent') {
      setSelectedItem(item);
      setRentDuration(item.minRentalDays);
      setRentDurationOpen(true);
    } else {
      navigate(`/item/${item.id}`);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({
      ...selectedItem,
      rentalDuration: rentDuration,
      totalPrice: selectedItem.price * rentDuration
    });
    setRentDurationOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" align="center" gutterBottom>
          Rent. Earn.
        </Typography>
        <Typography variant="h2" align="center" gutterBottom>
          Share your closet.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="rent or lend"
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton 
            value="rent" 
            aria-label="rent clothes"
            sx={{
              bgcolor: mode === 'rent' ? 'secondary.main' : 'background.paper',
              color: 'primary.main',
              '&.Mui-selected': {
                bgcolor: 'secondary.main',
                color: 'primary.main',
              }
            }}
          >
            Rent
          </ToggleButton>
          <ToggleButton 
            value="lend" 
            aria-label="lend clothes"
            sx={{
              bgcolor: mode === 'lend' ? 'secondary.main' : 'background.paper',
              color: 'primary.main',
              '&.Mui-selected': {
                bgcolor: 'secondary.main',
                color: 'primary.main',
              }
            }}
          >
            Lend
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'background.paper',
              borderRadius: 25,
              '& fieldset': {
                borderColor: 'secondary.main',
              }
            }
          }}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Browse Listings
      </Typography>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={6} sm={6} md={4} key={item.id}>
            <Card 
              onClick={() => handleItemClick(item)}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                }
              }}
            >
              <CardMedia
                component="img"
                height="280"
                image={item.image}
                alt={item.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="subtitle1" color="primary.main" gutterBottom>
                  ${item.price}/day
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.owner}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {mode === 'lend' && (
        <Box sx={{ position: 'fixed', bottom: 80, right: 16 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setCreateListingOpen(true)}
            sx={{
              borderRadius: '50%',
              width: 64,
              height: 64,
              minWidth: 64,
              boxShadow: 4,
            }}
          >
            <Add />
          </Button>
        </Box>
      )}

      {/* Rental Duration Dialog */}
      <Dialog open={rentDurationOpen} onClose={() => setRentDurationOpen(false)}>
        <DialogTitle>Select Rental Duration</DialogTitle>
        <DialogContent>
          <Box sx={{ px: 2, py: 4 }}>
            <Typography gutterBottom>
              Duration (days): {rentDuration}
            </Typography>
            <Slider
              value={rentDuration}
              onChange={(e, newValue) => setRentDuration(newValue)}
              min={selectedItem?.minRentalDays || 1}
              max={selectedItem?.maxRentalDays || 30}
              marks
              valueLabelDisplay="auto"
            />
            {selectedItem && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: ${selectedItem.price * rentDuration}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRentDurationOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Listing Dialog */}
      <CreateListing
        open={createListingOpen}
        onClose={() => setCreateListingOpen(false)}
      />
    </Container>
  );
};

export default ClothingList;
