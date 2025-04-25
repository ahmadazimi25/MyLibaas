import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const Message = ({ message, isOwn }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      mb: 2
    }}
  >
    {!isOwn && (
      <Avatar
        src={message.sender.photoURL}
        alt={message.sender.displayName}
        sx={{ width: 32, height: 32, mr: 1 }}
      />
    )}
    
    <Box
      sx={{
        maxWidth: '70%',
        backgroundColor: isOwn ? 'primary.main' : 'grey.100',
        color: isOwn ? 'white' : 'text.primary',
        borderRadius: 2,
        p: 1.5,
        position: 'relative'
      }}
    >
      {!isOwn && (
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {message.sender.displayName}
        </Typography>
      )}
      
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {message.content}
      </Typography>
      
      <Typography
        variant="caption"
        color={isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
        sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
      >
        {format(new Date(message.timestamp), 'HH:mm')}
      </Typography>
    </Box>

    {isOwn && (
      <Avatar
        src={message.sender.photoURL}
        alt={message.sender.displayName}
        sx={{ width: 32, height: 32, ml: 1 }}
      />
    )}
  </Box>
);

const ChatWindow = ({ conversation, currentUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={conversation.participant.photoURL}
            alt={conversation.participant.displayName}
          />
          <Box>
            <Typography variant="subtitle1">
              {conversation.participant.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {conversation.participant.online ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: 'background.default'
        }}
      >
        {conversation.messages.map((message, index) => (
          <Message
            key={message._id || index}
            message={message}
            isOwn={message.sender._id === currentUser._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box 
        component="form" 
        onSubmit={handleSend}
        sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 30,
              }
            }}
          />
          <IconButton 
            type="submit"
            color="primary"
            disabled={!newMessage.trim()}
            sx={{
              alignSelf: 'flex-end',
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark'
              },
              '&.Mui-disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ChatWindow;
