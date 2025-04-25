import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Badge,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';

const MessageCenter = () => {
  const theme = useTheme();
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      user: {
        id: 'user1',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg'
      },
      lastMessage: "Hi! I'm interested in renting the embroidered dress.",
      unread: 2,
      timestamp: '10:25 AM'
    },
    {
      id: 2,
      user: {
        id: 'user2',
        name: 'Michael Chen',
        avatar: '/avatars/michael.jpg'
      },
      lastMessage: 'When can I pick up the suit?',
      unread: 0,
      timestamp: 'Yesterday'
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 'other',
      text: "Hi! I'm interested in renting the embroidered dress.",
      timestamp: '10:25 AM'
    },
    {
      id: 2,
      senderId: 'me',
      text: "Hello! Yes, it's available. When would you like to rent it?",
      timestamp: '10:26 AM'
    },
    {
      id: 3,
      senderId: 'other',
      text: 'I was thinking next weekend, from Friday to Sunday.',
      timestamp: '10:28 AM'
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Add message handling logic here
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      <Paper sx={{ 
        display: 'flex',
        height: 'calc(100vh - 140px)',
        overflow: 'hidden'
      }}>
        {/* Conversations List */}
        <Box sx={{ 
          width: 300,
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'auto'
        }}>
          <List sx={{ p: 0 }}>
            {conversations.map((conversation, index) => (
              <React.Fragment key={conversation.id}>
                <ListItem
                  button
                  selected={selectedConversation === index}
                  onClick={() => setSelectedConversation(index)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unread}
                      color="error"
                      invisible={!conversation.unread}
                    >
                      <Avatar src={conversation.user.avatar} alt={conversation.user.name} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.user.name}
                    secondary={conversation.lastMessage}
                    secondaryTypographyProps={{
                      noWrap: true,
                      style: {
                        maxWidth: '180px'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {conversation.timestamp}
                  </Typography>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Messages Area */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Messages Header */}
          <Box sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.default'
          }}>
            <Typography variant="h6">
              {conversations[selectedConversation]?.user.name}
            </Typography>
          </Box>

          {/* Messages List */}
          <Box sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            backgroundColor: 'grey.50'
          }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.senderId === 'me' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.senderId === 'me' ? 'primary.main' : 'background.paper',
                    color: message.senderId === 'me' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1">
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: message.senderId === 'me' ? 'primary.contrastText' : 'text.secondary'
                    }}
                  >
                    {message.timestamp}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Message Input */}
          <Box sx={{
            p: 2,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1
            }}>
              <IconButton size="small">
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                variant="outlined"
                size="small"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default MessageCenter;
