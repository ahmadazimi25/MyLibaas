import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  InputAdornment,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import withContentFilter from '../Common/withContentFilter';

const MessageInput = ({ onSend, onContentChange, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Use the content filter HOC's onContentChange
    onContentChange(message.trim(), (validContent) => {
      onSend(validContent);
      setMessage('');
    });
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <IconButton size="small" disabled={disabled}>
        <AttachIcon />
      </IconButton>
      
      <IconButton size="small" disabled={disabled}>
        <EmojiIcon />
      </IconButton>

      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Type your message here..."
        variant="outlined"
        size="small"
        InputProps={{
          sx: { borderRadius: 2 },
        }}
      />

      <IconButton
        color="primary"
        disabled={!message.trim() || disabled}
        onClick={handleSubmit}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  );
};

// Wrap the MessageInput with content filtering
export default withContentFilter(MessageInput);
