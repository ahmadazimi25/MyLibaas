import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  validateMessageContent,
  generateWarningMessage,
  isSpamOrSuspicious,
} from '../../utils/contentFilter';

// Higher-order component to add content filtering
const withContentFilter = (WrappedComponent) => {
  return function WithContentFilter(props) {
    const [warningOpen, setWarningOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [blockedContent, setBlockedContent] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleContentChange = (content, callback) => {
      // First check for spam or suspicious patterns
      const spamCheck = isSpamOrSuspicious(content, props.previousMessages);
      if (spamCheck.isSpam) {
        setWarningMessage('Your message appears to be spam or contains suspicious patterns.');
        setSnackbarOpen(true);
        return;
      }

      // Then validate the content
      const validation = validateMessageContent(content);
      if (!validation.isValid) {
        const warning = generateWarningMessage(validation.details);
        setWarningMessage(warning);
        setBlockedContent(content);
        setWarningOpen(true);
        return;
      }

      // If content is clean, proceed with the callback
      if (callback) {
        callback(content);
      }
    };

    const handleWarningClose = () => {
      setWarningOpen(false);
      setBlockedContent(null);
    };

    const handleSnackbarClose = () => {
      setSnackbarOpen(false);
    };

    return (
      <>
        <WrappedComponent
          {...props}
          onContentChange={handleContentChange}
        />

        {/* Warning Dialog for Blocked Content */}
        <Dialog
          open={warningOpen}
          onClose={handleWarningClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Content Not Allowed</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {warningMessage}
            </Alert>
            <p>
              For your security and to maintain platform integrity, we do not allow
              sharing of personal contact information. Please use our in-app
              messaging system for all communications.
            </p>
            <p>
              This helps us:
              <ul>
                <li>Protect you from fraud</li>
                <li>Ensure secure transactions</li>
                <li>Maintain a record of all communications</li>
                <li>Provide support if issues arise</li>
              </ul>
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleWarningClose} color="primary">
              I Understand
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Spam Warnings */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={warningMessage}
          action={
            <Button
              color="secondary"
              size="small"
              onClick={handleSnackbarClose}
            >
              Close
            </Button>
          }
        />
      </>
    );
  };
};

export default withContentFilter;
