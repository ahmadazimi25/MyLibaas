import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  RemoveRedEye as ViewIcon,
} from '@mui/icons-material';
import { useVerification } from '../../contexts/VerificationContext';
import { format } from 'date-fns';

const VerificationDetails = ({ verification, onClose, onAction }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = () => {
    onAction({
      verificationId: verification.id,
      action: 'approve'
    });
  };

  const handleReject = () => {
    onAction({
      verificationId: verification.id,
      action: 'reject',
      rejectionReason
    });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Verification Details</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* User Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Typography>Name: {verification.user.name}</Typography>
            <Typography>Email: {verification.user.email}</Typography>
          </Box>

          {/* Document Images */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Document Images
            </Typography>
            <Stack direction="row" spacing={2}>
              {verification.documentImages?.map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Selfie */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Selfie with ID
            </Typography>
            <Box
              component="img"
              src={verification.selfieImage}
              sx={{
                width: 200,
                height: 200,
                objectFit: 'cover',
              }}
            />
          </Box>

          {/* Address */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
            <Typography>
              {verification.address?.street}
              <br />
              {verification.address?.city}, {verification.address?.state}{' '}
              {verification.address?.postalCode}
              <br />
              {verification.address?.country}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Stack spacing={2} width="100%">
          {showRejectForm ? (
            <>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => setShowRejectForm(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleReject}
                  disabled={!rejectionReason}
                >
                  Confirm Rejection
                </Button>
              </Stack>
            </>
          ) : (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={onClose}>Close</Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => setShowRejectForm(true)}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={handleApprove}
              >
                Approve
              </Button>
            </Stack>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

const AdminVerification = () => {
  const {
    getPendingVerifications,
    reviewVerification,
    loading,
    error
  } = useVerification();

  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchVerifications();
  }, [page, rowsPerPage]);

  const fetchVerifications = async () => {
    const result = await getPendingVerifications({
      page: page + 1,
      limit: rowsPerPage
    });

    if (result.success) {
      setVerifications(result.verifications);
      setTotal(result.total);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleVerificationAction = async (params) => {
    const result = await reviewVerification(params);
    if (result.success) {
      setSelectedVerification(null);
      fetchVerifications();
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      verified: { color: 'success', label: 'Verified' },
      rejected: { color: 'error', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return <Chip size="small" color={config.color} label={config.label} />;
  };

  if (loading && verifications.length === 0) {
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

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Pending Verifications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Document Type</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>
                  <Stack>
                    <Typography variant="subtitle2">
                      {verification.user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {verification.user.email}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  {verification.documentType.replace('_', ' ')}
                </TableCell>
                <TableCell>
                  {format(new Date(verification.submittedAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{getStatusChip(verification.status)}</TableCell>
                <TableCell align="right">
                  <Button
                    startIcon={<ViewIcon />}
                    onClick={() => setSelectedVerification(verification)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {selectedVerification && (
        <VerificationDetails
          verification={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onAction={handleVerificationAction}
        />
      )}
    </Paper>
  );
};

export default AdminVerification;
