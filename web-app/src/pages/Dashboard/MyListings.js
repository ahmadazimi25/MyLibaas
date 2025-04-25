import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  active: 'success',
  paused: 'warning',
  deleted: 'error',
};

const ListingCard = ({ listing, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status) => {
    handleMenuClose();
    if (status === 'deleted') {
      setDeleteDialogOpen(true);
    } else {
      onStatusChange(listing.id, status);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onStatusChange(listing.id, 'deleted');
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Box
            component="img"
            src={listing.images[0].url}
            alt={listing.title}
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  {listing.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {listing.description}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleMenuClick}
                aria-label="listing options"
              >
                <MoreIcon />
              </IconButton>
            </Stack>

            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Price per day
                  </Typography>
                  <Typography variant="h6">${listing.price}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Earnings
                  </Typography>
                  <Typography variant="h6">
                    ${listing.totalEarnings}
                  </Typography>
                </Grid>
              </Grid>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {listing.totalBookings} bookings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.rating} rating
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={
                  listing.status.charAt(0).toUpperCase() +
                  listing.status.slice(1)
                }
                color={statusColors[listing.status]}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                Created {listing.createdAt.toLocaleDateString()}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => handleStatusChange('active')}
          disabled={listing.status === 'active'}
        >
          Activate Listing
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('paused')}
          disabled={listing.status === 'paused'}
        >
          Pause Listing
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange('deleted')}
          disabled={listing.status === 'deleted'}
        >
          Delete Listing
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this listing? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    userListings,
    loading,
    error,
    fetchUserListings,
    updateListingStatus,
  } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchUserListings(user.id);
    }
  }, [user, fetchUserListings]);

  const handleStatusChange = async (listingId, status) => {
    await updateListingStatus(listingId, status);
  };

  const filteredListings = userListings.filter((listing) => {
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="h6">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Typography variant="h4">My Listings</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create-listing')}
        >
          Create New Listing
        </Button>
      </Stack>

      {/* Filters */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <TextField
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button
          startIcon={<FilterIcon />}
          onClick={(e) =>
            setStatusFilter(
              statusFilter === 'all'
                ? 'active'
                : statusFilter === 'active'
                ? 'paused'
                : 'all'
            )
          }
          variant={statusFilter !== 'all' ? 'contained' : 'outlined'}
        >
          {statusFilter === 'all'
            ? 'All Status'
            : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
        </Button>
      </Stack>

      {/* Listings Grid */}
      <Grid container spacing={3}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} key={listing.id}>
            <ListingCard
              listing={listing}
              onStatusChange={handleStatusChange}
            />
          </Grid>
        ))}
        {filteredListings.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No listings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : "You haven't created any listings yet"}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/create-listing')}
                  sx={{ mt: 2 }}
                >
                  Create Your First Listing
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MyListings;
