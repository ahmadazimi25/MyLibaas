import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setStatus('sending');
      setError('');
      
      const result = await resetPassword(email);
      
      if (result.success) {
        setStatus('sent');
      } else {
        setError(result.error);
        setStatus('error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setStatus('error');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%'
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" align="center" gutterBottom>
            Reset Password
          </Typography>

          {status === 'sent' ? (
            <Stack spacing={3}>
              <Alert severity="success">
                Password reset email sent! Please check your inbox.
              </Alert>
              <Typography variant="body2" color="text.secondary" align="center">
                Follow the instructions in the email to reset your password.
                The link will expire after 1 hour.
              </Typography>
              <Button
                variant="outlined"
                onClick={handleBackToLogin}
              >
                Back to Login
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Typography variant="body1" color="text.secondary" align="center">
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>

                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}

                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'sending'}
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <Button
                  variant="text"
                  onClick={handleBackToLogin}
                  disabled={status === 'sending'}
                >
                  Back to Login
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default PasswordReset;
