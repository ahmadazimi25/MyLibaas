import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  ImageList,
  ImageListItem,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CrossIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import ListingQualityScore from './ListingQualityScore';
import { ListingReviewService } from '../../services/listingReviewService';

const ModeratorReview = ({ listing }) => {
  const [review, setReview] = useState({
    notes: '',
    checklist: {
      photoAuthenticity: false,
      itemCondition: false,
      priceFairness: false,
      descriptionAccuracy: false,
      safetyCompliance: false,
    }
  });

  const [loading, setLoading] = useState(false);

  const handleChecklistChange = (field) => {
    setReview(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: !prev.checklist[field]
      }
    }));
  };

  const handleNotesChange = (event) => {
    setReview(prev => ({
      ...prev,
      notes: event.target.value
    }));
  };

  const isReviewComplete = () => {
    return Object.values(review.checklist).every(value => value) && review.notes.length > 0;
  };

  const handleAction = async (action) => {
    if (!isReviewComplete()) {
      alert('Please complete all checklist items and add review notes');
      return;
    }

    setLoading(true);
    try {
      switch (action) {
        case 'approve':
          await ListingReviewService.approveListing(listing.id, review);
          break;
        case 'reject':
          await ListingReviewService.rejectListing(listing.id, review);
          break;
        case 'request_changes':
          await ListingReviewService.requestChanges(listing.id, review);
          break;
      }
    } catch (error) {
      console.error('Error processing review:', error);
      alert('Failed to process review');
    } finally {
      setLoading(false);
    }
  };

  const renderAutomatedChecks = () => {
    if (!listing.automatedChecks) return null;

    const { checks } = listing.automatedChecks;
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Automated Checks
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(checks).map(([category, result]) => (
            <Grid item xs={12} sm={6} key={category}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
                {typeof result === 'object' ? (
                  Object.entries(result).map(([subCheck, subResult]) => (
                    <Box key={subCheck} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {subResult.passed ? (
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <CrossIcon color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body2">
                        {subCheck}: {subResult.message}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {result.passed ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <CrossIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="body2">{result.message}</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Listing Review
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Listing Preview */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Listing Preview
            </Typography>
            <ImageList cols={3} gap={8}>
              {listing.photos.map((photo) => (
                <ImageListItem key={photo.url}>
                  <img
                    src={photo.url}
                    alt={photo.type}
                    loading="lazy"
                  />
                  <Chip
                    label={photo.type}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {listing.details.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {listing.details.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Brand
                  </Typography>
                  <Typography variant="body2">
                    {listing.details.brand}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Size
                  </Typography>
                  <Typography variant="body2">
                    {listing.details.size}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Condition
                  </Typography>
                  <Typography variant="body2">
                    {listing.details.condition}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Original Price
                  </Typography>
                  <Typography variant="body2">
                    ${listing.details.originalPrice}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Automated Checks */}
          {renderAutomatedChecks()}

          {/* Review Checklist */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Checklist
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={review.checklist.photoAuthenticity}
                      onChange={() => handleChecklistChange('photoAuthenticity')}
                    />
                  }
                  label="Photos are authentic and clear"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={review.checklist.itemCondition}
                      onChange={() => handleChecklistChange('itemCondition')}
                    />
                  }
                  label="Item condition matches description"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={review.checklist.priceFairness}
                      onChange={() => handleChecklistChange('priceFairness')}
                    />
                  }
                  label="Pricing is fair and reasonable"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={review.checklist.descriptionAccuracy}
                      onChange={() => handleChecklistChange('descriptionAccuracy')}
                    />
                  }
                  label="Description is accurate and complete"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={review.checklist.safetyCompliance}
                      onChange={() => handleChecklistChange('safetyCompliance')}
                    />
                  }
                  label="Meets safety and hygiene standards"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Review Notes"
              value={review.notes}
              onChange={handleNotesChange}
              sx={{ mt: 3 }}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                disabled={!isReviewComplete() || loading}
                onClick={() => handleAction('approve')}
              >
                Approve Listing
              </Button>
              <Button
                variant="contained"
                color="warning"
                disabled={!isReviewComplete() || loading}
                onClick={() => handleAction('request_changes')}
              >
                Request Changes
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={!isReviewComplete() || loading}
                onClick={() => handleAction('reject')}
              >
                Reject Listing
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Quality Score */}
          <ListingQualityScore listing={listing} />

          {/* Status Information */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Listing Status
            </Typography>
            <Alert
              severity={
                listing.status === 'approved'
                  ? 'success'
                  : listing.status === 'rejected'
                  ? 'error'
                  : 'warning'
              }
              sx={{ mb: 2 }}
            >
              Status: {listing.status.replace('_', ' ').toUpperCase()}
            </Alert>
            {listing.moderatorReview && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Last Review:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(listing.moderatorReview.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {listing.moderatorReview.notes}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModeratorReview;
