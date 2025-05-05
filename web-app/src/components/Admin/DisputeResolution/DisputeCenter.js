import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Gavel as DisputeIcon,
  Message as MessageIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useDatabase } from '../../../hooks/useDatabase';

const DISPUTE_STEPS = ['Reported', 'Under Review', 'Resolution Proposed', 'Resolved'];

const DisputeCenter = () => {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionDialog, setResolutionDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const { getActiveDisputes, updateDisputeStatus, sendDisputeMessage } = useDatabase();

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    const activeDisputes = await getActiveDisputes();
    setDisputes(activeDisputes);
  };

  const handleResolution = async () => {
    await updateDisputeStatus(selectedDispute.id, 'resolved', resolution);
    await sendDisputeMessage(selectedDispute.id, {
      type: 'RESOLUTION',
      content: resolution,
      timestamp: new Date()
    });
    loadDisputes();
    setResolutionDialog(false);
    setResolution('');
  };

  const DisputeCard = ({ dispute }) => {
    const getStepNumber = (status) => {
      return DISPUTE_STEPS.indexOf(status);
    };

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Dispute #{dispute.id.slice(-6)}
            </Typography>
            <Chip 
              label={dispute.status}
              color={dispute.status === 'Resolved' ? 'success' : 'warning'}
            />
          </Stack>

          <Stepper activeStep={getStepNumber(dispute.status)} sx={{ mb: 3 }}>
            {DISPUTE_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Issue
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dispute.issue}
              </Typography>
            </Box>

            <Divider />

            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Rental ID
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  #{dispute.rentalId}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Amount
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹{dispute.amount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Filed By
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dispute.reportedBy}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Communication History
              </Typography>
              <List>
                {dispute.messages?.map((message, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <MessageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={message.content}
                      secondary={new Date(message.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                onClick={() => {
                  setSelectedDispute(dispute);
                  setResolutionDialog(true);
                }}
              >
                Propose Resolution
              </Button>
              <Button
                variant="contained"
                startIcon={<MoneyIcon />}
                disabled={dispute.status === 'Resolved'}
              >
                Process Refund
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const ResolutionDialog = () => {
    if (!selectedDispute) return null;

    return (
      <Dialog 
        open={resolutionDialog} 
        onClose={() => setResolutionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Propose Resolution</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Dispute #{selectedDispute.id.slice(-6)}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Enter your proposed resolution..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolutionDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleResolution}
            disabled={!resolution.trim()}
          >
            Send Resolution
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">
          Dispute Resolution Center
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {disputes.length} active disputes
        </Typography>
      </Stack>

      {disputes.map((dispute) => (
        <DisputeCard key={dispute.id} dispute={dispute} />
      ))}

      <ResolutionDialog />
    </Box>
  );
};

export default DisputeCenter;
