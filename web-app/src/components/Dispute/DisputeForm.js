import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispute } from '../../contexts/DisputeContext';

const disputeTypes = [
  { value: 'item_condition', label: 'Item Condition' },
  { value: 'late_return', label: 'Late Return' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'cancellation', label: 'Cancellation' },
  { value: 'other', label: 'Other' },
];

const desiredOutcomes = [
  { value: 'refund', label: 'Full Refund' },
  { value: 'partial_refund', label: 'Partial Refund' },
  { value: 'replacement', label: 'Item Replacement' },
  { value: 'repair', label: 'Item Repair' },
  { value: 'other', label: 'Other Resolution' },
];

const DisputeForm = ({ bookingId, onSubmit, onCancel }) => {
  const { createDispute, loading, error } = useDispute();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    evidence: [],
    desiredOutcome: '',
    desiredOutcomeDetails: '',
  });

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
      evidence: [...prev.evidence, ...images],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await createDispute({
      bookingId,
      ...formData,
    });

    if (result.success) {
      onSubmit(result);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Open Dispute
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          select
          label="Type of Dispute"
          value={formData.type}
          onChange={handleChange('type')}
          required
          fullWidth
        >
          {disputeTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange('description')}
          required
          fullWidth
          placeholder="Please provide a detailed description of the issue..."
        />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Evidence
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<GalleryIcon />}
              component="label"
            >
              Upload Evidence
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
            {formData.evidence.map((image, index) => (
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
          select
          label="Desired Outcome"
          value={formData.desiredOutcome}
          onChange={handleChange('desiredOutcome')}
          required
          fullWidth
        >
          {desiredOutcomes.map((outcome) => (
            <MenuItem key={outcome.value} value={outcome.value}>
              {outcome.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Additional Details for Desired Outcome"
          multiline
          rows={2}
          value={formData.desiredOutcomeDetails}
          onChange={handleChange('desiredOutcomeDetails')}
          fullWidth
          placeholder="Please provide any specific details about your desired resolution..."
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Dispute'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DisputeForm;
