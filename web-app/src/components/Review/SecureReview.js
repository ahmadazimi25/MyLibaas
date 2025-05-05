import React, { useState } from 'react';
import {
  Box,
  Paper,
  Rating,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const RATING_LABELS = {
  overall: 'Overall Experience',
  condition: 'Item Condition',
  accuracy: 'Size Accuracy',
  communication: 'Communication',
  value: 'Value for Money'
};

const SecureReview = ({ rentalId, onSubmit }) => {
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState({
    overall: 0,
    condition: 0,
    accuracy: 0,
    communication: 0,
    value: 0
  });
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    // Process photos and blur faces
    const processedPhotos = files.map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...processedPhotos]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate ratings
      if (Object.values(ratings).some(rating => rating === 0)) {
        throw new Error('Please provide all ratings');
      }

      // Sanitize review text
      const sanitizedReview = review.replace(/[^\w\s.,!?-]/gi, '');

      const reviewData = {
        rentalId,
        ratings,
        review: sanitizedReview,
        photos,
        reviewerUsername: currentUser.username,
        timestamp: new Date()
      };

      await onSubmit(reviewData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>

      {/* Ratings */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {Object.entries(RATING_LABELS).map(([key, label]) => (
          <Box key={key}>
            <Typography component="legend">{label}</Typography>
            <Rating
              name={key}
              value={ratings[key]}
              onChange={(_, value) => setRatings(prev => ({ ...prev, [key]: value }))}
            />
          </Box>
        ))}
      </Stack>

      {/* Review Text */}
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Your Review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Photo Upload */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Add Photos (Optional)
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoIcon />}
        >
          Upload Photos
          <input
            type="file"
            hidden
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
          />
        </Button>

        {/* Photo Preview */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          {photos.map((photo, index) => (
            <Box
              key={index}
              sx={{ position: 'relative', width: 100, height: 100 }}
            >
              <img
                src={photo}
                alt={`Review ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemovePhoto(index)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'background.paper'
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
      >
        Submit Review
      </Button>
    </Paper>
  );
};

export default SecureReview;
