import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Grid,
  Paper,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ListingReviewService } from '../../services/listingReviewService';

const steps = ['Photos', 'Basic Info', 'Details', 'Pricing'];

const conditions = [
  { value: 'new', label: 'New with tags' },
  { value: 'like_new', label: 'Like new' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const ListingSubmission = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [listing, setListing] = useState({
    photos: [],
    details: {
      title: '',
      description: '',
      category: '',
      subCategory: '',
      brand: '',
      size: '',
      color: '',
      fabric: '',
      measurements: {
        bust: '',
        waist: '',
        hips: '',
        length: '',
        shoulders: '',
        sleeves: '',
      },
      careInstructions: '',
      originalPrice: '',
      itemAge: '',
      condition: '',
    },
    pricing: {
      rentalPrice: {
        daily: '',
        weekly: '',
        monthly: '',
      },
      securityDeposit: '',
      insuranceRequired: true,
    },
    safetyInfo: {
      allergenFree: true,
      allergenNotes: '',
      storageMethod: '',
    },
  });

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const validation = await ListingReviewService.validateImage(file);
        if (!validation.resolution.passed || !validation.fileSize.passed) {
          throw new Error(\`\${file.name}: \${validation.resolution.passed ? '' : validation.resolution.message} \${validation.fileSize.passed ? '' : validation.fileSize.message}\`);
        }
        return file;
      });

      const validatedFiles = await Promise.all(uploadPromises);
      setListing(prev => ({
        ...prev,
        photos: [...prev.photos, ...validatedFiles.map(file => ({
          file,
          preview: URL.createObjectURL(file),
          type: prev.photos.length === 0 ? 'front' : 'other'
        }))]
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoDelete = (index) => {
    setListing(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleDetailsChange = (field, value) => {
    setListing(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }));
  };

  const handleMeasurementChange = (field, value) => {
    setListing(prev => ({
      ...prev,
      details: {
        ...prev.details,
        measurements: {
          ...prev.details.measurements,
          [field]: value
        }
      }
    }));
  };

  const handlePricingChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setListing(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [parent]: {
            ...prev.pricing[parent],
            [child]: value
          }
        }
      }));
    } else {
      setListing(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: value
        }
      }));
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Upload photos first
      const photoUploads = await Promise.all(
        listing.photos.map((photo, index) => 
          ListingReviewService.uploadListingImage(
            photo.file,
            'temp_' + Date.now(), // Will be updated with actual listing ID
            photo.type
          )
        )
      );

      const listingData = {
        ...listing,
        photos: photoUploads,
        userId: user.uid,
        status: 'submitted',
        created: new Date(),
        updated: new Date(),
      };

      const { status, checks } = await ListingReviewService.submitForReview(listingData);
      
      if (status === 'needs_changes') {
        setError('Please review and fix the following issues before submitting.');
        setActiveStep(0);
      } else {
        setSuccess('Listing submitted successfully and is pending review!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPhotosStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Photos
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Upload at least 4 high-quality photos (min 1920x1080, max 5MB each).
        First photo will be the main listing image.
      </Alert>
      
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="photo-upload"
        multiple
        type="file"
        onChange={handlePhotoUpload}
      />
      <label htmlFor="photo-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<UploadIcon />}
          disabled={loading}
        >
          Upload Photos
        </Button>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {listing.photos.map((photo, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Paper
              sx={{
                position: 'relative',
                paddingTop: '100%',
                overflow: 'hidden',
              }}
            >
              <img
                src={photo.preview}
                alt={`Upload ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
                size="small"
                onClick={() => handlePhotoDelete(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderBasicInfoStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Title"
            value={listing.details.title}
            onChange={(e) => handleDetailsChange('title', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={listing.details.description}
            onChange={(e) => handleDetailsChange('description', e.target.value)}
            required
            helperText="Minimum 100 characters"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Brand"
            value={listing.details.brand}
            onChange={(e) => handleDetailsChange('brand', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Size"
            value={listing.details.size}
            onChange={(e) => handleDetailsChange('size', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Color"
            value={listing.details.color}
            onChange={(e) => handleDetailsChange('color', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Condition"
            value={listing.details.condition}
            onChange={(e) => handleDetailsChange('condition', e.target.value)}
            required
          >
            {conditions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );

  const renderDetailsStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Detailed Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Fabric Composition"
            value={listing.details.fabric}
            onChange={(e) => handleDetailsChange('fabric', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Care Instructions"
            value={listing.details.careInstructions}
            onChange={(e) => handleDetailsChange('careInstructions', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Measurements (in inches)
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(listing.details.measurements).map((measurement) => (
              <Grid item xs={6} sm={4} key={measurement}>
                <TextField
                  fullWidth
                  label={measurement.charAt(0).toUpperCase() + measurement.slice(1)}
                  type="number"
                  value={listing.details.measurements[measurement]}
                  onChange={(e) => handleMeasurementChange(measurement, e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">in</InputAdornment>,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPricingStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pricing Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Original Price"
            type="number"
            value={listing.details.originalPrice}
            onChange={(e) => handleDetailsChange('originalPrice', e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Daily Rental Price"
            type="number"
            value={listing.pricing.rentalPrice.daily}
            onChange={(e) => handlePricingChange('rentalPrice.daily', e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Weekly Rental Price"
            type="number"
            value={listing.pricing.rentalPrice.weekly}
            onChange={(e) => handlePricingChange('rentalPrice.weekly', e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Monthly Rental Price"
            type="number"
            value={listing.pricing.rentalPrice.monthly}
            onChange={(e) => handlePricingChange('rentalPrice.monthly', e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Security Deposit"
            type="number"
            value={listing.pricing.securityDeposit}
            onChange={(e) => handlePricingChange('securityDeposit', e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPhotosStep();
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderDetailsStep();
      case 3:
        return renderPricingStep();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Listing
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        ) : (
          <>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Submit Listing
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ListingSubmission;
