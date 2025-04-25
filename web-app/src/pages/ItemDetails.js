import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Dialog,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import BookingForm from '../components/Booking/BookingForm';
import ReviewList from '../components/Review/ReviewList';
import CancellationPolicy from '../components/Booking/CancellationPolicy';
import { cancellationService } from '../services/cancellationService';

const ItemDetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would be parallel requests using Promise.all
        // Fetch item details
        // const itemResponse = await itemService.getItem(id);
        // setItem(itemResponse);

        // For demo, using mock data
        setItem({
          _id: id,
          title: 'Elegant Evening Gown',
          description: 'Beautiful black evening gown perfect for formal occasions.',
          images: ['/images/gown1.jpg', '/images/gown2.jpg'],
          price: 75,
          pricePerDay: 25,
          size: 'M',
          category: 'Formal',
          occasion: 'Evening',
          condition: 'Like New',
          owner: {
            _id: 'owner123',
            displayName: 'Sarah Johnson',
            photoURL: '/images/sarah.jpg',
            rating: 4.8,
            totalRentals: 47
          },
          rating: 4.5,
          totalReviews: 12,
          location: 'New York, NY'
        });

        // Fetch cancellation policy
        const policyResponse = await cancellationService.getItemPolicy(id);
        setPolicy(policyResponse);

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load item details');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Images */}
        <Grid item xs={12} md={7}>
          <Box sx={{ position: 'relative' }}>
            {/* Main Image */}
            <Box
              component="img"
              src={item.images[0]}
              alt={item.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                mb: 2
              }}
            />
            
            {/* Action Buttons */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                gap: 1
              }}
            >
              <IconButton
                sx={{ 
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: 'white' }
                }}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
              <IconButton
                sx={{ 
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: 'white' }
                }}
              >
                <ShareIcon />
              </IconButton>
            </Box>

            {/* Thumbnail Images */}
            <Grid container spacing={2}>
              {item.images.slice(1).map((image, index) => (
                <Grid item xs={3} key={index}>
                  <Box
                    component="img"
                    src={image}
                    alt={`${item.title} ${index + 2}`}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Box>
              <Typography variant="h4" gutterBottom>
                {item.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={item.rating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({item.totalReviews} reviews)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.location}
                </Typography>
              </Stack>
            </Box>

            {/* Price */}
            <Box>
              <Typography variant="h5" gutterBottom>
                ${item.pricePerDay}/day
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${item.price} retail price
              </Typography>
            </Box>

            {/* Item Details */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={item.category} />
                <Chip label={item.occasion} />
                <Chip label={item.condition} />
              </Box>
              <Typography variant="body1">
                {item.description}
              </Typography>
            </Stack>

            {/* Owner Info */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Listed by
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={item.owner.photoURL}
                  alt={item.owner.displayName}
                  sx={{ width: 48, height: 48 }}
                />
                <Box flex={1}>
                  <Typography variant="subtitle1">
                    {item.owner.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.owner.totalRentals} successful rentals
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  size="small"
                >
                  Message
                </Button>
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setBookingOpen(true)}
              >
                Rent Now
              </Button>
            </Box>

            {/* Cancellation Policy */}
            {policy && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Cancellation Policy
                </Typography>
                <CancellationPolicy policy={policy} />
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 4 }} />
          <ReviewList
            reviews={[]} // In real app, fetch reviews
            averageRating={item.rating}
            totalReviews={item.totalReviews}
          />
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Book "{item.title}"
          </Typography>
          <BookingForm
            item={item}
            cancellationPolicy={policy}
            onSubmit={(bookingData) => {
              console.log('Booking:', bookingData);
              setBookingOpen(false);
            }}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default ItemDetails;
