import React from 'react';
import { Box, Typography } from '@mui/material';

const PlaceholderImage = ({ width = '100%', height = '280px', text = 'Image not available' }) => {
  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16px 16px 0 0',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
};

export default PlaceholderImage;
