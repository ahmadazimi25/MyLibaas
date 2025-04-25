import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  Person,
  LocalOffer,
  Category,
  ShoppingCart
} from '@mui/icons-material';
import axios from 'axios';

const ClothingDetail = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clothing/${id}`);
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Container>
        <Typography variant="h5" color="error">Item not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Listings
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <img
              src={item.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={item.title}
              style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {item.title}
            </Typography>
            
            <Typography variant="h5" color="primary" gutterBottom>
              ${item.price}/day
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Category />
                  <Typography>Size: {item.size}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday />
                  <Typography>Occasion: {item.occasion}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Chip
              icon={<LocalOffer />}
              label={item.isAvailable ? 'Available' : 'Not Available'}
              color={item.isAvailable ? 'success' : 'error'}
              sx={{ mb: 2 }}
            />

            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <Person />
              <Typography>Owner: {item.owner?.username || 'Anonymous'}</Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<ShoppingCart />}
              onClick={() => onAddToCart(item)}
              disabled={!item.isAvailable}
            >
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClothingDetail;
