import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const statusColors = {
  draft: 'default',
  submitted: 'info',
  in_review: 'warning',
  needs_changes: 'error',
  approved: 'success',
  rejected: 'error',
};

const statusIcons = {
  draft: null,
  submitted: <CheckIcon />,
  in_review: <WarningIcon />,
  needs_changes: <ErrorIcon />,
  approved: <CheckIcon />,
  rejected: <ErrorIcon />,
};

const ListingManagement = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const listingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setListings(listingsData);
    } catch (err) {
      setError('Failed to fetch listings');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, listing) => {
    setAnchorEl(event.currentTarget);
    setSelectedListing(listing);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedListing(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedListing) return;

    try {
      await deleteDoc(doc(db, 'listings', selectedListing.id));
      setListings(prevListings => 
        prevListings.filter(listing => listing.id !== selectedListing.id)
      );
      setDeleteDialogOpen(false);
      setDeleteReason('');
    } catch (err) {
      setError('Failed to delete listing');
      console.error('Error deleting listing:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filterListings = (listings) => {
    switch (selectedTab) {
      case 0: // All
        return listings;
      case 1: // Active
        return listings.filter(listing => listing.status === 'approved');
      case 2: // Pending
        return listings.filter(listing => 
          ['submitted', 'in_review'].includes(listing.status)
        );
      case 3: // Needs Attention
        return listings.filter(listing => 
          ['needs_changes', 'rejected'].includes(listing.status)
        );
      case 4: // Draft
        return listings.filter(listing => listing.status === 'draft');
      default:
        return listings;
    }
  };

  const renderListingCard = (listing) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={listing.photos[0]?.url || '/placeholder.jpg'}
        alt={listing.details.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" gutterBottom noWrap sx={{ maxWidth: '80%' }}>
            {listing.details.title}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, listing)}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        <Chip
          icon={statusIcons[listing.status]}
          label={getStatusLabel(listing.status)}
          color={statusColors[listing.status]}
          size="small"
          sx={{ mb: 1 }}
        />

        <Typography variant="body2" color="text.secondary" paragraph>
          {listing.details.description.substring(0, 100)}...
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Daily Rate
            </Typography>
            <Typography variant="body2">
              ${listing.pricing.rentalPrice.daily}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Quality Score
            </Typography>
            <Typography variant="body2">
              {listing.qualityScore || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button
          size="small"
          startIcon={<ViewIcon />}
          onClick={() => {/* Navigate to listing details */}}
        >
          View
        </Button>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => {/* Navigate to edit listing */}}
        >
          Edit
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">
            My Listings
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {/* Navigate to create listing */}}
          >
            Create New Listing
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label={`All (${listings.length})`} />
          <Tab label={`Active (${listings.filter(l => l.status === 'approved').length})`} />
          <Tab label={`Pending (${listings.filter(l => ['submitted', 'in_review'].includes(l.status)).length})`} />
          <Tab label={`Needs Attention (${listings.filter(l => ['needs_changes', 'rejected'].includes(l.status)).length})`} />
          <Tab label={`Drafts (${listings.filter(l => l.status === 'draft').length})`} />
        </Tabs>

        <Grid container spacing={3}>
          {filterListings(listings).map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              {renderListingCard(listing)}
            </Grid>
          ))}
        </Grid>

        {filterListings(listings).length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No listings found in this category
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Listing Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {/* Navigate to view listing */}}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => {/* Navigate to edit listing */}}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Listing
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Listing
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to delete this listing? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            label="Reason for deletion (optional)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListingManagement;
