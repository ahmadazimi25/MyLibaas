import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  PhoneAndroid as MobileIcon,
  DesktopWindows as DesktopIcon,
} from '@mui/icons-material';
import { emailTemplates } from '../../utils/emailTemplates';

const sampleData = {
  dispute: {
    created: {
      disputeId: 'DSP123',
      bookingId: 'BKG456',
      userName: 'John Doe',
      type: 'Item Condition',
      createdAt: new Date(),
      amount: 150.00,
      disputeUrl: '#',
    },
    resolved: {
      disputeId: 'DSP123',
      bookingId: 'BKG456',
      userName: 'John Doe',
      resolutionType: 'Partial Refund',
      resolvedAt: new Date(),
      amount: 75.00,
      resolutionDetails: 'Both parties agreed to a 50% refund.',
      disputeUrl: '#',
    },
  },
  damage: {
    reported: {
      bookingId: 'BKG456',
      userName: 'John Doe',
      itemName: 'Designer Dress',
      reportedAt: new Date(),
      estimatedCost: 200.00,
      reportUrl: '#',
    },
  },
  verification: {
    submitted: {
      userName: 'John Doe',
      submittedAt: new Date(),
      documentType: 'Driver\'s License',
      statusUrl: '#',
    },
    approved: {
      userName: 'John Doe',
      approvedAt: new Date(),
      verificationLevel: 'Full',
      dashboardUrl: '#',
    },
  },
  payment: {
    received: {
      userName: 'John Doe',
      bookingId: 'BKG456',
      amount: 300.00,
      paidAt: new Date(),
      paymentMethod: 'Visa •••• 1234',
      receiptUrl: '#',
    },
    refunded: {
      userName: 'John Doe',
      amount: 300.00,
      refundedAt: new Date(),
      paymentMethod: 'Visa •••• 1234',
      reason: 'Cancellation',
      receiptUrl: '#',
    },
  },
};

const EmailPreview = ({ open, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('dispute.created');
  const [viewMode, setViewMode] = useState('desktop');

  const handleTemplateChange = (event) => {
    setSelectedTemplate(event.target.value);
  };

  const [category, action] = selectedTemplate.split('.');
  const template = emailTemplates[category][action];
  const { subject, html } = template(sampleData[category][action]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Email Template Preview</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              label="Template"
            >
              <MenuItem value="dispute.created">Dispute Created</MenuItem>
              <MenuItem value="dispute.resolved">Dispute Resolved</MenuItem>
              <MenuItem value="damage.reported">Damage Reported</MenuItem>
              <MenuItem value="verification.submitted">Verification Submitted</MenuItem>
              <MenuItem value="verification.approved">Verification Approved</MenuItem>
              <MenuItem value="payment.received">Payment Received</MenuItem>
              <MenuItem value="payment.refunded">Payment Refunded</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setViewMode('desktop')}
              color={viewMode === 'desktop' ? 'primary' : 'default'}
            >
              <DesktopIcon />
            </IconButton>
            <IconButton
              onClick={() => setViewMode('mobile')}
              color={viewMode === 'mobile' ? 'primary' : 'default'}
            >
              <MobileIcon />
            </IconButton>
          </Box>
        </Box>

        <Paper
          elevation={3}
          sx={{
            width: viewMode === 'mobile' ? 375 : '100%',
            mx: 'auto',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Subject: {subject}
            </Typography>
          </Box>
          <Divider />
          <Box
            sx={{
              p: 3,
              maxHeight: 'calc(90vh - 250px)',
              overflowY: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailPreview;
