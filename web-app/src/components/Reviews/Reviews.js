import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Stack,
  Avatar,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Pagination,
  Alert,
  Divider,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Flag as FlagIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';

const RatingBreakdown = ({ breakdown, totalReviews }) => {
  return (
    <Stack spacing={1} sx={{ width: '100%', maxWidth: 300 }}>
      {[5, 4, 3, 2, 1].map((stars) => (
        <Stack
          key={stars}
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <Typography variant="body2" sx={{ minWidth: 10 }}>
            {stars}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(breakdown[stars] / totalReviews) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              flexGrow: 1,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'warning.main',
              },
            }}
          />
          <Typography variant="body2" sx={{ minWidth: 30 }}>
            {breakdown[stars]}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

const ReviewForm = ({ targetType, targetId, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please provide a rating');
      return;
    }

    const success = await onSubmit({
      rating,
      comment,
      images,
    });

    if (success) {
      onClose();
    }
  };

  // TODO: Implement image upload
  const handleImageUpload = () => {
    // Implement image upload logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Box>
          <Typography gutterBottom>Your Rating</Typography>
          <Rating
            value={rating}
            onChange={(e, value) => setRating(value)}
            size="large"
          />
          {error && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Box>

        <TextField
          label="Your Review"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
        />

        <Box>
          <Button
            startIcon={<ImageIcon />}
            onClick={handleImageUpload}
            variant="outlined"
          >
            Add Photos
          </Button>
        </Box>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Stack>
    </form>
  );
};

const ReviewCard = ({ review, onHelpful, onReport }) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReport = async () => {
    await onReport(review.id, reportReason);
    setReportDialogOpen(false);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={review.reviewer.avatar} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{review.reviewer.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {review.createdAt.toLocaleDateString()}
            </Typography>
          </Box>
          <Rating value={review.rating} readOnly size="small" />
        </Stack>

        {/* Content */}
        <Typography variant="body1">{review.comment}</Typography>

        {/* Images */}
        {review.images?.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
            {review.images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`Review ${index + 1}`}
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            ))}
          </Stack>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ThumbUpIcon />}
            size="small"
            onClick={() => onHelpful(review.id)}
            color={review.helpful ? 'primary' : 'inherit'}
          >
            Helpful ({review.helpful})
          </Button>
          <IconButton
            size="small"
            onClick={() => setReportDialogOpen(true)}
            color={review.reported ? 'error' : 'inherit'}
          >
            <FlagIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
      >
        <DialogTitle>Report Review</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for reporting"
            fullWidth
            multiline
            rows={3}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReport} color="error">
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const Reviews = ({ targetType, targetId }) => {
  const { user } = useAuth();
  const {
    loading,
    error,
    getReviews,
    getUserRating,
    createReview,
    markHelpful,
    reportReview,
  } = useReview();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [reviewsRes, ratingRes] = await Promise.all([
        getReviews({ targetType, targetId, page }),
        getUserRating(targetId),
      ]);

      if (reviewsRes.success) {
        setReviews(reviewsRes.data.reviews);
        setTotalPages(reviewsRes.data.totalPages);
      }

      if (ratingRes.success) {
        setRating(ratingRes.data);
      }
    };

    fetchData();
  }, [targetType, targetId, page, getReviews, getUserRating]);

  const handleCreateReview = async (reviewData) => {
    const result = await createReview({
      targetType,
      targetId,
      reviewerId: user.id,
      ...reviewData,
    });

    if (result.success) {
      // Refresh reviews
      const reviewsRes = await getReviews({ targetType, targetId, page: 1 });
      if (reviewsRes.success) {
        setReviews(reviewsRes.data.reviews);
        setTotalPages(reviewsRes.data.totalPages);
        setPage(1);
      }
      return true;
    }
    return false;
  };

  const handleHelpful = async (reviewId) => {
    await markHelpful(reviewId);
    // Update the helpful count in the local state
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
  };

  const handleReport = async (reviewId, reason) => {
    await reportReview(reviewId, reason);
    // Update the reported status in the local state
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, reported: true } : review
      )
    );
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={4}>
      {/* Overall Rating */}
      {rating && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h3">
                  {rating.rating.toFixed(1)}
                </Typography>
                <Rating value={rating.rating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {rating.totalReviews} reviews
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <RatingBreakdown
                breakdown={rating.breakdown}
                totalReviews={rating.totalReviews}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Write Review Button */}
      <Box>
        <Button
          variant="contained"
          onClick={() => setReviewDialogOpen(true)}
        >
          Write a Review
        </Button>
      </Box>

      <Divider />

      {/* Reviews List */}
      <Stack spacing={2}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onHelpful={handleHelpful}
            onReport={handleReport}
          />
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
          />
        </Box>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <ReviewForm
            targetType={targetType}
            targetId={targetId}
            onSubmit={handleCreateReview}
            onClose={() => setReviewDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default Reviews;
