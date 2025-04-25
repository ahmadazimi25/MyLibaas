import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Rating,
  TextField,
  Paper,
  Stack
} from '@mui/material';

const ReviewForm = ({ onSubmit, initialRating = 0 }) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Overall Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              precision={0.5}
              size="large"
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Your Review
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this item..."
              variant="outlined"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={!rating || !comment}
            sx={{ alignSelf: 'flex-start' }}
          >
            Submit Review
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default ReviewForm;
