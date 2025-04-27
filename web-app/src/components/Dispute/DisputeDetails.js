import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  PhotoLibrary as GalleryIcon,
  WarningAmber as EscalateIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useDispute } from '../../contexts/DisputeContext';

const statusColors = {
  pending: 'warning',
  resolved: 'success',
  escalated: 'error',
  closed: 'default',
};

const MessageBubble = ({ message, isCurrentUser }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
      mb: 2,
    }}
  >
    <Box
      sx={{
        maxWidth: '70%',
        bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
        color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="body2" gutterBottom>
        {message.content}
      </Typography>
      {message.attachments?.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {message.attachments.map((attachment, index) => (
            <Box
              key={index}
              component="img"
              src={attachment}
              sx={{
                width: 100,
                height: 100,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          ))}
        </Stack>
      )}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: isCurrentUser ? 'right' : 'left',
          mt: 1,
          color: isCurrentUser ? 'primary.light' : 'text.secondary',
        }}
      >
        {format(new Date(message.createdAt), 'MMM d, h:mm a')}
      </Typography>
    </Box>
  </Box>
);

const ResolutionDialog = ({ open, onClose, onSubmit }) => {
  const [resolution, setResolution] = useState('');
  const [compensation, setCompensation] = useState('');

  const handleSubmit = () => {
    onSubmit({ resolution, compensation: parseFloat(compensation) });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Propose Resolution</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Resolution Details"
            multiline
            rows={4}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            fullWidth
          />
          <TextField
            label="Compensation Amount ($)"
            type="number"
            value={compensation}
            onChange={(e) => setCompensation(e.target.value)}
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!resolution || !compensation}
        >
          Propose Resolution
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EscalationDialog = ({ open, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState([]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const images = files.map((file) => URL.createObjectURL(file));
    setEvidence((prev) => [...prev, ...images]);
  };

  const handleSubmit = () => {
    onSubmit({ reason, evidence });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Escalate Dispute</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Reason for Escalation"
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
          />
          <Button
            variant="outlined"
            startIcon={<GalleryIcon />}
            component="label"
          >
            Add Evidence
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </Button>
          {evidence.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {evidence.map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={!reason}
        >
          Escalate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DisputeDetails = ({ disputeId }) => {
  const {
    getDispute,
    addDisputeMessage,
    proposeResolution,
    escalateDispute,
    loading,
    error,
  } = useDispute();

  const [dispute, setDispute] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);

  const fetchDispute = useCallback(async () => {
    const result = await getDispute(disputeId);
    if (result.success) {
      setDispute(result.dispute);
    }
  }, [disputeId, getDispute]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const result = await addDisputeMessage({
      disputeId,
      content: newMessage,
      attachments,
    });

    if (result.success) {
      setNewMessage('');
      setAttachments([]);
      fetchDispute();
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const images = files.map((file) => URL.createObjectURL(file));
    setAttachments((prev) => [...prev, ...images]);
  };

  const handleProposeResolution = async (data) => {
    const result = await proposeResolution({
      disputeId,
      ...data,
    });

    if (result.success) {
      fetchDispute();
    }
  };

  const handleEscalate = async (data) => {
    const result = await escalateDispute({
      disputeId,
      ...data,
    });

    if (result.success) {
      fetchDispute();
    }
  };

  if (loading && !dispute) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!dispute) return null;

  return (
    <Paper sx={{ p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5">Dispute Details</Typography>
          <Chip
            label={dispute.status}
            color={statusColors[dispute.status]}
          />
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Typography variant="subtitle1" gutterBottom>
          {dispute.type.replace('_', ' ')} Issue
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {dispute.description}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => setShowResolutionDialog(true)}
          >
            Propose Resolution
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<EscalateIcon />}
            onClick={() => setShowEscalationDialog(true)}
          >
            Escalate
          </Button>
        </Stack>
      </Box>

      <Divider />

      {/* Messages Section */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', my: 2 }}>
        <Stack spacing={2}>
          {dispute.messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender === 'renter'}
            />
          ))}
        </Stack>
      </Box>

      {/* Message Input */}
      <Box sx={{ mt: 2 }}>
        {attachments.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
          >
            {attachments.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            ))}
          </Stack>
        )}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <IconButton component="label">
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <AttachIcon />
          </IconButton>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && attachments.length === 0}
          >
            Send
          </Button>
        </Stack>
      </Box>

      <ResolutionDialog
        open={showResolutionDialog}
        onClose={() => setShowResolutionDialog(false)}
        onSubmit={handleProposeResolution}
      />

      <EscalationDialog
        open={showEscalationDialog}
        onClose={() => setShowEscalationDialog(false)}
        onSubmit={handleEscalate}
      />
    </Paper>
  );
};

export default DisputeDetails;
