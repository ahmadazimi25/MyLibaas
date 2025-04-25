import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import CancellationPolicy from './CancellationPolicy';

const PolicySelector = ({ 
  policies = [], 
  selectedPolicyId = null,
  onSelect,
  loading = false,
  error = null
}) => {
  const [selected, setSelected] = useState(selectedPolicyId);

  const handleChange = (event) => {
    const newPolicyId = event.target.value;
    setSelected(newPolicyId);
  };

  const handleSubmit = () => {
    if (selected && onSelect) {
      onSelect(selected);
    }
  };

  const getSelectedPolicy = () => {
    return policies.find(policy => policy._id === selected);
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Choose a Cancellation Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select the cancellation policy that best suits your rental item. This will be shown to renters before they make a booking.
        </Typography>

        <RadioGroup
          value={selected || ''}
          onChange={handleChange}
        >
          <Stack spacing={2}>
            {policies.map((policy) => (
              <Paper
                key={policy._id}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: selected === policy._id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}
                onClick={() => setSelected(policy._id)}
              >
                <FormControlLabel
                  value={policy._id}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {policy.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {policy.name === 'flexible' && 'Best for items with high availability'}
                        {policy.name === 'moderate' && 'Balanced option for most items'}
                        {policy.name === 'strict' && 'Best for rare or high-value items'}
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    m: 0,
                    width: '100%',
                    '& .MuiFormControlLabel-label': {
                      width: '100%'
                    }
                  }}
                />
              </Paper>
            ))}
          </Stack>
        </RadioGroup>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selected || loading}
          sx={{ mt: 3 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Save Policy'
          )}
        </Button>
      </Paper>

      {selected && (
        <CancellationPolicy policy={getSelectedPolicy()} />
      )}
    </Stack>
  );
};

export default PolicySelector;
