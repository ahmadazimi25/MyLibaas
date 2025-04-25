import React from 'react';
import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

const LoadingState = ({ type = 'spinner', text, variant = 'default' }) => {
  const renderLoadingContent = () => {
    switch (type) {
      case 'skeleton':
        return (
          <Box sx={{ width: '100%' }}>
            {variant === 'listing' ? (
              <>
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
                <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="30%" />
                  </Box>
                </Box>
              </>
            ) : variant === 'profile' ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={80} height={80} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={100} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="80%" />
              </>
            ) : variant === 'booking' ? (
              <>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Skeleton variant="rectangular" width={120} height={120} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="text" width="30%" />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={60} />
              </>
            ) : (
              <>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </>
            )}
          </Box>
        );

      case 'progress':
        return (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <CircularProgress
              variant="determinate"
              value={75}
              size={60}
              thickness={4}
            />
            {text && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {text}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <CircularProgress size={40} />
            {text && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                {text}
              </Typography>
            )}
          </Box>
        );
    }
  };

  return renderLoadingContent();
};

export default LoadingState;
