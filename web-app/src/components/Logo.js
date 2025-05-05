import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import logoImage from '../assets/mylibaas-logo.jpg'; 

const LogoImage = styled('img')(({ theme, size }) => ({
  height: size === 'small' ? '120px' :
         size === 'medium' ? '200px' :
         size === 'large' ? '300px' : '200px',
  width: 'auto',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  filter: 'brightness(1.1) contrast(1.1)', 
  mixBlendMode: 'darken', 
  WebkitBackgroundClip: 'content-box',
  backgroundClip: 'content-box',
  objectFit: 'contain',
  '&:hover': {
    transform: 'scale(1.05) rotate(2deg)',
    filter: 'brightness(1.2) contrast(1.15)',
  }
}));

const Logo = ({ size = 'medium', onClick }) => {
  return (
    <Box 
      component="div" 
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: '4px'
      }}
    >
      <LogoImage
        src={logoImage}
        alt="myLibaas"
        size={size}
      />
    </Box>
  );
};

export default Logo;
