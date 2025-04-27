import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as UnreadIcon,
  Gavel as DisputeIcon,
  Warning as DamageIcon,
  VerifiedUser as VerificationIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'dispute':
      return <DisputeIcon />;
    case 'damage':
      return <DamageIcon />;
    case 'verification':
      return <VerificationIcon />;
    case 'payment':
      return <PaymentIcon />;
    default:
      return <NotificationsIcon />;
  }
};

const NotificationItem = ({ notification, onRead }) => {
  const handleClick = () => {
    onRead(notification.id);
    // Handle navigation based on notification type and data
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  return (
    <ListItem
      button
      onClick={handleClick}
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
    >
      <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
      <ListItemText
        primary={notification.title}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{ display: 'block' }}
            >
              {notification.message}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
            >
              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
            </Typography>
          </>
        }
      />
      {!notification.read && (
        <UnreadIcon
          sx={{
            fontSize: 12,
            color: 'primary.main',
            ml: 1,
          }}
        />
      )}
    </ListItem>
  );
};

const NotificationCenter = () => {
  const {
    notifications,
    loading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const result = await getNotifications({
      page: 1,
      limit: 10,
    });

    if (result.success) {
      setUnreadCount(result.unreadCount);
    }
  }, [getNotifications, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading && notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications to display
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onRead={handleMarkAsRead}
                />
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;
