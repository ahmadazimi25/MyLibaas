import React from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Stack,
  Divider,
  Paper
} from '@mui/material';
import { format } from 'date-fns';

const ReviewItem = ({ review }) => {
  const {
    reviewer,
    rating,
    comment,
    createdAt
  } = review;

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          src={reviewer.photoURL}
          alt={reviewer.displayName}
          sx={{ width: 48, height: 48 }}
        />
        <Box flex={1}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight={500}>
              {reviewer.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(createdAt), 'MMM d, yyyy')}
            </Typography>
          </Stack>
          
          <Rating value={rating} readOnly precision={0.5} size="small" />
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
          >
            {comment}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

const ReviewList = ({ reviews = [], averageRating = 0, totalReviews = 0 }) => {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Customer Reviews
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Rating value={averageRating} readOnly precision={0.5} />
          <Typography variant="body2" color="text.secondary">
            {averageRating.toFixed(1)} out of 5
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={3} divider={<Divider />}>
        {reviews.map((review, index) => (
          <ReviewItem key={review._id || index} review={review} />
        ))}
        {reviews.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No reviews yet
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default ReviewList;
