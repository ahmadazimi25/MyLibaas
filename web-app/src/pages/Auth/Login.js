import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginDialog from '../../components/Auth/LoginDialog';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('User already logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleClose = () => {
    setOpen(false);
    navigate('/');
  };

  const handleSwitchToRegister = () => {
    navigate('/signup');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LoginDialog
          open={open}
          onClose={handleClose}
          onSwitchToRegister={handleSwitchToRegister}
        />
      </Box>
    </Container>
  );
};

export default Login;
