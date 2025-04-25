import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import ContentViolationService from '../../../services/ContentViolationService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from 'recharts';

const ViolationsDashboard = () => {
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [timeframe, refreshKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await ContentViolationService.getViolationStats(timeframe);
      setStats(stats);
      // TODO: Implement pagination in the service
      const violations = await ContentViolationService.getViolations(page, rowsPerPage);
      setViolations(violations);
    } catch (error) {
      console.error('Error loading violation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViolationClick = (violation) => {
    setSelectedViolation(violation);
  };

  const handleActionSubmit = async (action) => {
    try {
      await ContentViolationService.updateViolation(selectedViolation.id, {
        status: action,
        reviewed: true,
        reviewedAt: new Date(),
      });
      setSelectedViolation(null);
      loadData();
    } catch (error) {
      console.error('Error updating violation:', error);
    }
  };

  const renderStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Violations
            </Typography>
            <Typography variant="h4">
              {stats?.total || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              ML Detection Rate
            </Typography>
            <Typography variant="h4">
              {stats?.byDetectionMethod?.ml 
                ? Math.round((stats.byDetectionMethod.ml / stats.total) * 100)
                : 0}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pattern Detection Rate
            </Typography>
            <Typography variant="h4">
              {stats?.byDetectionMethod?.pattern
                ? Math.round((stats.byDetectionMethod.pattern / stats.total) * 100)
                : 0}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              User Reports
            </Typography>
            <Typography variant="h4">
              {stats?.byDetectionMethod?.reported || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderViolationsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Detection Method</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {violations.map((violation) => (
            <TableRow key={violation.id}>
              <TableCell>
                {new Date(violation.timestamp).toLocaleDateString()}
              </TableCell>
              <TableCell>{violation.userId}</TableCell>
              <TableCell>
                <Chip
                  label={violation.violationType}
                  color={getViolationTypeColor(violation.violationType)}
                  size="small"
                />
              </TableCell>
              <TableCell>{violation.content.substring(0, 50)}...</TableCell>
              <TableCell>
                <Chip
                  label={violation.detectionMethod}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={violation.status}
                  color={getStatusColor(violation.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleViolationClick(violation)}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={stats?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </TableContainer>
  );

  const renderViolationDialog = () => (
    <Dialog
      open={!!selectedViolation}
      onClose={() => setSelectedViolation(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Review Violation</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">User ID</Typography>
            <Typography>{selectedViolation?.userId}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Violation Type</Typography>
            <Typography>{selectedViolation?.violationType}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Content</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography>{selectedViolation?.content}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Context</Typography>
            <Typography>{selectedViolation?.context}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => handleActionSubmit('dismissed')}
          color="primary"
        >
          Dismiss
        </Button>
        <Button
          onClick={() => handleActionSubmit('warning')}
          color="warning"
        >
          Issue Warning
        </Button>
        <Button
          onClick={() => handleActionSubmit('restricted')}
          color="error"
        >
          Restrict User
        </Button>
        <Button
          onClick={() => handleActionSubmit('banned')}
          color="error"
          variant="contained"
        >
          Ban User
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Content Violations Dashboard</Typography>
        <Box>
          <FormControl size="small" sx={{ mr: 2 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {stats && renderStats()}
      {renderViolationsTable()}
      {renderViolationDialog()}
    </Box>
  );
};

const getViolationTypeColor = (type) => {
  switch (type) {
    case 'personal_info':
      return 'error';
    case 'spam':
      return 'warning';
    case 'evasion':
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending_review':
      return 'warning';
    case 'dismissed':
      return 'default';
    case 'warning':
      return 'info';
    case 'restricted':
      return 'error';
    case 'banned':
      return 'error';
    default:
      return 'default';
  }
};

export default ViolationsDashboard;
