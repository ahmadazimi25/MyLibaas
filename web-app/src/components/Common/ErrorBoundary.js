import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to your error reporting service
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    // TODO: Implement error logging service
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReport = () => {
    // TODO: Implement error reporting
    const errorReport = {
      error: this.state.error?.toString(),
      errorInfo: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.log('Reporting error:', errorReport);
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 4,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <ErrorIcon
              color="error"
              sx={{ fontSize: 64, mb: 2 }}
            />
            
            <Typography variant="h5" gutterBottom>
              {this.props.title || 'Oops! Something went wrong'}
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
            >
              {this.props.message ||
                'We apologize for the inconvenience. Please try again or contact support if the problem persists.'}
            </Typography>

            {process.env.NODE_ENV === 'development' && (
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error?.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleReport}
              >
                Report Issue
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
