import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  Rating,
  Stack,
  IconButton,
  Avatar,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  NavigateBefore,
  NavigateNext,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useProduct } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ImageGallery = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'relative',
            paddingTop: '133%', // 4:3 aspect ratio
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => setShowDialog(true)}
        >
          <Box
            component="img"
            src={images[currentImageIndex].url}
            alt={images[currentImageIndex].alt}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        {/* Navigation arrows */}
        <IconButton
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' },
          }}
          onClick={handlePrevImage}
        >
          <NavigateBefore />
        </IconButton>
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' },
          }}
          onClick={handleNextImage}
        >
          <NavigateNext />
        </IconButton>

        {/* Thumbnail strip */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === currentImageIndex ? '2px solid white' : 'none',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
            >
              <Box
                component="img"
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Fullscreen dialog */}
      <Dialog
        fullScreen={isMobile}
        maxWidth="lg"
        open={showDialog}
        onClose={() => setShowDialog(false)}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              bgcolor: 'background.paper',
            }}
            onClick={() => setShowDialog(false)}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ p: 0 }}>
            <Box
              component="img"
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt}
              sx={{
                width: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProduct, loading, error, fetchProduct } = useProduct();
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    fetchProduct(id);
  }, [id, fetchProduct]);

  const handleBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/items/${id}` } });
      return;
    }
    // TODO: Implement booking flow
    navigate(`/booking/${id}`, {
      state: {
        dates: selectedDates,
      },
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={600} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/browse')}
            sx={{ mt: 2 }}
          >
            Back to Browse
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!currentProduct) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left column - Images */}
        <Grid item xs={12} md={7}>
          <ImageGallery images={currentProduct.images} />
        </Grid>

        {/* Right column - Details */}
        <Grid item xs={12} md={5}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {currentProduct.title}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Rating value={currentProduct.lender.rating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({currentProduct.lender.reviews} reviews)
              </Typography>
            </Stack>

            {/* Tags */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
              {currentProduct.occasion.map((occ) => (
                <Chip key={occ} label={occ} size="small" />
              ))}
              <Chip label={currentProduct.season} size="small" />
              {currentProduct.style.map((style) => (
                <Chip key={style} label={style} size="small" />
              ))}
            </Stack>

            {/* Pricing */}
            <Paper sx={{ p: 3, mb: 3 }} elevation={0} variant="outlined">
              <Typography variant="h5" gutterBottom>
                ${currentProduct.pricing.dailyRate}
                <Typography
                  component="span"
                  variant="body1"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  per day
                </Typography>
              </Typography>

              <Stack spacing={1}>
                <Typography variant="body2">
                  Weekly rate: ${currentProduct.pricing.weeklyRate}
                </Typography>
                <Typography variant="body2">
                  Event rate (3-4 days): ${currentProduct.pricing.eventRate}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  Security deposit: ${currentProduct.pricing.securityDeposit}
                </Typography>
                <Typography variant="body2">
                  Cleaning fee: ${currentProduct.pricing.cleaningFee}
                </Typography>
              </Stack>
            </Paper>

            {/* Dates */}
            <Paper sx={{ p: 3, mb: 3 }} elevation={0} variant="outlined">
              <Typography variant="h6" gutterBottom>
                Select Dates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Start Date"
                    value={selectedDates.startDate}
                    onChange={(date) =>
                      setSelectedDates((prev) => ({ ...prev, startDate: date }))
                    }
                    slotProps={{
                      textField: { fullWidth: true, size: 'small' },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={selectedDates.endDate}
                    onChange={(date) =>
                      setSelectedDates((prev) => ({ ...prev, endDate: date }))
                    }
                    slotProps={{
                      textField: { fullWidth: true, size: 'small' },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Shipping */}
            <Paper sx={{ p: 3, mb: 3 }} elevation={0} variant="outlined">
              <Typography variant="h6" gutterBottom>
                Delivery Options
              </Typography>
              <Stack spacing={2}>
                {currentProduct.shipping.shipping && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ShippingIcon color="action" />
                    <Box>
                      <Typography variant="body1">Shipping</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${currentProduct.shipping.shippingFee} shipping fee
                      </Typography>
                    </Box>
                  </Stack>
                )}
                {currentProduct.shipping.localPickup && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <StoreIcon color="action" />
                    <Box>
                      <Typography variant="body1">Local Pickup</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available in select locations
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Paper>

            {/* Lender */}
            <Paper sx={{ p: 3, mb: 3 }} elevation={0} variant="outlined">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={`https://i.pravatar.cc/150?u=${currentProduct.lenderId}`}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6">{currentProduct.lender.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Response rate: {currentProduct.lender.responseRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Response time: {currentProduct.lender.responseTime}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Book Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleBooking}
              startIcon={<CalendarIcon />}
              disabled={!selectedDates.startDate || !selectedDates.endDate}
            >
              Book Now
            </Button>
          </Box>
        </Grid>

        {/* Description Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }} elevation={0} variant="outlined">
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentProduct.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Item Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">Size</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentProduct.size.category} - {currentProduct.size.standard}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Condition</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentProduct.condition.rating}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Brand</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentProduct.brand}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Measurements
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Bust: {currentProduct.size.measurements.bust} cm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Waist: {currentProduct.size.measurements.waist} cm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hips: {currentProduct.size.measurements.hips} cm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Length: {currentProduct.size.measurements.length} cm
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;
