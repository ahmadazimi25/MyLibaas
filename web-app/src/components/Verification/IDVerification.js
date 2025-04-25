import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useVerification } from '../../contexts/VerificationContext';
import { useAuth } from '../../contexts/AuthContext';

const documentTypes = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
];

const steps = ['Document Type', 'Document Upload', 'Selfie', 'Address'];

const Camera = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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

const IDVerification = () => {
  const { user } = useAuth();
  const { submitVerification, loading, error } = useVerification();
  const [activeStep, setActiveStep] = useState(0);
  const [documentType, setDocumentType] = useState('');
  const [documentImages, setDocumentImages] = useState([]);
  const [selfieImage, setSelfieImage] = useState(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState(null);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const images = files.map((file) => URL.createObjectURL(file));
    if (cameraMode === 'document') {
      setDocumentImages((prev) => [...prev, ...images]);
    } else {
      setSelfieImage(images[0]);
    }
  };

  const handleCameraCapture = (image) => {
    if (cameraMode === 'document') {
      setDocumentImages((prev) => [...prev, image]);
    } else {
      setSelfieImage(image);
    }
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    const result = await submitVerification({
      userId: user.id,
      documentType,
      documentImages,
      selfieImage,
      address,
    });

    if (result.success) {
      // Handle success (e.g., redirect or show success message)
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TextField
            select
            fullWidth
            label="Document Type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            {documentTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1">
              Upload clear photos of your {documentType.replace('_', ' ')}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={() => {
                  setCameraMode('document');
                  setShowCamera(true);
                }}
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
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {documentImages.map((image, index) => (
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
                    onClick={() =>
                      setDocumentImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1">
              Take a selfie holding your ID
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={() => {
                  setCameraMode('selfie');
                  setShowCamera(true);
                }}
              >
                Take Selfie
              </Button>
              <Button
                variant="outlined"
                startIcon={<GalleryIcon />}
                component="label"
              >
                Upload Selfie
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Stack>
            {selfieImage && (
              <Box sx={{ position: 'relative', width: 200, height: 200 }}>
                <Box
                  component="img"
                  src={selfieImage}
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
                  onClick={() => setSelfieImage(null)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1">
              Enter your current address
            </Typography>
            <TextField
              label="Street Address"
              value={address.street}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, street: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="City"
              value={address.city}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, city: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="State/Province"
              value={address.state}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, state: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Postal Code"
              value={address.postalCode}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  postalCode: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Country"
              value={address.country}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, country: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ID Verification
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, mb: 4 }}>{getStepContent(activeStep)}</Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            Submit Verification
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
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

export default IDVerification;
