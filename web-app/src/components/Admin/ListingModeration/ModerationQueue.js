import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Flag as FlagIcon,
  Image as ImageIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useDatabase } from '../../../hooks/useDatabase';

const ModerationQueue = () => {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [moderationDialog, setModerationDialog] = useState(null);
  const [moderationNote, setModerationNote] = useState('');
  const { getPendingListings, moderateListing } = useDatabase();

  useEffect(() => {
    loadPendingListings();
  }, []);

  const loadPendingListings = async () => {
    const pendingListings = await getPendingListings();
    setListings(pendingListings);
  };

  const handleModeration = async (listingId, action, note = '') => {
    await moderateListing(listingId, action, note);
    loadPendingListings();
    setModerationDialog(null);
    setModerationNote('');
  };

  const ModerationDialog = () => {
    if (!selectedListing || !moderationDialog) return null;

    const actions = {
      reject: {
        title: 'Reject Listing',
        message: 'Provide reason for rejection:',
        action: () => handleModeration(selectedListing.id, 'rejected', moderationNote)
      },
      flag: {
        title: 'Flag for Review',
        message: 'Add review notes:',
        action: () => handleModeration(selectedListing.id, 'flagged', moderationNote)
      }
    };

    const currentAction = actions[moderationDialog];

    return (
      <Dialog open={true} onClose={() => setModerationDialog(null)}>
        <DialogTitle>{currentAction.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {currentAction.message}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={moderationNote}
            onChange={(e) => setModerationNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerationDialog(null)}>Cancel</Button>
          <Button 
            onClick={currentAction.action}
            variant="contained" 
            color={moderationDialog === 'reject' ? 'error' : 'warning'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const ListingCard = ({ listing }) => {
    const hasWarnings = listing.autoModeration?.warnings || [];
    
    return (
      <Card>
        <CardMedia
          component="img"
          height="200"
          image={listing.images[0]}
          alt={listing.title}
        />
        <CardContent>
          <Typography variant="h6" noWrap>
            {listing.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            By {listing.ownerUsername}
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip 
              size="small" 
              label={`₹${listing.price}/day`}
              color="primary"
            />
            <Chip 
              size="small" 
              label={listing.category}
              variant="outlined"
            />
          </Stack>

          {hasWarnings.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {hasWarnings.map((warning, index) => (
                <Chip
                  key={index}
                  size="small"
                  icon={<WarningIcon />}
                  label={warning}
                  color="warning"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </CardContent>

        <CardActions>
          <Tooltip title="Approve">
            <IconButton 
              color="success"
              onClick={() => handleModeration(listing.id, 'approved')}
            >
              <ApproveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton 
              color="error"
              onClick={() => {
                setSelectedListing(listing);
                setModerationDialog('reject');
              }}
            >
              <RejectIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Flag for Review">
            <IconButton 
              color="warning"
              onClick={() => {
                setSelectedListing(listing);
                setModerationDialog('flag');
              }}
            >
              <FlagIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View All Images">
            <IconButton>
              <ImageIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">
          Moderation Queue
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {listings.length} items pending review
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing.id}>
            <ListingCard listing={listing} />
          </Grid>
        ))}
      </Grid>

      <ModerationDialog />
    </Box>
  );
};

export default ModerationQueue;
