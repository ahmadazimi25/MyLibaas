import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Email as EmailIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../services/firebase/firebaseConfig';

const EmailVerification = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, resendVerificationEmail } = useAuth();

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const code = params.get('oobCode'); // Firebase's verification code

      if (!code) {
        setStatus('no_code');
        return;
      }

      setStatus('verifying');
      await applyActionCode(auth, code);
      
      // Force token refresh to update emailVerified status
      if (user) {
        await user.reload();
      }
      
      setStatus('success');
      setMessage('Email verified successfully!');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Verification error:', err);
      setError(getErrorMessage(err.code));
      setStatus('error');
    }
  };

  const handleResendVerification = async () => {
    try {
      setStatus('sending');
      const result = await resendVerificationEmail();
      
      if (result.success) {
        setMessage('Verification email sent successfully!');
        setStatus('sent');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-action-code':
        return 'The verification link is invalid or has expired.';
      case 'auth/user-not-found':
        return 'User not found.';
      case 'auth/expired-action-code':
        return 'The verification link has expired.';
      default:
        return 'An error occurred during verification.';
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
      case 'verifying':
      case 'sending':
        return (
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography>
              {status === 'checking' ? 'Checking verification status...' :
               status === 'verifying' ? 'Verifying your email...' :
               'Sending verification email...'}
            </Typography>
          </Stack>
        );

      case 'success':
        return (
          <Stack spacing={2} alignItems="center">
            <Alert severity="success" sx={{ width: '100%' }}>
              {message}
            </Alert>
            <Typography>
              Redirecting you to the homepage...
            </Typography>
          </Stack>
        );

      case 'sent':
        return (
          <Stack spacing={2} alignItems="center">
            <Alert severity="success" sx={{ width: '100%' }}>
              {message}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Please check your email inbox and spam folder.
            </Typography>
          </Stack>
        );

      case 'error':
        return (
          <Stack spacing={2} alignItems="center">
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResendVerification}
              disabled={!user}
            >
              Resend Verification Email
            </Button>
          </Stack>
        );

      case 'no_code':
        return (
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6" gutterBottom>
              Email Verification Required
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Please verify your email address to access all features.
              Check your inbox for the verification link.
            </Typography>
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={handleResendVerification}
              disabled={!user}
            >
              Send Verification Email
            </Button>
          </Stack>
        );

      default:
        return null;
    }
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
          width: '100%',
          textAlign: 'center'
        }}
      >
        {renderContent()}
      </Paper>
    </Box>
  );
};

export default EmailVerification;
