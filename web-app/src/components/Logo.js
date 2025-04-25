import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';

const Logo = ({ size = 'medium', onClick }) => {
  const navigate = useNavigate();

  const sizes = {
    small: 32,
    medium: 40,
    large: 56,
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        height: sizes[size],
      }}
    >
      <img
        src={logoImage}
        alt="MyLibaas"
        style={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
};

export default Logo;
