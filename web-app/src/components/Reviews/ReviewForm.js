import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import { validateMessageContent, generateWarningMessage } from '../../utils/contentFilter';

const ReviewForm = ({ onSubmit, itemName, bookingId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate review content
    const validation = validateMessageContent(review);
    if (!validation.isValid) {
      setError(generateWarningMessage(validation.details));
      return;
    }

    // If content is clean, submit the review
    onSubmit({
      rating,
      review: validation.content,
      bookingId,
      timestamp: new Date(),
    });
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 3 }}
    >
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          Review your experience with {itemName}
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box>
          <Typography component="legend" gutterBottom>
            Rating
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            precision={0.5}
            size="large"
          />
        </Box>

        <TextField
          label="Your Review"
          multiline
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this item and the rental process..."
          helperText="Please keep your review focused on the item and rental experience. Do not include personal contact information."
          fullWidth
          required
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!rating || !review.trim()}
          >
            Submit Review
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ReviewForm;
