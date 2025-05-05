import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Rating,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Star as StarIcon
} from '@mui/icons-material';

const SecureProfile = ({ user, isPublicView = true }) => {
  // Only show safe, non-personal information
  const publicInfo = {
    username: user.username,
    memberSince: new Date(user.createdAt).toLocaleDateString(),
    rating: user.rating || 0,
    totalRentals: user.totalRentals || 0,
    responseRate: user.responseRate || 0,
    verificationBadges: user.verificationBadges || [],
    reviews: user.reviews || []
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      {/* Profile Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Avatar
          src={user.avatar}
          alt={user.username}
          sx={{ width: 64, height: 64 }}
        />
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">{publicInfo.username}</Typography>
            {user.isVerified && (
              <VerifiedIcon color="primary" sx={{ width: 20 }} />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Member since {publicInfo.memberSince}
          </Typography>
        </Box>
      </Stack>

      {/* Verification Badges */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {publicInfo.verificationBadges.map((badge, index) => (
          <Chip
            key={index}
            label={badge}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Stats */}
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Rating
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={publicInfo.rating} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              ({publicInfo.totalRentals} rentals)
            </Typography>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Response Rate
          </Typography>
          <Typography variant="body1">
            {publicInfo.responseRate}% response rate
          </Typography>
        </Box>

        {/* Recent Reviews (Limited) */}
        {publicInfo.reviews.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Recent Reviews
            </Typography>
            <Stack spacing={2}>
              {publicInfo.reviews.slice(0, 3).map((review, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <StarIcon color="primary" sx={{ width: 16 }} />
                    <Typography variant="body2">
                      {review.rating} • {new Date(review.date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {review.comment}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Trust & Safety Notice */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          For your safety, never share personal contact information. All communication and transactions should happen through MyLibaas.
        </Typography>
      </Box>
    </Paper>
  );
};

export default SecureProfile;
