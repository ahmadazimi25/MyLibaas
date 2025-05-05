import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Stack,
  Alert,
  Button,
  Chip,
  Divider
} from '@mui/material';
import { Send as SendIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { sanitizeMessage } from '../../utils/messageSanitizer';

const QUICK_RESPONSES = [
  'Is this item available?',
  'What are the exact measurements?',
  'Can you confirm the rental dates?',
  'Is temporary alteration allowed?'
];

const SecureChat = ({ conversationId, recipientUsername }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Sanitize message for personal information
    const { sanitizedContent, hasPersonalInfo } = sanitizeMessage(newMessage);

    if (hasPersonalInfo) {
      setError('Personal information is not allowed in messages');
      return;
    }

    try {
      // Send message logic here
      setMessages(prev => [...prev, {
        content: sanitizedContent,
        sender: currentUser.username,
        timestamp: new Date(),
        isOwn: true
      }]);
      setNewMessage('');
      setError('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  return (
    <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Chat with {recipientUsername}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Keep all communication within the platform
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.isOwn ? 'primary.main' : 'grey.100',
                color: message.isOwn ? 'white' : 'text.primary'
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" color={message.isOwn ? 'inherit' : 'text.secondary'}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Responses */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
          {QUICK_RESPONSES.map((response, index) => (
            <Chip
              key={index}
              label={response}
              onClick={() => setNewMessage(response)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            variant="outlined"
            size="small"
          />
          <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default SecureChat;
