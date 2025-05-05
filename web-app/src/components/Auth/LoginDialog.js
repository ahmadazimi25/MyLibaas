import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

const LoginDialog = ({ open, onClose, onSwitchToRegister }) => {
  const { login, signInWithGoogle, signInWithFacebook, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const result = await login(email, password);
      
      if (!result.success) {
        if (result.needsVerification) {
          setNeedsVerification(true);
          return;
        }
        setError(result.error);
        return;
      }
      
      onClose();
    } catch (err) {
      setError('Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      setLoading(true);
      
      const result = await (provider === 'google' ? signInWithGoogle() : signInWithFacebook());
      
      if (!result.success) {
        if (result.needsVerification) {
          setNeedsVerification(true);
          return;
        }
        setError(result.error);
        return;
      }
      
      onClose();
    } catch (err) {
      setError('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const result = await resendVerificationEmail();
      if (result.success) {
        navigate('/verify-email');
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontFamily: "'DM Serif Display', serif" }}>
        Welcome Back
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {needsVerification ? (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please verify your email before logging in.
            </Alert>
            <Button
              onClick={handleResendVerification}
              variant="outlined"
              disabled={loading}
            >
              Resend Verification Email
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Continue with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
              >
                Continue with Facebook
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <form onSubmit={handleSubmit}>
              <TextField
                autoFocus
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 1 }}
              />
              <Box sx={{ textAlign: 'right', mb: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  underline="hover"
                >
                  Forgot Password?
                </Link>
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login with Email'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Button
                  color="primary"
                  onClick={onSwitchToRegister}
                  sx={{ textTransform: 'none' }}
                >
                  Sign Up
                </Button>
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
