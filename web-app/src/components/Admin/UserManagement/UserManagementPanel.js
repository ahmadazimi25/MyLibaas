import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as VerifyIcon,
  Warning as WarnIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useDatabase } from '../../../hooks/useDatabase';

const UserManagementPanel = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialog, setActionDialog] = useState(null);
  const { getUsers, updateUserStatus } = useDatabase();

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]);

  const loadUsers = async () => {
    const fetchedUsers = await getUsers(page, rowsPerPage);
    setUsers(fetchedUsers);
  };

  const handleStatusChange = async (userId, newStatus) => {
    await updateUserStatus(userId, newStatus);
    loadUsers();
    setActionDialog(null);
  };

  const UserActionDialog = () => {
    if (!selectedUser || !actionDialog) return null;

    const actions = {
      block: {
        title: 'Block User',
        message: 'Are you sure you want to block this user?',
        action: () => handleStatusChange(selectedUser.id, 'blocked')
      },
      warn: {
        title: 'Warn User',
        message: 'Send warning message to user:',
        action: () => handleStatusChange(selectedUser.id, 'warned')
      },
      verify: {
        title: 'Verify User',
        message: 'Confirm user verification:',
        action: () => handleStatusChange(selectedUser.id, 'verified')
      }
    };

    const currentAction = actions[actionDialog];

    return (
      <Dialog open={true} onClose={() => setActionDialog(null)}>
        <DialogTitle>{currentAction.title}</DialogTitle>
        <DialogContent>
          <Typography>{currentAction.message}</Typography>
          {actionDialog === 'warn' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Warning Message"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button 
            onClick={currentAction.action}
            variant="contained" 
            color={actionDialog === 'block' ? 'error' : 'primary'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { color: 'success', label: 'Active' },
      blocked: { color: 'error', label: 'Blocked' },
      warned: { color: 'warning', label: 'Warned' },
      verified: { color: 'info', label: 'Verified' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <TextField
          size="small"
          placeholder="Search users..."
          sx={{ width: 300 }}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rentals</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {user.username}
                    {user.isVerified && (
                      <VerifyIcon color="primary" sx={{ width: 16 }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{getStatusChip(user.status)}</TableCell>
                <TableCell>{user.totalRentals}</TableCell>
                <TableCell>{user.rating.toFixed(1)} ⭐</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setActionDialog('block');
                      }}
                      color="error"
                    >
                      <BlockIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setActionDialog('warn');
                      }}
                      color="warning"
                    >
                      <WarnIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setActionDialog('verify');
                      }}
                      color="primary"
                    >
                      <VerifyIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <UserActionDialog />
    </Box>
  );
};

export default UserManagementPanel;
