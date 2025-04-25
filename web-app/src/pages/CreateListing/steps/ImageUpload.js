import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Paper,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useListing } from '../../../contexts/ListingContext';

const ImageUpload = () => {
  const {
    listingData,
    handleImageUpload,
    removeImage,
    setPrimaryImage,
    loading,
    errors,
  } = useListing();

  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      const files = e.dataTransfer?.files || e.target.files;
      if (files) {
        await handleImageUpload(files);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Photos
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add up to 10 photos. The first photo will be your listing's cover image.
        Drag and drop photos or click to upload.
      </Typography>

      {/* Upload Area */}
      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: 'background.default',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        onDrop={onDrop}
        onDragOver={handleDragOver}
        component="label"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={onDrop}
          disabled={loading}
        />
        <Stack spacing={2} alignItems="center">
          <UploadIcon color="primary" sx={{ fontSize: 48 }} />
          <Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              'Drag and drop your photos here, or click to select'
            )}
          </Typography>
          <Button variant="contained" component="span" disabled={loading}>
            Choose Photos
          </Button>
        </Stack>
      </Paper>

      {errors.images && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {errors.images}
        </Typography>
      )}

      {/* Image Preview Grid */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {listingData.images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              sx={{
                position: 'relative',
                paddingTop: '133%', // 4:3 aspect ratio
                backgroundColor: 'background.default',
              }}
              elevation={1}
            >
              <Box
                component="img"
                src={image.url}
                alt={image.alt}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Image Actions */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  p: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setPrimaryImage(index)}
                  sx={{ color: 'white' }}
                >
                  {image.isPrimary ? (
                    <StarIcon />
                  ) : (
                    <StarBorderIcon />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => removeImage(index)}
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              {/* Primary Label */}
              {image.isPrimary && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    background:
                      'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'white' }}
                  >
                    Cover Photo
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImageUpload;
