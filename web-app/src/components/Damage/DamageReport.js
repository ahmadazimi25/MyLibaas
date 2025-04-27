import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDamage } from '../../contexts/DamageContext';

const damageTypes = [
  { value: 'structural', label: 'Structural (tears, holes, broken parts)' },
  { value: 'stains', label: 'Stains or Discoloration' },
  { value: 'missing', label: 'Missing Parts or Accessories' },
  { value: 'other', label: 'Other Damage' },
];

const Camera = ({ onCapture, onClose }) => {
  const videoRef = React.useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError('Failed to access camera');
    }
  };

  const handleCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const image = canvas.toDataURL('image/jpeg');
    onCapture(image);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Take Photo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center">
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleCapture}
                startIcon={<CameraIcon />}
              >
                Capture
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const DamageReport = ({ bookingId, itemId, onSubmit, onCancel }) => {
  const { submitDamageReport, loading, error } = useDamage();
  const [formData, setFormData] = useState({
    description: '',
    damageType: '',
    images: [],
    estimatedCost: '',
    insuranceClaim: false,
  });
  const [showCamera, setShowCamera] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const images = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...images],
    }));
  };

  const handleCameraCapture = (image) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, image],
    }));
    setShowCamera(false);
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await submitDamageReport({
      bookingId,
      itemId,
      ...formData,
    });

    if (result.success) {
      onSubmit(result);
    }
  };

  const videoRef = React.useRef(null);
  const [stream, setStream] = useState(null);

  const initializeCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, []);

  React.useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, initializeCamera]);

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Report Damage
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          select
          label="Type of Damage"
          value={formData.damageType}
          onChange={handleChange('damageType')}
          required
          fullWidth
        >
          {damageTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Damage Description"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange('description')}
          required
          fullWidth
          placeholder="Please provide a detailed description of the damage..."
        />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Damage Photos
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CameraIcon />}
              onClick={() => setShowCamera(true)}
            >
              Take Photo
            </Button>
            <Button
              variant="outlined"
              startIcon={<GalleryIcon />}
              component="label"
            >
              Upload Photos
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {formData.images.map((image, index) => (
              <Box
                key={index}
                sx={{ position: 'relative', width: 100, height: 100 }}
              >
                <Box
                  component="img"
                  src={image}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'background.paper',
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>

        <TextField
          label="Estimated Cost of Damage ($)"
          type="number"
          value={formData.estimatedCost}
          onChange={handleChange('estimatedCost')}
          required
          fullWidth
          inputProps={{ min: 0, step: 0.01 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.insuranceClaim}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  insuranceClaim: e.target.checked,
                }))
              }
            />
          }
          label="File an insurance claim for this damage"
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.images.length}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Report'}
          </Button>
        </Stack>
      </Stack>

      {showCamera && (
        <Camera
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Paper>
  );
};

export default DamageReport;
