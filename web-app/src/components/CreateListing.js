import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  InputAdornment,
  MenuItem,
  IconButton,
  CircularProgress
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ImageUploadService from '../services/ImageUploadService';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const OCCASIONS = ['Casual', 'Formal', 'Wedding', 'Party', 'Traditional', 'Business'];

const CreateListing = ({ open, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    size: '',
    occasion: '',
    pricePerDay: '',
    minRentalDays: 1,
    maxRentalDays: 30,
    deposit: '',
    condition: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      setUploadProgress(0);

      // First upload images to Cloudinary
      const uploadedImageUrls = await ImageUploadService.uploadMultipleImages(images);
      setUploadedImages(uploadedImageUrls);
      setUploadProgress(50);

      // Then create the listing with the image URLs
      const listingData = {
        ...formData,
        images: uploadedImageUrls.map(img => img.url),
        userId: user.uid
      };

      await axios.post('http://localhost:5000/api/clothing', listingData);
      setUploadProgress(100);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontFamily: "'DM Serif Display', serif" }}>
        Create New Listing
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCamera />}
                sx={{ height: 100 }}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {images.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {images.length} image(s) selected
                </Typography>
              )}
              {uploadProgress > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Uploading images ({uploadProgress}%)
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                fullWidth
                required
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="size"
                label="Size"
                select
                fullWidth
                required
                value={formData.size}
                onChange={handleChange}
              >
                {SIZES.map(size => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="occasion"
                label="Occasion"
                select
                fullWidth
                required
                value={formData.occasion}
                onChange={handleChange}
              >
                {OCCASIONS.map(occasion => (
                  <MenuItem key={occasion} value={occasion}>
                    {occasion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="pricePerDay"
                label="Price per Day"
                type="number"
                fullWidth
                required
                value={formData.pricePerDay}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="deposit"
                label="Security Deposit"
                type="number"
                fullWidth
                required
                value={formData.deposit}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="minRentalDays"
                label="Minimum Rental Days"
                type="number"
                fullWidth
                required
                value={formData.minRentalDays}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="maxRentalDays"
                label="Maximum Rental Days"
                type="number"
                fullWidth
                required
                value={formData.maxRentalDays}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="condition"
                label="Item Condition"
                fullWidth
                required
                value={formData.condition}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="location"
                label="Location"
                fullWidth
                required
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateListing;
