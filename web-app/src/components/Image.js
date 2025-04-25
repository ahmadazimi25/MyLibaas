import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import PlaceholderImage from './PlaceholderImage';

const Image = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  borderRadius,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  if (error) {
    return <PlaceholderImage width={width} height={height} text={alt} />;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius,
        overflow: 'hidden',
      }}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            borderRadius,
          }}
        />
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          borderRadius,
        }}
        {...props}
      />
    </Box>
  );
};

export default Image;
